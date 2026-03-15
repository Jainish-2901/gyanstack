const Groq = require('groq-sdk');
const Content = require('../models/contentModel');
const Category = require('../models/categoryModel');
const Request = require('../models/requestModel');
const User = require('../models/userModel');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

exports.getAiResponse = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq API Key (GROQ_API_KEY) is missing in backend .env' });
    }

    // 1. Fetch context from DB to make AI "GyanStack Aware"
    const [categories, allContent, topUploaders] = await Promise.all([
      Category.find().select('name _id'),
      Content.find().select('title type _id categoryId').sort({ createdAt: -1 }).limit(200),
      User.find({ role: { $in: ['admin', 'superadmin'] } }).select('username _id').limit(20)
    ]);

    // Build category ID → name map
    const catIdToName = {};
    categories.forEach(c => { catIdToName[c._id.toString()] = c.name; });

    // Group all content by category
    const contentByCategory = {};
    allContent.forEach(item => {
      const catName = catIdToName[item.categoryId?.toString()] || 'Other';
      if (!contentByCategory[catName]) contentByCategory[catName] = [];
      contentByCategory[catName].push({ title: item.title, path: `/content/${item._id}` });
    });

    // Build the categorised content summary for AI
    const categorizedContentSummary = categories.map(c => {
      const items = contentByCategory[c.name] || [];
      const itemList = items.map(i => `    - "${i.title}" → ${i.path}`).join('\n');
      return `  📁 ${c.name} (Browse all: /browse?category=${c._id})\n${itemList || '    (no content yet)'}`;
    }).join('\n\n');

    const uploaderList = topUploaders.map(u => `${u.username} (Profile: /uploader/${u._id})`).join(' | ');

    const systemInstruction = `
      You are "GyanStack AI Assistant", a friendly academic guide for GyanStack - an educational platform for sharing study materials.

      ══════════════════════════════════════════
      RULE #1 — NAVIGATION (HIGHEST PRIORITY):
      ══════════════════════════════════════════
      If the user uses ANY of these words: "open", "go to", "go", "take me", "navigate", "show me", "find content", "browse", "look for", "search for", "open content", "show content" 
      → You MUST call 'navigate_to_page' or 'show_selections'. NEVER respond with text or call submit_content_request.

      NAVIGATION DECISION:
      - CLEAR match (one category/page/content) → Call 'navigate_to_page'.
      - AMBIGUOUS (matches multiple or broadly) → Call 'show_selections' with 2–5 options.
      
      LABELING RULE: When calling 'show_selections', the "label" for each option MUST be a clean, human-readable name ONLY (e.g. "ASP.NET Practical"). 
      ❌ NEVER include IDs, paths, or URLs in the "label" field.

      AVAILABLE CATEGORIES & CONTENT (use exact paths for navigation): 
      ${categorizedContentSummary}

      KNOWN UPLOADERS (for profile navigation):
      ${uploaderList || 'No uploaders listed yet.'}

      STATIC PAGES:
      * Home → /
      * Browse all → /browse
      * Announcements → /announcements
      * Login → /login
      * Sign up → /signup
      * Contact → /contact
      * Request Form → /request
      * Dashboard → /dashboard
      * Saved Content → /dashboard/saved
      * My Inquiries → /dashboard/inquiries
      * Profile Settings → /settings

      ══════════════════════════════════════════
      RULE #2 — CONTENT REQUEST (VERY STRICT):
      ══════════════════════════════════════════
      ONLY call 'submit_content_request' if the user EXPLICITLY says one of:
      - "make a request for X"
      - "submit a request for X"
      - "file a request for X"
      - "please request X"
      DO NOT call submit_content_request just because something is missing. 
      Ask the user: "Would you like me to submit a formal request for this?"

      ══════════════════════════════════════════
      RULE #3 — STUDY HELP:
      ══════════════════════════════════════════
      - Answer academic questions concisely.
      - Link documents using markdown: [Title](/content/id).
      - If unavailable, say so. Do NOT invent content.
    `;

    // 2. Define Tools for Groq
    const tools = [
      {
        type: "function",
        function: {
          name: "submit_content_request",
          description: "Submits a formal request for specific academic content (notes, videos, etc.) on behalf of the user.",
          parameters: {
            type: "object",
            properties: {
              topic: { type: "string", description: "The title or subject of the requested content (e.g. 'BCA Sem 4 SQL Notes')" },
              message: { type: "string", description: "A brief reason or additional details for the request." }
            },
            required: ["topic"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "navigate_to_page",
          description: "Navigates the user directly to a specific, clearly identified page, category, content item, or profile.",
          parameters: {
            type: "object",
            properties: {
              path: { type: "string", description: "The URL path (e.g. '/browse?category=123', '/content/abc', '/uploader/xyz')" },
              label: { type: "string", description: "Short human-readable name for the destination" }
            },
            required: ["path", "label"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "show_selections",
          description: "When the user's request is ambiguous or matches multiple results, show them a list of options to choose from instead of guessing.",
          parameters: {
            type: "object",
            properties: {
              prompt: { type: "string", description: "A short question to show the user, e.g. 'Which one did you mean?'" },
              options: {
                type: "array",
                description: "The list of options for the user to pick from (max 6)",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string", description: "Human-readable option label" },
                    path: { type: "string", description: "URL path for this option" }
                  },
                  required: ["label", "path"]
                }
              }
            },
            required: ["prompt", "options"]
          }
        }
      }
    ];

    let messages = [
      { role: "system", content: systemInstruction },
      ...(chatHistory || []).map(item => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: item.content
      })),
      { role: "user", content: message }
    ];

    // 3. Get Completion with Tools from Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant",
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseMsg = chatCompletion.choices[0].message;

    // --- FALLBACK: Parse XML-style tool call from content (Llama sometimes uses this format) ---
    let effectiveToolCall = responseMsg.tool_calls?.[0] || null;
    if (!effectiveToolCall && responseMsg.content) {
      const xmlMatch = responseMsg.content.match(/<(navigate_to_page|submit_content_request|show_selections)>\s*([\s\S]*?)\s*<\/\1>/);
      if (xmlMatch) {
        try {
          effectiveToolCall = {
            function: { name: xmlMatch[1], arguments: xmlMatch[2] }
          };
        } catch (e) { /* ignore parse errors */ }
      }
    }

    // 4. Handle Tool Calls
    if (effectiveToolCall) {

      // --- NAVIGATE TOOL ---
      if (effectiveToolCall.function.name === 'navigate_to_page') {
        const args = JSON.parse(effectiveToolCall.function.arguments);
        return res.json({
          reply: `Sure! Taking you to **${args.label}** now... 🚀\n\n👉 [Click here if not redirected automatically](${args.path})`,
          action: { type: 'navigate', path: args.path }
        });
      }

      // --- SELECTIONS TOOL ---
      if (effectiveToolCall.function.name === 'show_selections') {
        const args = JSON.parse(effectiveToolCall.function.arguments);
        return res.json({
          reply: args.prompt || 'Here are the best matches I found. Which one did you mean?',
          action: { type: 'selections', options: args.options }
        });
      }

      // --- SUBMIT REQUEST TOOL ---
      if (effectiveToolCall.function.name === 'submit_content_request') {
        
        // CHECK LOGIN STATUS
        if (!req.user) {
          return res.json({ 
            reply: "I'd really like to help you with that request, but you need to be logged in first! Please log in so I can submit this for you. 🛡️" 
          });
        }

        const args = JSON.parse(effectiveToolCall.function.arguments);
        
        try {
          const newRequest = new Request({
            topic: args.topic,
            message: args.message || `Requested via AI Assistant: ${message}`,
            requestedBy: req.user._id,
          });
          await newRequest.save();

          messages.push(responseMsg);
          messages.push({
            tool_call_id: effectiveToolCall.id || 'fallback',
            role: "tool",
            name: "submit_content_request",
            content: `SUCCESS: Your request has been submitted. Summary - Topic: ${args.topic}${args.message ? `, Message: ${args.message}` : ''}`
          });

          const finalCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.1-8b-instant",
          });

          return res.json({ reply: finalCompletion.choices[0].message.content });

        } catch (dbErr) {
          console.error("DB Request Error:", dbErr);
          return res.status(500).json({ message: "I tried to submit your request but hit a technical snag. Please try the manual request form." });
        }
      }
    }

    // Strip any leftover XML tool call tags from the plain text response
    const cleanReply = (responseMsg.content || '').replace(/<(navigate_to_page|submit_content_request)>[\s\S]*?<\/\1>/g, '').trim();
    return res.json({ reply: cleanReply || "I'm not sure how to help with that. Try rephrasing!" });

  } catch (err) {
    console.error("Groq Tool Error:", err.message);
    if (err.message?.includes('429')) {
      return res.status(429).json({ message: 'AI is a bit busy. Please wait a few seconds.' });
    }
    res.status(500).json({ message: 'AI Assistant encountered an error.' });
  }
};
