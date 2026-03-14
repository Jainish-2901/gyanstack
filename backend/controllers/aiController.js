const Groq = require('groq-sdk');
const Content = require('../models/contentModel');
const Category = require('../models/categoryModel');
const Request = require('../models/requestModel');

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

    // 1. Fetch some context from DB to make AI "GyanStack Aware"
    const categories = await Category.find().select('name');
    const recentUploads = await Content.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title type _id');

    const categoryNames = categories.map(c => c.name).join(', ');
    const uploadSummary = recentUploads.map(r => `${r.title} (Type: ${r.type}, Link: /content/${r._id})`).join(' | ');

    const systemInstruction = `
      You are "GyanStack AI Assistant", a friendly academic guide for GyanStack - an educational platform for sharing study materials.
      
      STRICT DATA RULES:
      1. ONLY mention these categories as available: ${categoryNames}.
      2. ONLY mention these documents as available: ${uploadSummary}.
      3. LINKING: When mentioning a document from the list above, you MUST provide a markdown link. Example: [SQL Solutions](/content/123).
      4. If a user asks for something NOT listed above, tell them it is currently unavailable. 
      5. IMPORTANT - TOOL USE: You must only call 'submit_content_request' if the user EXPLICITLY asks you to "make a request", "submit a request", or "please file a request for this". Do NOT call it just because content is missing. Ask them first: "Would you like me to submit a formal request for this?"
      6. Handle users with care and professionalism.

      Your goals:
      1. Help users find relevant documents from the available list.
      2. Suggest effective study strategies (concise and professional).
      3. Encourage users to upload their own notes to help the GyanStack community.
      4. Ensure all shared links use the markdown [Title](URL) format. 
      5. CONFIRMATION FORMAT: When you successfully submit a request, you MUST show the summary in this EXACT format:
         Topic: [The Topic Name]
         Message: [The Message Details]
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

    // 4. Handle Tool Calls
    if (responseMsg.tool_calls) {
      const toolCall = responseMsg.tool_calls[0];
      if (toolCall.function.name === 'submit_content_request') {
        
        // CHECK LOGIN STATUS
        if (!req.user) {
          return res.json({ 
            reply: "I'd really like to help you with that request, but you need to be logged in first! Please log in so I can submit this for you. 🛡️" 
          });
        }

        const args = JSON.parse(toolCall.function.arguments);
        
        try {
          const newRequest = new Request({
            topic: args.topic,
            message: args.message || `Requested via AI Assistant: ${message}`,
            requestedBy: req.user._id,
          });
          await newRequest.save();

          // Add tool result to conversation and get final AI response
          messages.push(responseMsg);
          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: "submit_content_request",
            content: `SUCCESS: Your request has been submitted. Summary - Topic: ${args.topic}${args.message ? `, Message: ${args.message}` : ''}`
          });

          // Final follow-up completion
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

    return res.json({ reply: responseMsg.content });

  } catch (err) {
    console.error("Groq Tool Error:", err.message);
    if (err.message?.includes('429')) {
      return res.status(429).json({ message: 'AI is a bit busy. Please wait a few seconds.' });
    }
    res.status(500).json({ message: 'AI Assistant encountered an error.' });
  }
};
