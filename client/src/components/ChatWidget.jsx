import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const GUEST_MESSAGE_LIMIT = 5;

const QUICK_ACTIONS = [
    { label: '📄 Find a document', msg: 'Find ' },
    { label: '📝 Make notes', msg: 'Make notes on ' },
    { label: '❓ Practice questions', msg: 'Generate practice questions for ' },
    { label: '👤 Find uploader', msg: 'Who uploaded ' },
    { label: '📬 Request content', msg: 'Request content for ' },
];

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };
    return (
        <button
            onClick={handleCopy}
            title="Copy message"
            style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '2px 6px', borderRadius: '6px', opacity: 0.5,
                fontSize: '0.7rem', color: 'var(--text-muted)',
                transition: 'opacity 0.2s',
                position: 'absolute', bottom: '4px', right: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => { if (!copied) e.currentTarget.style.opacity = 0.5; }}
        >
            {copied ? <i className="bi bi-check2 text-success" /> : <i className="bi bi-clipboard" />}
        </button>
    );
}

export default function ChatWidget() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: 'Hi! I am **GyanStack AI** — your personal Study Buddy 🎓\n\nI can help you:\n- 🔍 Find documents by name\n- 📝 Generate notes & summaries\n- ❓ Create practice questions\n- 👤 Look up uploaders\n- 📬 Submit content requests\n\nWhat would you like to study today?' }
    ]);
    const [loading, setLoading] = useState(false);
    const [guestCount, setGuestCount] = useState(0);
    const [selections, setSelections] = useState(null);
    const [sessionId, setSessionId] = useState('');
    const [requestSuccess, setRequestSuccess] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        let currentSession = sessionStorage.getItem('gyanstack_chat_session');
        if (!currentSession) {
            currentSession = `session_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
            sessionStorage.setItem('gyanstack_chat_session', currentSession);
        }
        setSessionId(currentSession);

        if (!user) {
            const savedHistory = localStorage.getItem('gyanstack_ai_history');
            if (savedHistory) { try { setChatHistory(JSON.parse(savedHistory)); } catch(e){} }
        }

        const savedCount = localStorage.getItem('gyanstack_guest_count');
        if (savedCount) setGuestCount(parseInt(savedCount));
    }, [user]);

    useEffect(() => {
        if (user && sessionId) {
            const fetchHistory = async () => {
                try {
                    const { data } = await api.get(`/ai/history/${sessionId}`);
                    if (data.messages && data.messages.length > 0) setChatHistory(data.messages);
                } catch (err) { console.error('Failed to load study history:', err); }
            };
            fetchHistory();
        }
    }, [user, sessionId]);

    const saveTimerRef = useRef(null);
    useEffect(() => {
        if (!user && chatHistory.length > 1) {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                const toSave = chatHistory.slice(-20);
                localStorage.setItem('gyanstack_ai_history', JSON.stringify(toSave));
            }, 500);
        }
        return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    }, [chatHistory, user]);

    useEffect(() => {
        if (user) { localStorage.removeItem('gyanstack_guest_count'); setGuestCount(0); }
    }, [user]);

    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isOpen, loading]);

    useEffect(() => {
        const handleToggle = () => setIsOpen(true);
        window.addEventListener('toggle-ai-chat', handleToggle);
        return () => window.removeEventListener('toggle-ai-chat', handleToggle);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 200);
    }, [isOpen]);

    const sendMessage = useCallback(async (msg) => {
        if (!msg.trim() || loading) return;
        if (!user && guestCount >= GUEST_MESSAGE_LIMIT) return;

        const userMsg = { role: 'user', content: msg };
        const updatedHistory = [...chatHistory, userMsg];
        setChatHistory(updatedHistory);
        setMessage('');
        setLoading(true);
        setSelections(null);
        setRequestSuccess(false);

        try {
            const { data } = await api.post('/ai/chat', {
                message: msg,
                chatHistory: updatedHistory.slice(-10),
                currentPath: window.location.pathname,
                sessionId
            });

            setChatHistory(curr => [...curr, { role: 'assistant', content: data.reply }]);

            if (data.action?.type === 'navigate') {
                navigate(data.action.path);
            } else if (data.action?.type === 'selections') {
                setSelections(data.action.options);
            } else if (data.action?.type === 'request_success') {
                setRequestSuccess(true);
                // Show track button after delay
                setTimeout(() => {
                    setSelections([{ label: '📬 Track My Request', path: '/request' }]);
                }, 800);
            }

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
    }, [chatHistory, guestCount, loading, navigate, sessionId, user]);

    const handleSend = (e) => { e.preventDefault(); sendMessage(message); };

    const handleQuickAction = (msg) => {
        setMessage(msg);
        inputRef.current?.focus();
    };

    const isLimitReached = !user && guestCount >= GUEST_MESSAGE_LIMIT;

    const handleSelectOption = (path, label) => {
        setSelections(null);

        if (!path || path === 'null' || path === 'undefined') {
            setChatHistory(curr => [
                ...curr,
                { role: 'user', content: label },
                { role: 'assistant', content: `I'm sorry, but I don't have a valid link for **${label}** right now. Would you like me to submit a content request for it? 📬` }
            ]);
            return;
        }

        if (path === '/request') {
            navigate(path);
            return;
        }

        if (path.includes('category=') || path.startsWith('/browse')) {
            const userMsg = { role: 'user', content: label };
            setChatHistory(curr => [...curr, userMsg]);
            setLoading(true);
            api.post('/ai/chat', {
                message: label,
                chatHistory: [...chatHistory, userMsg].slice(-10),
                sessionId
            }).then(({ data }) => {
                setChatHistory(curr => [...curr, { role: 'assistant', content: data.reply }]);
                if (data.action?.type === 'selections') setSelections(data.action.options);
                if (data.action?.type === 'navigate') navigate(data.action.path);
            }).catch(err => {
                const errorMsg = err.response?.data?.message || 'Sorry, let me try that again.';
                setChatHistory(curr => [...curr, { role: 'assistant', content: errorMsg }]);
            }).finally(() => { setLoading(false); setMessage(''); });
            return;
        }

        setChatHistory(curr => [
            ...curr,
            { role: 'user', content: label },
            { role: 'assistant', content: `Opening **${label}** for you... 🚀` }
        ]);
        navigate(path);
    };

    return (
        <div className="chat-widget-container">
            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window shadow-lg border-0 fade-in">

                    {/* Header */}
                    <div className="chat-header d-flex justify-content-between align-items-center px-3 py-2 text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <div className="d-flex align-items-center gap-2">
                            <div className="ai-avatar">
                                <i className="bi bi-robot fs-5" />
                            </div>
                            <div>
                                <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>GyanStack AI</h6>
                                <small className="opacity-75" style={{ fontSize: '0.68rem' }}>
                                    <span className="live-dot" /> Study Buddy • Online
                                </small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                            <button
                                className="btn btn-link text-white p-1 opacity-75"
                                title="Clear chat"
                                onClick={() => {
                                    setChatHistory([{ role: 'assistant', content: 'Chat cleared! How can I help you study? 📚' }]);
                                    setSelections(null);
                                    if (!user) localStorage.removeItem('gyanstack_ai_history');
                                }}
                                style={{ fontSize: '0.8rem' }}
                            >
                                <i className="bi bi-arrow-counterclockwise" />
                            </button>
                            <button className="btn btn-link text-white p-1" onClick={() => setIsOpen(false)}>
                                <i className="bi bi-dash-lg fs-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages p-3 overflow-auto" style={{ height: '420px', background: 'var(--surface-color)' }}>
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`d-flex mb-3 ${chat.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                {chat.role === 'assistant' && (
                                    <div className="ai-avatar-sm me-2 flex-shrink-0">
                                        <i className="bi bi-robot" style={{ fontSize: '0.8rem' }} />
                                    </div>
                                )}
                                <div
                                    className={`message-bubble p-3 rounded-4 position-relative ${chat.role === 'user' ? 'user-bubble' : 'ai-bubble shadow-sm'}`}
                                    style={{ maxWidth: '85%' }}
                                >
                                    <ReactMarkdown
                                        components={{
                                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                                        }}
                                    >
                                        {chat.content}
                                    </ReactMarkdown>

                                    {/* Selections (inside the last assistant bubble) */}
                                    {chat.role === 'assistant' && index === chatHistory.length - 1 && selections && (
                                        <div className="mt-2 d-flex flex-wrap gap-2">
                                            {selections.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSelectOption(opt.path, opt.label)}
                                                    className="btn btn-sm selection-pill rounded-pill px-3 py-1 fw-semibold"
                                                    style={{ fontSize: '0.76rem' }}
                                                >
                                                    <i className="bi bi-arrow-right-circle me-1" />
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Copy button for AI messages */}
                                    {chat.role === 'assistant' && (
                                        <CopyButton text={chat.content} />
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Guest Limit Notice */}
                        {isLimitReached && (
                            <div className="text-center p-3 mt-2 border border-warning rounded-4 bg-warning bg-opacity-10">
                                <i className="bi bi-shield-lock-fill text-warning fs-3 mb-2 d-block" />
                                <h6 className="fw-bold mb-1">Daily Limit Reached</h6>
                                <p className="small text-muted mb-3">
                                    Login to unlock unlimited chat and save your study history!
                                </p>
                                <a href="/login" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold">Login to Continue</a>
                            </div>
                        )}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="d-flex justify-content-start mb-3 align-items-center gap-2">
                                <div className="ai-avatar-sm">
                                    <i className="bi bi-robot" style={{ fontSize: '0.8rem' }} />
                                </div>
                                <div className="ai-bubble p-3 rounded-4 shadow-sm">
                                    <div className="typing-indicator">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {!isLimitReached && chatHistory.length <= 1 && (
                        <div className="quick-actions px-3 py-2 d-flex gap-2 overflow-auto" style={{ borderTop: '1px solid var(--glass-border)' }}>
                            {QUICK_ACTIONS.map((qa, i) => (
                                <button
                                    key={i}
                                    className="btn btn-sm quick-action-chip flex-shrink-0"
                                    onClick={() => handleQuickAction(qa.msg)}
                                    style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                                >
                                    {qa.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    {!isLimitReached ? (
                        <form className="chat-input-area p-3 border-top" onSubmit={handleSend}>
                            <div className="input-group">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="form-control border-0 rounded-pill px-3"
                                    placeholder="Ask me anything about your studies..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={loading}
                                    style={{ fontSize: '0.88rem' }}
                                />
                                <button
                                    className="btn btn-primary rounded-circle ms-2 d-flex align-items-center justify-content-center send-btn"
                                    type="submit"
                                    disabled={loading || !message.trim()}
                                >
                                    <i className="bi bi-send-fill" style={{ fontSize: '1rem' }} />
                                </button>
                            </div>
                            {!user && (
                                <div className="text-center mt-1">
                                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>
                                        {GUEST_MESSAGE_LIMIT - guestCount} guest message{GUEST_MESSAGE_LIMIT - guestCount !== 1 ? 's' : ''} left — <a href="/login" className="text-primary text-decoration-none fw-bold">Login</a> for unlimited
                                    </small>
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className="p-3 border-top text-center" style={{ background: 'var(--glass-bg)' }}>
                            <small className="text-danger fw-bold">Chat locked. Please <a href="/login">log in</a> to continue.</small>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                className={`chat-toggle-btn shadow-lg d-flex align-items-center justify-content-center ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="GyanStack AI — Study Buddy"
            >
                {isOpen
                    ? <i className="bi bi-x-lg fs-4" />
                    : <i className="bi bi-robot fs-2" />
                }
                {!isOpen && !user && guestCount > 0 && (
                    <span className="notification-badge bg-warning">!</span>
                )}
            </button>

            <style>{`
                /* ── Container & Window ─────────────────────────── */
                .chat-widget-container {
                    position: fixed; right: 25px; bottom: 25px; z-index: 9999;
                }
                .chat-window {
                    position: absolute; bottom: 80px; right: 0; width: 385px;
                    border-radius: 20px; overflow: hidden; display: flex;
                    flex-direction: column;
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border) !important;
                    box-shadow: 0 16px 48px rgba(0,0,0,0.22);
                    animation: slideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                /* ── Header ─────────────────────────────────────── */
                .chat-header { min-height: 58px; }
                .live-dot {
                    display: inline-block; width: 7px; height: 7px;
                    background: #86efac; border-radius: 50%;
                    margin-right: 4px; animation: livePulse 2s infinite;
                }
                .ai-avatar {
                    width: 36px; height: 36px; background: white; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    color: #10b981; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    flex-shrink: 0;
                }
                .ai-avatar-sm {
                    width: 26px; height: 26px; border-radius: 50%;
                    background: linear-gradient(135deg, #10b981, #059669);
                    display: flex; align-items: center; justify-content: center;
                    color: white; flex-shrink: 0; align-self: flex-end;
                }

                /* ── Message Bubbles ─────────────────────────────── */
                .message-bubble { font-size: 0.88rem; line-height: 1.55; word-wrap: break-word; }
                .user-bubble {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                    color: white !important;
                    border-bottom-right-radius: 6px !important;
                }
                .ai-bubble {
                    background: var(--surface-color) !important;
                    color: var(--text-primary) !important;
                    border: 1px solid var(--glass-border);
                    border-bottom-left-radius: 6px !important;
                    padding-bottom: 22px !important;
                }
                .ai-bubble p { margin-bottom: 0.4rem; }
                .ai-bubble p:last-child { margin-bottom: 0; }
                .ai-bubble ul, .ai-bubble ol { padding-left: 1.2rem; margin-bottom: 0.4rem; }

                .user-bubble p, .user-bubble ul, .user-bubble li { color: white !important; }

                /* ── Selection Pills ─────────────────────────────── */
                .selection-pill {
                    transition: all 0.2s ease;
                    border: 1px solid var(--primary);
                    color: var(--primary);
                    background: transparent;
                    white-space: nowrap;
                }
                .selection-pill:hover {
                    background: var(--primary); color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                }

                /* ── Quick Action Chips ──────────────────────────── */
                .quick-actions { background: var(--glass-bg); scrollbar-width: none; }
                .quick-actions::-webkit-scrollbar { display: none; }
                .quick-action-chip {
                    background: var(--surface-color) !important;
                    border: 1px solid var(--glass-border) !important;
                    color: var(--text-primary) !important;
                    border-radius: 999px !important;
                    transition: all 0.2s;
                }
                .quick-action-chip:hover {
                    background: var(--primary) !important;
                    color: white !important;
                    border-color: var(--primary) !important;
                    transform: translateY(-1px);
                }

                /* ── Input Area ──────────────────────────────────── */
                .chat-input-area { background: var(--glass-bg); border-top: 1px solid var(--glass-border) !important; }
                .chat-input-area .form-control {
                    background: var(--surface-color) !important;
                    color: var(--text-primary) !important;
                    border: 1px solid var(--glass-border) !important;
                    font-size: 0.88rem;
                }
                .chat-input-area .form-control::placeholder { color: var(--text-muted); opacity: 0.7; }
                .send-btn { width: 40px; height: 40px; flex-shrink: 0; padding: 0; }

                /* ── Toggle Button ───────────────────────────────── */
                .chat-toggle-btn {
                    width: 62px; height: 62px; border-radius: 50%;
                    background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
                    color: white; border: none; cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                }
                .chat-toggle-btn:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 8px 28px rgba(16, 185, 129, 0.45); }
                .chat-toggle-btn.active { transform: rotate(90deg); background: linear-gradient(135deg, #ef4444, #dc2626); }
                .notification-badge {
                    position: absolute; top: 0; right: 0;
                    width: 22px; height: 22px; border: 2px solid white;
                    border-radius: 50%; font-size: 0.72rem;
                    display: flex; align-items: center; justify-content: center;
                    animation: pulse 2s infinite;
                }

                /* ── Typing Indicator ────────────────────────────── */
                .typing-indicator span {
                    display: inline-block; width: 6px; height: 6px;
                    background-color: var(--primary); border-radius: 50%;
                    margin-right: 3px;
                    animation: typing 1.4s infinite ease-in-out both;
                }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

                /* ── Animations ──────────────────────────────────── */
                @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
                @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.45); } 70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
                @keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

                /* ── Mobile ──────────────────────────────────────── */
                @media (max-width: 576px) {
                    .chat-window { width: calc(100vw - 36px); right: -10px; bottom: 75px; }
                }
            `}</style>
        </div>
    );
}
