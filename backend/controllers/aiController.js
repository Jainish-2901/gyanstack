const Groq = require('groq-sdk');
const Content = require('../models/contentModel');
const Category = require('../models/categoryModel');
const Request = require('../models/requestModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

exports.getAiResponse = async (req, res) => {
  try {
    if (!req.body || !req.body.message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const { message, chatHistory, currentPath, sessionId } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq API Key (GROQ_API_KEY) is missing in backend .env' });
    }

    const [categories, allContent] = await Promise.all([
      Category.find().select('name _id parentId'),
      Content.find().select('title _id categoryId').sort({ createdAt: -1 }).limit(100)
    ]);

    const catFiles = {};
    const catSubs = {};
    const masterMap = {}; 

    const messageLower = message.toLowerCase();
    const relevantCategoryIds = new Set();
    
    categories.forEach(c => {
        if (messageLower.includes(c.name.toLowerCase())) {
            relevantCategoryIds.add(c._id.toString());
        }
    });

    categories.forEach(c => {
        const id = c._id.toString();
        const pId = c.parentId?.toString();
        if (pId && pId !== 'root') {
            if (!catSubs[pId]) catSubs[pId] = [];
            catSubs[pId].push({ label: `📂 ${c.name}`, path: `/browse?category=${id}` });
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

    const kbStr = categories.map(c => {
        const id = c._id.toString();
        // If message is generic, only show categories. If specific, show files inside matching categories.
        const isHighlyRelevant = relevantCategoryIds.has(id);
        const subItems = catSubs[id] || [];
        const fileItems = isHighlyRelevant ? (catFiles[id] || []) : []; // Only include files for relevant categories
        
        const items = [...subItems, ...fileItems];
        if (items.length === 0) return null;

        const list = items.map(i => `${i.label}|${i.path}`).join(',');
        return `SCOPE[${c.name}]::(${list})`;
    }).filter(x => x).slice(0, 15).join('\n'); // Limit to top 15 relevant scopes

    const platformRoutes = {
        'home': '/',
        'browse': '/browse',
        'contact': '/contact',
        'announcements': '/announcements',
        'login': '/login',
        'signup': '/signup',
        'dashboard': '/dashboard',
        'saved': '/dashboard/saved',
        'inquiries': '/dashboard/inquiries',
        'settings': '/settings',
        'request content': '/request'
    };

    const systemInstruction = `
      You are "GyanStack AI Assistant", a dedicated STUDY HELPER. 

      STRICT GUIDELINES:
      1. ONLY assist with GyanStack library content, study resources, and academic navigation.
      2. REFUSE irrelevant tasks (coding outside study context, general life advice, non-academic trivia).
      3. If a user asks something out of scope, politely reply: "I am here specifically to help you with GyanStack study materials. Let's get back to your studies! 📚🛡️"
      4. Maintain a helpful, encouraging academic persona.

      NAVIGATION PROTOCOL:
      You MUST use [ACTION: {"type": "navigate", "path": "...", "label": "..."}] for ALL internal links.
      - Home: /
      - Browse: /browse
      - Contact: /contact
      - Announcements: /announcements
      - Login: /login
      - Signup: /signup
      - Dashboard: /dashboard
      - Saved Content: /dashboard/saved
      - My Inquiries: /dashboard/inquiries
      - Profile Settings: /settings
      - Request Tracking Page: /request

      AUTH RULES (MANDATORY):
      1. IF user is GUEST (Logged Out) and asks for Dashboard/Saved/Inquiries/Settings/Request: 
         - Reply: "I'd love to help you with that! However, access to the dashboard and your personal tracker requires a login for safety. 🛡️✨"
         - ACTION: Use [ACTION: {"type": "navigate", "path": "/login", "label": "Login to Continue"}]
      2. IF user is LOGGED-IN: 
         - Navigate them immediately to any requested page.

      CONTENT REQUESTS:
      - When a request is successful, ALWAYS use [ACTION: {"type": "navigate", "path": "/request", "label": "Track My Request"}] so the user can see their submission.

      CURRENT CONTEXT:
      - User Current Page Path: ${currentPath || '/'}
      - User Auth Status: ${req.user ? 'Logged In ✅' : 'Guest (Logged Out) 🛡️'}

      STRICT RULES:
      - NEVER use raw links like (/path).
      - Exactly ONE action block.
      - Never repeat technical IDs.

      KNOWLEDGE BASE:
      ${kbStr}
    `;

    const history = (chatHistory || []).slice(-4).filter(h => h.content);
    let messages = [
      { role: "system", content: systemInstruction },
      ...history.map(item => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: item.content
      })),
      { role: "user", content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, 
      max_tokens: 600,
    });

    let fullReply = chatCompletion.choices[0].message.content || "";

    let reply = fullReply;
    let action = null;

    const actionMatch = fullReply.match(/\[ACTION:\s*({[\s\S]*?})\s*\]/);
    if (actionMatch) {
       try {
           const parsed = JSON.parse(actionMatch[1]);
           if (parsed.type === 'selections' || parsed.type === 'navigate') {
              // Forced Navigation Guard
              const target = (parsed.path || "").split('?')[0];
              const isProtected = target.includes('dashboard') || target === '/settings' || target === '/request';
              
              if (isProtected && !req.user) {
                  reply = "I'd be happy to open that dashboard page for you, but you'll need to login first. Safety first! 🛡️🎓";
                  action = { type: 'navigate', path: '/login', label: 'Login Now' };
              } else {
                  if (parsed.options) {
                      parsed.options = parsed.options.map(opt => ({
                          label: opt.label || masterMap[opt.path] || "📄 View Item",
                          path: opt.path
                      })).filter(o => o.path);
                  }
                  action = parsed;
              }
           } else if (parsed.type === 'request') {
              if (req.user) {
                  const topic = parsed.topic || message;
                  const newRequest = new Request({ topic, message: `Chat: ${message}`, requestedBy: req.user._id });
                  await newRequest.save();
                  // SUCCESS REDIRECT: Send them to track it!
                  reply = `Request has been send successfully for **"${topic}"** to admin, your request will be Fulfill soon... check out to request content section in dashboard for status! Stay updated! ✨🛡️`;
                  action = { type: 'navigate', path: '/request', label: 'Track My Request' };
              } else {
                  reply = "I see you want to request something new! Please login first so I can submit it formally for you. 🛡️";
                  action = { type: 'navigate', path: '/login', label: 'Login to Request' };
              }
           }
           reply = fullReply.replace(/\[ACTION:[\s\S]*?\]/g, '').trim();
       } catch (e) { console.error("Action Parse Fail"); }
    }

    if (!action) {
        for (const [key, path] of Object.entries(platformRoutes)) {
            if (message.toLowerCase().includes(`open ${key}`) || message.toLowerCase().includes(`go to ${key}`)) {
                const isProtected = path.includes('dashboard') || path === '/settings' || path === '/request';
                if (isProtected && !req.user) {
                    reply = "I'd be happy to open that dashboard page for you, but you'll need to login first. 🛡️🎓";
                    action = { type: 'navigate', path: '/login', label: 'Login Now' };
                } else if (path === currentPath) {
                    action = null;
                    reply = `You are already on the ${key} section! ✨🏙️`;
                } else {
                    action = { type: 'navigate', path: path, label: `🚀 Open ${key.charAt(0).toUpperCase() + key.slice(1)}` };
                    reply = `Taking you to the ${key} section right away! ✨🏙️`;
                }
                break;
            }
        }

        if (!action && (message.toLowerCase().includes('request') || message.toLowerCase().includes('send request'))) {
            const topicMatch = message.match(/(?:request|send request|for)\s+([^.]+)/i);
            const topic = topicMatch ? topicMatch[1].replace(/for\s+/i, '').trim() : message;
            if (req.user) {
                const newReq = new Request({ topic, message: `Auto: ${message}`, requestedBy: req.user._id });
                await newReq.save();
                reply = `Request has been send successfully for **"${topic}"** to admin, your request will be Fulfill soon... check out to request content section in dashboard for status! Stay updated! ✨🛡️`;
                action = { type: 'navigate', path: '/request', label: 'Track My Request' };
            } else {
                action = { type: 'navigate', path: '/login', label: 'Login to Request' };
                reply = "Please login first so I can submit your request formally! 🛡️";
            }
        }
    }

    reply = reply
        .replace(/\(\s*\/content\/.*?\)/g, '')
        .replace(/\(\s*\/browse\/.*?\)/g, '')
        .replace(/SCOPE\[.*?\]::\(.*?\)/gs, '')
        .replace(/SCOPE\[.*?\]/g, '')
        .replace(/ID:\[.*?\]/g, '')
        .replace(/\[ACTION:.*?\]/gs, '')
        .replace(/\"type\":\s*\".*?\"/g, '') // Scrub JSON remnants
        .replace(/\"topic\":\s*\".*?\"/g, '')
        .replace(/\"options\":\s*\[.*?\]/g, '')
        .replace(/ACTION PROTOCOL/gi, '')
        .replace(/interactive buttons below/gi, '')
        .replace(/[\{\}\[\]|]/g, '')
        .trim();

    const finalReply = reply || (action ? "Action executed successfully! ✨" : "How can I help you today? 📚");

    if (req.user && sessionId) {
        try {
            const userMsg = { role: 'user', content: message, timestamp: new Date() };
            const aiMsg = { role: 'assistant', content: finalReply, action: action, timestamp: new Date() };

            await Chat.findOneAndUpdate(
                { user: req.user._id, sessionId },
                { 
                    $push: { messages: { $each: [userMsg, aiMsg] } },
                    $setOnInsert: { user: req.user._id, sessionId }
                },
                { upsert: true, new: true }
            );
        } catch (dbErr) {
            console.error("Failed to save chat history:", dbErr);
        }
    }

    return res.json({ reply: finalReply, action });

  } catch (err) {
    console.error("Groq/AI Error:", err);
    res.status(500).json({ message: 'The AI assistant is temporarily busy. Please try again soon.' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // If sessionId provided, find specific session, else get latest session
    const query = { user: req.user._id };
    if (sessionId) query.sessionId = sessionId;

    const chat = await Chat.findOne(query).sort({ updatedAt: -1 });
    
    if (!chat) return res.json({ messages: [] });
    
    // Only return the last 50 messages to keep UI snappy
    const history = chat.messages.slice(-50);
    res.json({ messages: history });

  } catch (err) {
    console.error("Get History Error:", err);
    res.status(500).json({ message: 'Failed to retrieve study history.' });
  }
};
