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

// ─── Fuzzy string similarity (Dice coefficient) ─────────────────────────────
function similarity(a, b) {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = new Map();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.substr(i, 2);
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
  }
  let intersect = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.substr(i, 2);
    const count = bigrams.get(bg) || 0;
    if (count > 0) { intersect++; bigrams.set(bg, count - 1); }
  }
  return (2.0 * intersect) / (a.length + b.length - 2);
}

// ─── Main AI endpoint ────────────────────────────────────────────────────────
exports.getAiResponse = async (req, res) => {
  try {
    if (!req.body || !req.body.message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const { message, chatHistory, currentPath, sessionId } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq API Key (GROQ_API_KEY) is missing in backend .env' });
    }

    const msgLower = message.toLowerCase().trim();

    // ── Fetch all data ──────────────────────────────────────────────────────
    const [categories, allContent, allUsers] = await Promise.all([
      Category.find().select('name _id parentId'),
      Content.find()
        .select('title _id categoryId uploadedBy tags textNote type')
        .populate('uploadedBy', 'username _id')
        .sort({ createdAt: -1 })
        .limit(300),
      User.find({ isDeleted: false }).select('username _id role').limit(100)
    ]);

    // ── Build lookup maps ───────────────────────────────────────────────────
    const catMap = {};
    categories.forEach(c => { catMap[c._id.toString()] = c.name; });

    const catFiles = {};   // categoryId → [{label, path, title, id}]
    const catSubs = {};    // parentId   → [{label, path}]
    const masterMap = {};  // path       → label
    const uploaderIndex = {}; // username.lower → [{username, id, contentTitles[]}]

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
      const file = {
        label: `📄 ${item.title}`,
        path: `/content/${item._id}`,
        title: item.title,
        id: item._id.toString(),
        tags: item.tags || [],
        textNote: item.textNote || '',
        uploaderName: item.uploadedBy?.username || 'Admin',
        uploaderId: item.uploadedBy?._id?.toString() || null,
      };
      if (cId) {
        if (!catFiles[cId]) catFiles[cId] = [];
        catFiles[cId].push(file);
      }
      masterMap[file.path] = file.label;

      // Uploader index
      if (file.uploaderName) {
        const key = file.uploaderName.toLowerCase();
        if (!uploaderIndex[key]) uploaderIndex[key] = { username: file.uploaderName, id: file.uploaderId, titles: [] };
        uploaderIndex[key].titles.push(item.title);
      }
    });

    // ── 1. EXACT TITLE MATCH (pre-Groq fast path) ──────────────────────────
    const exactMatch = allContent.find(c => c.title.toLowerCase() === msgLower);
    if (exactMatch) {
      const path = `/content/${exactMatch._id}`;
      const reply = `Found it! Opening **"${exactMatch.title}"** for you right now 🚀`;
      await _saveChat(req, sessionId, message, reply, { type: 'navigate', path, label: `📄 ${exactMatch.title}` });
      return res.json({ reply, action: { type: 'navigate', path, label: `📄 ${exactMatch.title}` } });
    }

    // ── 2. KEYWORD SEARCH — "find / search / open" ─────────────────────────
    const findKeywords = ['find ', 'search ', 'open ', 'show me ', 'look for ', 'where is ', 'get me '];
    const isFindIntent = findKeywords.some(kw => msgLower.startsWith(kw)) ||
      (msgLower.includes('find') || msgLower.includes('search') || msgLower.includes('look for'));

    if (isFindIntent) {
      // Extract search term (remove the keyword prefix)
      let searchTerm = msgLower;
      for (const kw of findKeywords) {
        if (searchTerm.startsWith(kw)) { searchTerm = searchTerm.slice(kw.length).trim(); break; }
      }
      // Remove common stopwords
      searchTerm = searchTerm.replace(/\b(notes?|document|content|file|pdf|video)\b/gi, '').trim();

      if (searchTerm.length >= 2) {
        // Score all content
        const scored = allContent.map(item => ({
          item,
          score: similarity(searchTerm, item.title)
        })).sort((a, b) => b.score - a.score);

        const topMatches = scored.filter(s => s.score > 0.25).slice(0, 5);

        if (topMatches.length === 1 && topMatches[0].score > 0.7) {
          // Very high confidence — navigate directly
          const hit = topMatches[0].item;
          const path = `/content/${hit._id}`;
          const reply = `Found a great match! Opening **"${hit.title}"** for you 🚀`;
          await _saveChat(req, sessionId, message, reply, { type: 'navigate', path, label: `📄 ${hit.title}` });
          return res.json({ reply, action: { type: 'navigate', path, label: `📄 ${hit.title}` } });
        } else if (topMatches.length > 0) {
          const options = topMatches.map(s => ({
            label: `📄 ${s.item.title}`,
            path: `/content/${s.item._id}`
          }));
          const reply = `I found **${topMatches.length}** related document(s) for **"${searchTerm}"**. Which one are you looking for? 📚`;
          await _saveChat(req, sessionId, message, reply, { type: 'selections', options });
          return res.json({ reply, action: { type: 'selections', options } });
        }
        // Fall through to Groq if no matches
      }
    }

    // ── 3. UPLOADER LOOKUP ──────────────────────────────────────────────────
    const uploaderKeywords = ['who uploaded', 'uploader', 'who added', 'who posted', 'uploaded by', 'find uploader'];
    const isUploaderIntent = uploaderKeywords.some(kw => msgLower.includes(kw));

    if (isUploaderIntent) {
      // Try to find a username mentioned, or a content title
      let found = null;

      // Check if any uploader name is mentioned
      for (const [key, info] of Object.entries(uploaderIndex)) {
        if (msgLower.includes(key)) {
          found = info;
          break;
        }
      }

      // Check if a content title is mentioned and find its uploader
      if (!found) {
        const contentHit = allContent.find(c => msgLower.includes(c.title.toLowerCase().substring(0, 10)));
        if (contentHit && contentHit.uploadedBy) {
          found = {
            username: contentHit.uploadedBy.username,
            id: contentHit.uploadedBy._id?.toString(),
            titles: [contentHit.title]
          };
        }
      }

      if (found && found.id) {
        const path = `/uploader/${found.id}`;
        const reply = `**${found.username}** is the uploader! They have contributed **${found.titles.length}** resource(s). You can visit their profile to see all their content 👤`;
        await _saveChat(req, sessionId, message, reply, { type: 'navigate', path, label: `👤 View ${found.username}'s Profile` });
        return res.json({ reply, action: { type: 'navigate', path, label: `👤 View ${found.username}'s Profile` } });
      }
    }

    // ── 4. REQUEST INTENT (robust fallback) ────────────────────────────────
    const requestKeywords = ['request', 'send request', 'please add', 'need content', 'can you add', 'i need notes', 'please upload', 'add content for'];
    const isRequestIntent = requestKeywords.some(kw => msgLower.includes(kw));

    if (isRequestIntent) {
      // Extract topic
      const topicPatterns = [
        /(?:request(?:ing)?|please add|add content for|need content (?:on|about|for)|i need notes (?:on|about|for)?|please upload)\s+(.+)/i,
        /(?:can you add|send request for)\s+(.+)/i,
      ];
      let topic = null;
      for (const pat of topicPatterns) {
        const m = message.match(pat);
        if (m) { topic = m[1].replace(/^(on|for|about)\s+/i, '').trim(); break; }
      }
      if (!topic) topic = message.replace(/request|please|add|content|notes|for|on|about/gi, '').trim() || message;
      topic = topic.substring(0, 200);

      if (req.user) {
        const newReq = new Request({ topic, message: `Chat Request: ${message}`, requestedBy: req.user._id });
        await newReq.save();
        const reply = `✅ Your request for **"${topic}"** has been submitted to the admin! You can track its status anytime. 📬`;
        await _saveChat(req, sessionId, message, reply, { type: 'request_success', path: '/request', label: '📬 Track My Request' });
        return res.json({ reply, action: { type: 'request_success', path: '/request', label: '📬 Track My Request' } });
      } else {
        const reply = `I'd love to submit that request for you! Please log in first so I can save it under your account. 🛡️`;
        await _saveChat(req, sessionId, message, reply, { type: 'navigate', path: '/login', label: 'Login to Request' });
        return res.json({ reply, action: { type: 'navigate', path: '/login', label: 'Login to Request' } });
      }
    }

    // ── 5. NOTES / SUMMARY / PRACTICE QUESTIONS GENERATION ─────────────────
    const notesKeywords = ['make notes', 'create notes', 'generate notes', 'give me notes', 'notes on', 'summarize', 'make summary', 'summary of', 'create summary'];
    const questKeywords = ['practice questions', 'generate questions', 'make questions', 'create questions', 'quiz on', 'mcq on', 'test questions'];

    const isNotesIntent = notesKeywords.some(kw => msgLower.includes(kw));
    const isQuestIntent = questKeywords.some(kw => msgLower.includes(kw));

    if (isNotesIntent || isQuestIntent) {
      // Find the most relevant content item
      const scored = allContent.map(item => {
        let score = 0;
        const words = msgLower.split(/\s+/);
        words.forEach(w => {
          if (w.length > 3 && item.title.toLowerCase().includes(w)) score += 2;
          if (item.tags.some(t => t.toLowerCase().includes(w))) score += 1;
        });
        return { item, score };
      }).sort((a, b) => b.score - a.score);

      const topItem = scored[0]?.score > 0 ? scored[0].item : null;

      let groqPrompt;
      if (topItem) {
        const context = [
          `Title: ${topItem.title}`,
          topItem.tags.length ? `Topics: ${topItem.tags.join(', ')}` : '',
          topItem.textNote ? `Content: ${topItem.textNote.substring(0, 800)}` : ''
        ].filter(Boolean).join('\n');

        if (isQuestIntent) {
          groqPrompt = `You are a study assistant. Based ONLY on this GyanStack resource, generate 5 practice questions (mix of MCQ and short answer). Format clearly with answers.\n\n${context}`;
        } else {
          groqPrompt = `You are a study assistant. Based ONLY on this GyanStack resource, create concise structured study notes with key points and definitions.\n\n${context}`;
        }
      } else {
        // No specific content found — ask user to be more specific
        const reply = isQuestIntent
          ? `I'd love to generate practice questions! Could you tell me the **exact topic or document name** you want questions from? I'll find it in our library 📚`
          : `I'd love to make notes for you! Could you tell me the **exact topic or document name**? I'll search our library 📚`;
        await _saveChat(req, sessionId, message, reply, null);
        return res.json({ reply, action: null });
      }

      // Call Groq for generation
      const genCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: groqPrompt }],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.4,
        max_tokens: 800,
      });

      const generatedContent = genCompletion.choices[0].message.content || '';
      const prefix = isQuestIntent
        ? `📝 **Practice Questions** for *"${topItem.title}"*:\n\n`
        : `📒 **Study Notes** for *"${topItem.title}"*:\n\n`;
      const reply = prefix + generatedContent;

      await _saveChat(req, sessionId, message, reply, null);
      return res.json({ reply, action: null });
    }

    // ── 6. GROQ GENERAL CHAT (with full knowledge base) ────────────────────
    const relevantCategoryIds = new Set();
    categories.forEach(c => {
      if (msgLower.includes(c.name.toLowerCase())) {
        relevantCategoryIds.add(c._id.toString());
      }
    });

    // Build keyword-aware content list for KB
    const msgWords = msgLower.split(/\s+/).filter(w => w.length > 3);
    const relevantContent = allContent.filter(item => {
      const titleWords = item.title.toLowerCase();
      return msgWords.some(w => titleWords.includes(w)) ||
        relevantCategoryIds.has(item.categoryId?.toString());
    }).slice(0, 30);

    const kbStr = categories.map(c => {
      const id = c._id.toString();
      const isHighlyRelevant = relevantCategoryIds.has(id);
      const subItems = catSubs[id] || [];
      const fileItems = isHighlyRelevant ? (catFiles[id] || []).slice(0, 10) : [];
      const items = [...subItems, ...fileItems];
      if (items.length === 0) return null;
      const list = items.map(i => `${i.label}|${i.path}`).join(',');
      return `SCOPE[${c.name}]::(${list})`;
    }).filter(x => x).slice(0, 15).join('\n');

    // Uploader KB snippet
    const uploaderKB = Object.values(uploaderIndex).slice(0, 20)
      .map(u => `UPLOADER[${u.username}]::PROFILE[/uploader/${u.id}]::DOCS[${u.titles.slice(0, 3).join(', ')}]`)
      .join('\n');

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
      'request': '/request'
    };

    const systemInstruction = `
You are "GyanStack AI", a dedicated STUDY HELPER for GyanStack — a platform for Gujarat University students.

YOUR CAPABILITIES (Study Buddy):
- Help students find study materials, notes, PDFs, and videos
- Tell students who uploaded specific content
- Summarize academic topics using available library resources
- Navigate students to the right pages
- Help submit content requests

STRICT GUIDELINES:
1. ONLY help with GyanStack library content, study resources, and academic navigation.
2. REFUSE off-topic requests politely: "I'm here to help you with GyanStack study materials! Let's get back to studying 📚🛡️"
3. Maintain a warm, encouraging academic persona.
4. NEVER fabricate content — only reference what exists in the KB.
5. Keep replies concise, friendly, and helpful with emojis.

NAVIGATION PROTOCOL:
Use [ACTION: {"type": "navigate", "path": "...", "label": "..."}] for ALL internal navigation.
- Home: /  |  Browse: /browse  |  Contact: /contact
- Announcements: /announcements  |  Login: /login  |  Signup: /signup
- Dashboard: /dashboard  |  Saved: /dashboard/saved  |  Inquiries: /dashboard/inquiries
- Settings: /settings  |  Request Tracking: /request

AUTH RULES:
- GUEST asking for Dashboard/Saved/Inquiries/Settings/Request → prompt login:
  [ACTION: {"type": "navigate", "path": "/login", "label": "Login to Continue"}]
- LOGGED-IN user → navigate immediately.

CONTENT REQUESTS:
Use [ACTION: {"type": "request", "topic": "[extracted topic]"}] ONLY when the user explicitly asks you to "request", "add", or "submit" new content they want uploaded. This saves the request to the database — ALWAYS use this format without fail.

UPLOADER INFO:
When asked about uploaders, reference the UPLOADER KB and use:
[ACTION: {"type": "navigate", "path": "/uploader/[id]", "label": "👤 View Profile"}]

CURRENT CONTEXT:
- User Page: ${currentPath || '/'}
- Auth Status: ${req.user ? `Logged In ✅ (${req.user.username || 'user'})` : 'Guest 🛡️'}

RULES:
- NEVER use raw path links in text like (/content/123)
- Exactly ONE [ACTION: ...] block per response
- Never expose MongoDB _id strings in text
- NEVER repeat full JSON in your reply text

KNOWLEDGE BASE:
${kbStr}

UPLOADERS:
${uploaderKB}
    `.trim();

    const history = (chatHistory || []).slice(-6).filter(h => h.content);
    const messages = [
      { role: 'system', content: systemInstruction },
      ...history.map(item => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: item.content
      })),
      { role: 'user', content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.15,
      max_tokens: 700,
    });

    let fullReply = chatCompletion.choices[0].message.content || '';
    let reply = fullReply;
    let action = null;

    // Parse [ACTION: {...}]
    const actionMatch = fullReply.match(/\[ACTION:\s*({[\s\S]*?})\s*\]/);
    if (actionMatch) {
      try {
        const parsed = JSON.parse(actionMatch[1]);

        if (parsed.type === 'request') {
          // ── Handle content request from Groq ──
          const topic = parsed.topic || message;
          if (req.user) {
            const newReq = new Request({ topic, message: `Chat: ${message}`, requestedBy: req.user._id });
            await newReq.save();
            reply = `✅ Request for **"${topic}"** submitted to admin! You can track its status in your dashboard. 📬`;
            action = { type: 'request_success', path: '/request', label: '📬 Track My Request' };
          } else {
            reply = `Please log in first so I can submit your request officially! 🛡️`;
            action = { type: 'navigate', path: '/login', label: 'Login to Request' };
          }
        } else if (parsed.type === 'navigate' || parsed.type === 'selections') {
          // Guard protected routes for guests
          const target = (parsed.path || '').split('?')[0];
          const isProtected = target.includes('dashboard') || target === '/settings' || target === '/request';
          if (isProtected && !req.user) {
            reply = `That page requires login. Please sign in first! 🛡️🎓`;
            action = { type: 'navigate', path: '/login', label: 'Login Now' };
          } else {
            if (parsed.options) {
              parsed.options = parsed.options.map(opt => ({
                label: opt.label || masterMap[opt.path] || '📄 View',
                path: opt.path
              })).filter(o => o.path);
            }
            action = parsed;
          }
        }

        reply = fullReply.replace(/\[ACTION:[\s\S]*?\]/g, '').trim();

      } catch (e) { console.error('Action Parse Fail:', e.message); }
    }

    // ── Legacy keyword-based navigation fallback ──────────────────────────
    if (!action) {
      for (const [key, path] of Object.entries(platformRoutes)) {
        if (msgLower.includes(`open ${key}`) || msgLower.includes(`go to ${key}`)) {
          const isProtected = path.includes('dashboard') || path === '/settings' || path === '/request';
          if (isProtected && !req.user) {
            reply = `That page requires login! 🛡️🎓`;
            action = { type: 'navigate', path: '/login', label: 'Login Now' };
          } else if (path === currentPath) {
            reply = `You're already on the ${key} page! ✨`;
          } else {
            action = { type: 'navigate', path, label: `🚀 Open ${key.charAt(0).toUpperCase() + key.slice(1)}` };
            reply = `Taking you to the ${key} section! ✨`;
          }
          break;
        }
      }
    }

    // ── Scrub reply of any leaked internals ───────────────────────────────
    reply = reply
      .replace(/\(\/content\/[a-f0-9]{24}\)/g, '')
      .replace(/SCOPE\[.*?\]::\(.*?\)/gs, '')
      .replace(/UPLOADER\[.*?\]/g, '')
      .replace(/ID:\[.*?\]/g, '')
      .replace(/\[ACTION:.*?\]/gs, '')
      .replace(/"type":\s*".*?"/g, '')
      .replace(/"topic":\s*".*?"/g, '')
      .replace(/ACTION PROTOCOL/gi, '')
      .replace(/interactive buttons below/gi, '')
      .trim();

    const finalReply = reply || (action ? '✅ Done!' : 'How can I help you study today? 📚');

    await _saveChat(req, sessionId, message, finalReply, action);
    return res.json({ reply: finalReply, action });

  } catch (err) {
    console.error('Groq/AI Error:', err);
    res.status(500).json({ message: 'The AI assistant is temporarily busy. Please try again soon.' });
  }
};

// ─── Save chat history helper ────────────────────────────────────────────────
async function _saveChat(req, sessionId, userMsg, aiReply, action) {
  if (!req.user || !sessionId) return;
  try {
    const userMsgDoc = { role: 'user', content: userMsg, timestamp: new Date() };
    const aiMsgDoc = { role: 'assistant', content: aiReply, action, timestamp: new Date() };
    await Chat.findOneAndUpdate(
      { user: req.user._id, sessionId },
      {
        $push: { messages: { $each: [userMsgDoc, aiMsgDoc] } },
        $setOnInsert: { user: req.user._id, sessionId }
      },
      { upsert: true, new: true }
    );
  } catch (dbErr) {
    console.error('Failed to save chat history:', dbErr);
  }
}

// ─── Get chat history ────────────────────────────────────────────────────────
exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const query = { user: req.user._id };
    if (sessionId) query.sessionId = sessionId;
    const chat = await Chat.findOne(query).sort({ updatedAt: -1 });
    if (!chat) return res.json({ messages: [] });
    const history = chat.messages.slice(-50);
    res.json({ messages: history });
  } catch (err) {
    console.error('Get History Error:', err);
    res.status(500).json({ message: 'Failed to retrieve study history.' });
  }
};
