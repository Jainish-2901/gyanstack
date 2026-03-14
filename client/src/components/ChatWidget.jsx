import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const GUEST_MESSAGE_LIMIT = 5;

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: 'Hi! I am your GyanStack AI. How can I help you with your studies today?' }
    ]);
    const [loading, setLoading] = useState(false);
    const [guestCount, setGuestCount] = useState(0);
    const chatEndRef = useRef(null);

    // 1. Initial Load: Restore history and guest count from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('gyanstack_ai_history');
        if (savedHistory) {
            setChatHistory(JSON.parse(savedHistory));
        }

        const savedCount = localStorage.getItem('gyanstack_guest_count');
        if (savedCount) {
            setGuestCount(parseInt(savedCount));
        }
    }, []);

    // 2. Persist Chat History to LocalStorage
    useEffect(() => {
        if (chatHistory.length > 1) { // Only save if more than initial message
            localStorage.setItem('gyanstack_ai_history', JSON.stringify(chatHistory));
        }
    }, [chatHistory]);

    // 3. Clear guest count upon login, but KEEP history
    useEffect(() => {
        if (user) {
            localStorage.removeItem('gyanstack_guest_count');
            setGuestCount(0);
        }
    }, [user]);

    // Scroll to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatHistory, isOpen]);

    // Listen for global toggle
    useEffect(() => {
        const handleToggle = () => setIsOpen(true);
        window.addEventListener('toggle-ai-chat', handleToggle);
        return () => window.removeEventListener('toggle-ai-chat', handleToggle);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        // Check Guest Limit
        if (!user && guestCount >= GUEST_MESSAGE_LIMIT) return;

        const userMsg = { role: 'user', content: message };
        const updatedHistory = [...chatHistory, userMsg];
        
        setChatHistory(updatedHistory);
        setMessage('');
        setLoading(true);

        try {
            const { data } = await api.post('/ai/chat', {
                message: message,
                chatHistory: updatedHistory.slice(-10)
            });
            
            setChatHistory(curr => [...curr, { role: 'assistant', content: data.reply }]);
            
            // Increment Guest Count
            if (!user) {
                const newCount = guestCount + 1;
                setGuestCount(newCount);
                localStorage.setItem('gyanstack_guest_count', newCount.toString());
            }

        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Sorry, I am having trouble connecting right now.';
            setChatHistory(curr => [...curr, { role: 'assistant', content: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    const isLimitReached = !user && guestCount >= GUEST_MESSAGE_LIMIT;

    return (
        <div className="chat-widget-container">
            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window shadow-lg border-0 fade-in glass-panel">
                    <div className="chat-header d-flex justify-content-between align-items-center p-3 bg-primary text-white rounded-top-4">
                        <div className="d-flex align-items-center">
                            <div className="ai-avatar me-2">
                                <i className="bi bi-robot fs-4"></i>
                            </div>
                            <div>
                                <h6 className="mb-0 fw-bold">GyanStack AI</h6>
                                <small className="opacity-75">Online • Freemium Mode</small>
                            </div>
                        </div>
                        <button className="btn btn-link text-white p-0" onClick={() => setIsOpen(false)}>
                            <i className="bi bi-dash-lg fs-4"></i>
                        </button>
                    </div>

                    <div className="chat-messages p-3 overflow-auto" style={{ height: '350px', background: 'var(--surface-color)' }}>
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`d-flex mb-3 ${chat.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                <div className={`message-bubble p-3 rounded-4 ${chat.role === 'user' ? 'bg-primary text-white' : 'bg-light text-dark shadow-sm'}`} style={{ maxWidth: '85%' }}>
                                    <ReactMarkdown
                                        components={{
                                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                                        }}
                                    >
                                        {chat.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        
                        {/* Guest Limit Notice Inside Chat */}
                        {isLimitReached && (
                            <div className="text-center p-3 mt-2 border border-warning rounded-4 bg-warning bg-opacity-10">
                                <i className="bi bi-shield-lock-fill text-warning fs-3 mb-2 d-block"></i>
                                <h6 className="fw-bold mb-1">Daily Limit Reached</h6>
                                <p className="small text-muted mb-3">
                                    Login compulsorily to unlock unlimited chat and save your study history!
                                </p>
                                <a href="/login" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold">Login to Continue</a>
                            </div>
                        )}

                        {loading && (
                            <div className="d-flex justify-content-start mb-3">
                                <div className="message-bubble p-3 rounded-4 bg-light text-dark shadow-sm">
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {!isLimitReached ? (
                        <form className="chat-input-area p-3 border-top" onSubmit={handleSend}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control border-0 bg-light rounded-pill px-3"
                                    placeholder="Ask anything..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={loading}
                                />
                                <button className="btn btn-primary rounded-circle ms-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', flexShrink: 0, padding: 0 }} type="submit" disabled={loading || !message.trim()}>
                                    <i className="bi bi-send-fill" style={{ fontSize: '1.2rem' }}></i>
                                </button>
                            </div>
                            {!user && (
                                <div className="text-center mt-2">
                                    <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                        {GUEST_MESSAGE_LIMIT - guestCount} guest messages left today
                                    </small>
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className="p-3 border-top text-center bg-light">
                             <small className="text-danger fw-bold">Chat locked. Please log in.</small>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                className={`chat-toggle-btn shadow-lg d-flex align-items-center justify-content-center transition-all ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="GyanStack AI Assistant"
            >
                {isOpen ? <i className="bi bi-x-lg fs-4"></i> : <i className="bi bi-robot fs-2"></i>}
                {!isOpen && !user && guestCount > 0 && <span className="notification-badge bg-warning">!</span>}
            </button>

            <style>{`
                .chat-widget-container { position: fixed; right: 25px; bottom: 25px; z-index: 9999; }
                .chat-window { position: absolute; bottom: 80px; right: 0; width: 350px; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border) !important; }
                .ai-avatar { width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--bs-primary); }
                .chat-toggle-btn { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; border: none; cursor: pointer; }
                .notification-badge { position: absolute; top: 0; right: 0; width: 20px; height: 20px; border: 2px solid white; border-radius: 50%; color: black; font-size: 0.7rem; font-weight: bold; display: flex; align-items: center; justify-content: center; }
                .message-bubble { font-size: 0.9rem; line-height: 1.4; word-wrap: break-word; }
                .typing-indicator span { display: inline-block; width: 6px; height: 6px; background-color: #6366f1; border-radius: 50%; margin-right: 3px; animation: typing 1.4s infinite ease-in-out both; }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
                @media (max-width: 576px) { .chat-window { width: 300px; right: -10px; } }
            `}</style>
        </div>
    );
}
