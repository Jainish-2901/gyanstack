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

    // 1. Fetch context (Efficient Full Vision - 300 items)
    const [categories, allContent] = await Promise.all([
      Category.find().select('name _id parentId'),
      Content.find().select('title _id categoryId').sort({ createdAt: -1 }).limit(300)
    ]);

    // 1b. Build exact mapping (Key: Category_ID)
    const catFiles = {};
    const catSubs = {};
    const masterMap = {}; // Security mapping

    categories.forEach(c => {
        const id = c._id.toString();
        const pId = c.parentId?.toString();
        if (pId && pId !== 'root') {
            if (!catSubs[pId]) catSubs[pId] = [];
            const item = { label: `📂 ${c.name}`, path: `/browse?category=${id}` };
            catSubs[pId].push(item);
            masterMap[item.path] = item.label;
        }
    });

    allContent.forEach(item => {
      const cId = item.categoryId?.toString();
      if (cId) {
          if (!catFiles[cId]) catFiles[cId] = [];
          const file = { label: `📄 ${item.title}`, path: `/content/${item._id}` };
          catFiles[cId].push(file);
          masterMap[file.path] = file.label;
      }
    });

    // 1c. Shorthand Knowledge Base (Saves 70% Tokens)
    const kbStr = categories.map(c => {
        const id = c._id.toString();
        const items = [...(catSubs[id] || []), ...(catFiles[id] || [])];
        if (items.length === 0) return null;
        // Format: [DIR_NAME]::(LABEL|PATH),(LABEL|PATH)
        const list = items.map(i => `${i.label}|${i.path}`).join(',');
        return `SCOPE[${c.name}]::(${list})`;
    }).filter(x => x).join('\n');

    const systemInstruction = `
      You are "GyanStack AI Assistant". 
      
      MANDATORY RESPONSE STRUCTURE:
      1. Bold Category Header (e.g. ### 📚 ASP.NET Practicals)
      2. Line-by-line list of items (e.g. 📄 Practical 1)
      3. Exactly ONE JSON block: [ACTION: {"type": "selections", "prompt": "Explore:", "options": [{"label": "...", "path": "..."}]}]

      STRICT RULES:
      - BUTTON LABELS MUST NOT BE BLANK.
      - NEVER list items from other folders.
      - Use ONLY the data in SCOPE[...] below.

      KNOWLEDGE BASE:
      ${kbStr}
    `;

    // 2. Build Messages (Pruned & Filtered for validity)
    const history = (chatHistory || [])
        .slice(-4)
        .filter(item => item.content && item.content.trim().length > 0); // Remove empty messages

    let messages = [
      { role: "system", content: systemInstruction },
      ...history.map(item => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: item.content
      })),
      { role: "user", content: message || "Hello" } // Fallback for user message
    ];

    // 3. Get Completion
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.1, 
      max_tokens: 800,
    });

    let fullReply = chatCompletion.choices[0].message.content || "";

    // 4. PARSE & REPAIR ACTION
    let reply = fullReply;
    let action = null;

    const actionMatch = fullReply.match(/\[ACTION:\s*({[\s\S]*?})\s*\]/);
    if (actionMatch) {
       try {
           const parsed = JSON.parse(actionMatch[1]);
           if (parsed.options) {
               // Security Guard & Auto-Label Repair
               parsed.options = parsed.options.map(opt => ({
                   label: opt.label || masterMap[opt.path] || "📄 View Item",
                   path: opt.path
               })).filter(o => o.path); // Remove broken paths
           }
           action = parsed;
           reply = fullReply.replace(/\[ACTION:[\s\S]*?\]/g, '').trim();
       } catch (e) { console.error("Action Repair Failed"); }
    }

    // 5. EMERGENCY RECOVERY (If JSON failed, rebuild from text)
    if (!action && (reply.includes('📂') || reply.includes('📄'))) {
        const autoOptions = [];
        Object.keys(masterMap).forEach(path => {
            const label = masterMap[path];
            const cleanLabel = label.replace(/[📂📄]\s*/, '').toLowerCase();
            if (reply.toLowerCase().includes(cleanLabel)) {
                autoOptions.push({ label, path });
            }
        });
        if (autoOptions.length > 0) {
            action = { type: 'selections', prompt: 'Select an item:', options: autoOptions.slice(0, 10) };
        }
    }

    // FINAL SCRUB
    reply = reply
        .replace(/SCOPE\[.*?\]/g, '')
        .replace(/ID\[.*?\]/g, '')
        .replace(/\[ACTION:.*?\]/gs, '')
        .replace(/[\{\}\[\]|]/g, '')
        .trim();

    // MANDATORY FALLBACK: Never send empty reply back to client
    if (!reply && action) {
        reply = "Here are the available resources for you! ✨";
    } else if (!reply) {
        reply = "How can I help you today? 📚";
    }

    return res.json({ reply, action });

  } catch (err) {
    console.error("Groq/AI Error:", err);
    res.status(500).json({ message: 'The AI assistant is temporarily busy. Please try again soon.' });
  }
};
