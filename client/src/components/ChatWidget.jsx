import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: 'Hi! I am your GyanStack AI. How can I help you with your studies today?' }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Scroll to bottom whenever chatHistory changes
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatHistory, isOpen]);

    // Listen for global toggle event
    useEffect(() => {
        const handleToggle = () => setIsOpen(true);
        window.addEventListener('toggle-ai-chat', handleToggle);
        return () => window.removeEventListener('toggle-ai-chat', handleToggle);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMsg = { role: 'user', content: message };
        setChatHistory(prev => {
            const newHistory = [...prev, userMsg];
            // Send the request while the state is updating
            const sendRequest = async () => {
                try {
                    const { data } = await api.post('/ai/chat', {
                        message: message,
                        chatHistory: prev.slice(-10) // Send more context, backend will clean it
                    });
                    setChatHistory(curr => [...curr, { role: 'assistant', content: data.reply }]);
                } catch (err) {
                    const errorMsg = err.response?.data?.message || 'Sorry, I am having trouble connecting right now.';
                    setChatHistory(curr => [...curr, { role: 'assistant', content: errorMsg }]);
                } finally {
                    setLoading(false);
                }
            };
            sendRequest();
            return newHistory;
        });

        setMessage('');
        setLoading(true);
    };

    if (!user) return null; // Only show for logged in users

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
                                <small className="opacity-75">Online • Academic Guide</small>
                            </div>
                        </div>
                        <button className="btn btn-link text-white p-0" onClick={() => setIsOpen(false)}>
                            <i className="bi bi-dash-lg fs-4"></i>
                        </button>
                    </div>

                    <div className="chat-messages p-3 overflow-auto" style={{ height: '350px' }}>
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`d-flex mb-3 ${chat.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                <div className={`message-bubble p-3 rounded-4 ${chat.role === 'user' ? 'bg-primary text-white user-bubble' : 'bg-light text-dark assistant-bubble shadow-sm'}`} style={{ maxWidth: '85%' }}>
                                    <ReactMarkdown>{chat.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
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

                    <form className="chat-input-area p-3 border-top" onSubmit={handleSend}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control border-0 bg-light rounded-pill px-3"
                                placeholder="Ask about notes, study tips..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={loading}
                            />
                            <button className="btn btn-primary rounded-circle ms-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }} type="submit" disabled={loading || !message.trim()}>
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                className={`chat-toggle-btn shadow-lg d-flex align-items-center justify-content-center transition-all ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="GyanStack AI Assistant"
            >
                {isOpen ? <i className="bi bi-x-lg fs-4"></i> : <i className="bi bi-robot fs-2"></i>}
                {!isOpen && <span className="notification-badge"></span>}
            </button>

            <style>{`
                .chat-widget-container {
                    position: fixed;
                    right: 25px;
                    bottom: 25px;
                    z-index: 9999;
                }
                .chat-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 350px;
                    border-radius: 20px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    background: var(--glass-bg);
                    backdrop-filter: blur(15px);
                }
                .chat-toggle-btn {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                    color: white;
                    border: none;
                    cursor: pointer;
                    position: relative;
                }
                .chat-toggle-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
                }
                .notification-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 15px;
                    height: 15px;
                    background: #ef4444;
                    border: 2px solid white;
                    border-radius: 50%;
                }
                .message-bubble {
                    font-size: 0.9rem;
                    line-height: 1.4;
                    word-wrap: break-word;
                }
                .user-bubble {
                    border-bottom-right-radius: 5px;
                }
                .assistant-bubble {
                    border-bottom-left-radius: 5px;
                    background: rgba(255, 255, 255, 0.8) !important;
                }
                .typing-indicator span {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    background-color: #6366f1;
                    border-radius: 50%;
                    margin-right: 3px;
                    animation: typing 1.4s infinite ease-in-out both;
                }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
                .chat-messages::-webkit-scrollbar {
                    width: 5px;
                }
                .chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                @media (max-width: 576px) {
                    .chat-window {
                        width: 300px;
                        right: -10px;
                    }
                }
            `}</style>
        </div>
    );
}
