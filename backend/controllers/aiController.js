const { GoogleGenerativeAI } = require('@google/generative-ai');
const Content = require('../models/contentModel');
const Category = require('../models/categoryModel');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

exports.getAiResponse = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API Key is missing in backend .env' });
    }

    // 1. Fetch some context from DB to make AI "GyanStack Aware"
    const categories = await Category.find().select('name');
    const recentUploads = await Content.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title type');

    const categoryNames = categories.map(c => c.name).join(', ');
    const uploadSummary = recentUploads.map(r => `${r.title} (${r.type})`).join(', ');

    const systemInstruction = `
      You are "GyanStack AI Assistant", a friendly and premium academic guide for GyanStack - an educational resource hub for BCA, MCA, and other college students.
      
      GyanStack currently has these categories: ${categoryNames}.
      Some recent documents available are: ${uploadSummary}.
      
      Your goals:
      1. Help users find documents. If they ask for something specific, check if it matches our categories or recent uploads.
      2. If you don't find a direct match, suggest they use the search bar or ask for a specific topic.
      3. Provide helpful study suggestions (e.g., how to prepare for exams, importance of PYQs).
      4. Keep responses concise, professional, and encouraging.
      5. Use Markdown for formatting.
      6. If they ask for content not on GyanStack, kindly explain that you are a GyanStack specialist but can give general study advice.
    `;

    // Initialize Model
    // Note: If systemInstruction causes issues, we can move it to the prompt
    // 4. Try Model Strategy
    // REFACTORED: We found that 'gemini-1.5-flash' returns 404 for this key/region.
    // 'gemini-flash-latest' is confirmed working.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest"
    });

    // Prepend system instruction to the actual user message
    const enrichedMessage = `[SYSTEM INSTRUCTION: ${systemInstruction.replace(/\n/g, ' ')}]\n\nUser Message: ${message}`;

    // Handle history - Gemini strictly requires:
    // 1. History must start with 'user'
    // 2. Roles must alternate [user, model, user, model...]
    // 3. History block must end with 'model' (since the current message is 'user')
    const rawHistory = (chatHistory || []).map(item => ({
        role: (item.role === 'user' || item.role === 'User') ? 'user' : 'model',
        parts: [{ text: item.content }],
    }));

    let cleanHistory = [];
    let nextExpectedRole = 'user';

    for (const item of rawHistory) {
      if (item.role === nextExpectedRole) {
        cleanHistory.push(item);
        nextExpectedRole = nextExpectedRole === 'user' ? 'model' : 'user';
      }
    }

    // Ensure it ends with 'model' so the current 'sendMessage(user)' alternates correctly
    while (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role !== 'model') {
      cleanHistory.pop();
    }

    const chat = model.startChat({
      history: cleanHistory,
    });

    const result = await chat.sendMessage(enrichedMessage);
    const response = await result.response;
    const text = response.text();

    return res.json({ reply: text });

  } catch (err) {
    console.error("AI Error:", err.message);
    // Specialized error for Quota issues
    if (err.message?.includes('429')) {
        return res.status(429).json({ message: 'AI is a bit busy (Rate Limit). Please wait a few seconds and try again.' });
    }
    res.status(500).json({ message: 'AI Assistant is currently unavailable. ' + err.message });
  }
};
