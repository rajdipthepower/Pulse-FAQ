import React, { useState, useEffect } from 'react';

const BASE_URL = 'https://pulse-faq-backend.onrender.com'; // Ensure no trailing slash here

export default function App() {
    const [faqs, setFaqs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10); // Starts by showing 10 FAQs
    
    // Voting tracking state to prevent spamming
    const [votedItems, setVotedItems] = useState({}); 

    // Anonymous submission state
    const [newQuestion, setNewQuestion] = useState('');
    const [submitStatus, setSubmitStatus] = useState('');

    // Admin states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [pendingAqs, setPendingAqs] = useState([]);
    const [adminToken, setAdminToken] = useState('');

    // Manual FAQ creation state
    const [manualQuestion, setManualQuestion] = useState('');
    const [manualAnswer, setManualAnswer] = useState('');
    const [manualCategory, setManualCategory] = useState('Syntax & Basics');

    // Fetch initial FAQs
    useEffect(() => {
        console.log("PulseFAQ: Attempting connection to backend...");
        fetch(`${BASE_URL}/api`)
            .then(res => {
                console.log("PulseFAQ: Response received. Status:", res.status);
                return res.json();
            })
            .then(data => {
                console.log("PulseFAQ: Raw payload payload structural signature:", data);
                
                // 1. If it's a direct array
                if (Array.isArray(data)) {
                    setFaqs(data);
                } 
                // 2. If it's an object containing an inner array property (e.g., data.faqs or data.items)
                else if (data && typeof data === 'object') {
                    const nestedArray = Object.values(data).find(val => Array.isArray(val));
                    if (nestedArray) {
                        console.log("PulseFAQ: Extracted valid nested array:", nestedArray);
                        setFaqs(nestedArray);
                    } else {
                        console.error("PulseFAQ: Object wrapper contained no array array matching schema.");
                    }
                } else {
                    console.error("PulseFAQ: Received completely unexpected non-iterable payload structure.");
                }
            })
            .catch(err => console.error("PulseFAQ: Critical connection roadblock:", err));
            
        const history = localStorage.getItem('faq_votes');
        if (history) setVotedItems(JSON.parse(history));

        const token = localStorage.getItem('admin_token');
        if (token) {
            setIsAdmin(true);
            setAdminToken(token);
            fetchPending(token);
        }
    }, []);

    const fetchPending = (token) => {
            fetch(`${BASE_URL}/api/admin/pending`, {
            headers: { 'x-admin-token': token }
        })
            .then(res => res.json())
                .then(data => {
                if (Array.isArray(data)) setPendingAqs(data);
            });
    };

    // Bulk selection state for admin moderation
    const [selectedAqIds, setSelectedAqIds] = useState([]);

    // Answers typed by admin for each pending AQ (no prompt popups)
    const [adminAnswers, setAdminAnswers] = useState({});
    // Category selection for each pending AQ during moderation
    const [adminCategories, setAdminCategories] = useState({});

    // keep adminAnswers keys in sync with pendingAqs
    useEffect(() => {
        setAdminAnswers(prev => {
            const next = { ...prev };
            for (const p of pendingAqs) {
                if (!(p.id in next)) next[p.id] = '';
            }
            for (const k of Object.keys(next)) {
                if (!pendingAqs.find(p => String(p.id) === String(k))) delete next[k];
            }
            return next;
        });
        setAdminCategories(prev => {
            const next = { ...prev };
            for (const p of pendingAqs) {
                if (!(p.id in next)) next[p.id] = 'Syntax & Basics';
            }
            for (const k of Object.keys(next)) {
                if (!pendingAqs.find(p => String(p.id) === String(k))) delete next[k];
            }
            return next;
        });
    }, [pendingAqs]);

    const toggleSelect = (id) => {
        setSelectedAqIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const selectAllToggle = () => {
        if (selectedAqIds.length === pendingAqs.length) setSelectedAqIds([]);
        else setSelectedAqIds(pendingAqs.map(p => p.id));
    };

    // Extract unique categories dynamically from the entries safely
    const categories = ['All', 'Syntax & Basics', 'OOP Concepts', 'Data Structures', 'Advanced Features'];

    // Filtering & Sorting Logic
    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = (faq.question || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (faq.answer || '').toLowerCase().includes(searchQuery.toLowerCase());

        // Treat missing category as 'Syntax & Basics' and compare case-insensitively
        const itemCategory = (faq.category || 'Syntax & Basics').toLowerCase();
        const matchesCategory = selectedCategory === 'All' || itemCategory === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
    }).slice().sort((a, b) => (Number(b.upvotes) || 0) - (Number(a.upvotes) || 0));

    // Keep an explicit reference named `sortedFaqs` for mapping in the UI
    const sortedFaqs = filteredFaqs;

    // Admin edit state
    const [editingFaqId, setEditingFaqId] = useState(null);
    const [editDrafts, setEditDrafts] = useState({});

    const startEdit = (faq) => {
        setEditingFaqId(faq.id);
        setEditDrafts(prev => ({ 
            ...prev, 
                [faq.id]: { 
                question: faq.question || '', 
                answer: faq.answer || '', 
                category: faq.category || 'Syntax & Basics' 
            } 
        }));
    };

    const cancelEdit = (id) => {
        setEditingFaqId(null);
        setEditDrafts(prev => { const next = { ...prev }; delete next[id]; return next; });
    };

    const handleEditChange = (id, field, value) => {
        setEditDrafts(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const saveEdit = async (id) => {
        const payload = editDrafts[id];
        try {
            const res = await fetch(`${BASE_URL}/api/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                // In-place replacement completely protected against structure loss
                setFaqs(prevFaqs => prevFaqs.map(f => String(f.id) === String(id) ? {
                    ...f,
                    question: typeof payload?.question === 'string' ? payload.question : f.question,
                    answer: typeof payload?.answer === 'string' ? payload.answer : f.answer,
                    category: typeof payload?.category === 'string' ? payload.category : f.category,
                    updated_at: new Date().toISOString()
                } : f));
                setEditingFaqId(null);
                setEditDrafts(prev => { const next = { ...prev }; delete next[id]; return next; });
            } else {
                alert('Failed to save FAQ edit');
            }
        } catch (err) {
            console.error('Edit save error', err);
            alert('Error saving changes');
        }
    };

    const deleteFaq = async (id) => {
        if (!confirm('Are you sure you want to delete this live FAQ?')) return;
        try {
            const res = await fetch(`/api/${id}`, { 
                method: 'DELETE', 
                headers: { 'x-admin-token': adminToken } 
            });
            if (res.ok) {
                setFaqs(prev => prev.filter(f => String(f.id) !== String(id)));
            } else {
                alert('Failed to delete FAQ');
            }
        } catch (err) {
            console.error('Delete FAQ error', err);
            alert('Error deleting FAQ');
        }
    };

    const handleVote = async (id, type) => {
        try {
            const history = { ...votedItems };
            const prev = history[id];
            const isUp = type === 'upvote';

            // Determine what action we are sending to the backend
            let action = 'increment'; 
            if (prev === type) action = 'undo';
            else if (prev && prev !== type) action = 'switch';

            // Update UI State Optimistically
            setFaqs(prevFaqs => prevFaqs.map(item => {
                if (!item.id || String(item.id) !== String(id)) return item;
                const up = Number(item.upvotes) || 0;
                const down = Number(item.downvotes) || 0;

                if (action === 'undo') {
                    return {
                        ...item,
                        upvotes: isUp ? Math.max(0, up - 1) : up,
                        downvotes: isUp ? down : Math.max(0, down - 1)
                    };
                }
                if (action === 'switch') {
                    return {
                        ...item,
                        upvotes: isUp ? up + 1 : Math.max(0, up - 1),
                        downvotes: isUp ? Math.max(0, down - 1) : down + 1
                    };
                }
                return {
                    ...item,
                    upvotes: isUp ? up + 1 : up,
                    downvotes: isUp ? down : down + 1
                };
            }));

            // Sync structural history memory
            const updated = { ...history };
            if (action === 'undo') delete updated[id];
            else updated[id] = type;
            setVotedItems(updated);
            localStorage.setItem('faq_votes', JSON.stringify(updated));

            // Network synchronization
            try {
                const res = await fetch(`${BASE_URL}/api/${id}/vote`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, action }) // Now passing action context!
                });
                const serverData = await res.json();
                if (res.ok && serverData.item) {
                    // Lock the local UI state directly to the database file truth
                    setFaqs(prevFaqs => prevFaqs.map(item => 
                        String(item.id) === String(id) ? serverData.item : item
                    ));
                }
            } catch (e) {
                console.error("Server syncing delayed:", e);
            }
        } catch (err) {
            console.error('Voting layout roadblock:', err);
        }
    };

    // Simple wrapper for single-button upvote from the simplified UI mapping
    const handleUpvote = (id) => handleVote(id, 'upvote');

    const handleSubmitAQ = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;
        try {
            const res = await fetch(`${BASE_URL}/api/aqs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: newQuestion })
            });
            if (res.ok) {
                setNewQuestion('');
                setSubmitStatus('Question submitted successfully for review!');
                setTimeout(() => setSubmitStatus(''), 4000);
            }
        } catch (err) {
            setSubmitStatus('Failed to submit question.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.token) {
                setIsAdmin(true);
                setAdminToken(data.token);
                localStorage.setItem('admin_token', data.token);
                fetchPending(data.token);
            } else {
                alert('Invalid credentials');
            }
        } catch (err) {
            alert('Login server error');
        }
    };

    const handleManualPublish = async (e) => {
        e.preventDefault();
        if (!manualQuestion.trim() || !manualAnswer.trim()) {
            alert('Please fill in both question and answer fields.');
            return;
        }
        try {
            const res = await fetch(`${BASE_URL}/api/admin/publish`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-admin-token': adminToken
                },
                body: JSON.stringify({ 
                    question: manualQuestion, 
                    answer: manualAnswer, 
                    category: manualCategory,
                    isFAQ: true
                })
            });
                if (res.ok) {
                setManualQuestion('');
                setManualAnswer('');
                setManualCategory('Syntax & Basics');
                    fetch(`${BASE_URL}/api`).then(r => r.json()).then(d => { if(Array.isArray(d)) setFaqs(d); });
                alert('FAQ published directly!');
            } else {
                alert('Failed to publish FAQ.');
            }
        } catch (err) {
            console.error('Publish error:', err);
            alert('Error publishing FAQ.');
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
            
            <nav className={`border-b px-6 py-4 flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="self-start">
                    <a onClick={() => window.location.reload()} className="no-underline cursor-pointer">
                        <h1 className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">⚡ PulseFAQ</h1>
                    </a>
                </div>
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={() => setDarkMode(!darkMode)} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${darkMode ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-slate-100 border-slate-300 hover:bg-slate-200'}`}
                    >
                        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    {isAdmin && (
                        <button 
                            onClick={() => {
                                localStorage.removeItem('admin_token');
                                setIsAdmin(false);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                        <input 
                            type="text"
                            placeholder="🔍 Search across all python questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full p-3 rounded-lg border text-lg outline-none transition focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-300 placeholder-slate-500'}`}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white' : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 shadow-sm hover:bg-slate-100')}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm opacity-60">Showing {filteredFaqs.length} of {faqs.length} entries</p>
                        {[...filteredFaqs].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, visibleCount).map((faq, index) => {
                            return (
                            <div 
                                key={faq.id || faq._id} 
                                className={`rounded-xl border transition duration-200 overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
                            >
                                <button
                                    onClick={() => setActiveAccordion(activeAccordion === faq.id ? null : faq.id)}
                                    className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-slate-500/5"
                                >
                                    <span className="font-semibold text-base leading-snug">Q{index + 1}. {(faq.question || '').replace(/^Q\d+\.\s*/i, '')}</span>
                                    <span className="text-xl opacity-50">{activeAccordion === faq.id ? '▲' : '▼'}</span>
                                </button>

                                {activeAccordion === faq.id && (
                                    <div className={`p-5 border-t text-sm leading-relaxed ${darkMode ? 'border-slate-700 bg-slate-800/40 text-slate-300' : 'border-slate-100 bg-slate-50/50 text-slate-600'}`}>
                                        {editingFaqId === faq.id ? (
                                            <div className="space-y-3">
                                                <input
                                                    value={editDrafts[faq.id]?.question || ''}
                                                    onChange={(e) => handleEditChange(faq.id, 'question', e.target.value)}
                                                    className="w-full p-2 rounded border dark:bg-slate-700 dark:text-white text-sm"
                                                />
                                                <textarea
                                                    rows={4}
                                                    value={editDrafts[faq.id]?.answer || ''}
                                                    onChange={(e) => handleEditChange(faq.id, 'answer', e.target.value)}
                                                    className="w-full p-2 rounded border dark:bg-slate-700 dark:text-white text-sm"
                                                />
                                                <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                                                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                                                        Assign Category:
                                                    </label>
                                                    <select
                                                        value={editDrafts[faq.id]?.category || 'Syntax & Basics'}
                                                        onChange={(e) => handleEditChange(faq.id, 'category', e.target.value)}
                                                        style={{
                                                            padding: '6px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #ccc',
                                                            backgroundColor: '#fff',
                                                            width: '100%',
                                                            maxWidth: '200px'
                                                        }}
                                                    >
                                                        <option value="Syntax & Basics">Syntax & Basics</option>
                                                        <option value="OOP Concepts">OOP Concepts</option>
                                                        <option value="Data Structures">Data Structures</option>
                                                        <option value="Advanced Features">Advanced Features</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => saveEdit(faq.id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold">Save</button>
                                                    <button onClick={() => cancelEdit(faq.id)} className="px-3 py-1 bg-gray-400 text-white rounded text-sm font-semibold">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="mb-4 whitespace-pre-wrap">{faq.answer}</p>
                                                <div className="flex items-center justify-between border-t pt-3 mt-2 border-dashed border-slate-600/20">
                                                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/10 text-blue-500">{faq.category || 'Syntax & Basics'}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs opacity-60">Was this helpful?</span>
                                                        <button 
                                                            onClick={() => handleVote(faq.id, 'upvote')}
                                                            disabled={isAdmin}
                                                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${votedItems[faq.id] === 'upvote' ? 'bg-green-500 text-white' : 'hover:bg-green-500/20'} ${isAdmin ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                        >
                                                            👍 {faq.upvotes || 0}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleVote(faq.id, 'downvote')}
                                                            disabled={isAdmin}
                                                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${votedItems[faq.id] === 'downvote' ? 'bg-red-500 text-white' : 'hover:bg-red-500/20'} ${isAdmin ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                        >
                                                            👎 {faq.downvotes || 0}
                                                        </button>
                                                        {isAdmin && (
                                                            <div className="flex gap-1 border-l pl-2 border-slate-600/30">
                                                                <button onClick={() => startEdit(faq)} className="px-2 py-1 text-xs font-semibold rounded bg-yellow-400 text-black">✏️ Edit</button>
                                                                <button onClick={() => deleteFaq(faq.id)} className="px-2 py-1 text-xs font-semibold rounded bg-red-600 text-white">❌ Delete</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            );
                        })}

                        {/* Add this right below your closed FAQ items block */}
                        {visibleCount < filteredFaqs.length && (
                          <div className="flex justify-center mt-6 mb-8">
                            <button 
                              onClick={() => setVisibleCount(prev => prev + 10)} 
                              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition tracking-wide border ${
                                darkMode 
                                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-blue-400' 
                                  : 'bg-white border-slate-200 shadow-sm hover:bg-slate-50 text-blue-600'
                              }`}
                            >
                              See More Questions ↓
                            </button>
                          </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {!isAdmin && (
                        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">📣 Crowd-Source an AQ</h3>
                            <form onSubmit={handleSubmitAQ} className="space-y-3">
                                <textarea
                                    rows="4"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="Got a new question related to python? Type it here anonymously..."
                                    className={`w-full p-3 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-300'}`}
                                    required
                                />
                                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
                                    Submit
                                </button>
                                {submitStatus && <p className="text-xs text-center font-medium mt-2 text-green-500">{submitStatus}</p>}
                            </form>
                        </div>
                    )}

                    {!isAdmin ? (
                        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <h3 className="text-base font-bold mb-3">🔒 Admin Portal</h3>
                            <form onSubmit={handleLogin} className="space-y-3">
                                <input 
                                    type="email" placeholder="Email (abc@gmail.com)" value={email} onChange={e => setEmail(e.target.value)}
                                    className={`w-full p-2.5 text-xs rounded border outline-none ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50'}`} required
                                />
                                <input 
                                    type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                                    className={`w-full p-2.5 text-xs rounded border outline-none ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50'}`} required
                                />
                                <button type="submit" className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded">
                                    Login
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">➕ Manual FAQ Insertion</h3>
                                <form onSubmit={handleManualPublish} className="space-y-3">
                                    <input 
                                        type="text" 
                                        placeholder="Custom Question" 
                                        value={manualQuestion} 
                                        onChange={e => setManualQuestion(e.target.value)}
                                        className={`w-full p-2.5 text-xs rounded border outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-300'}`} 
                                        required
                                    />
                                    <select 
                                        value={manualCategory} 
                                        onChange={e => setManualCategory(e.target.value)}
                                        className={`w-full p-2.5 text-xs rounded border outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-300'}`}
                                    >
                                        <option value="Syntax & Basics">Syntax & Basics</option>
                                        <option value="OOP Concepts">OOP Concepts</option>
                                        <option value="Data Structures">Data Structures</option>
                                        <option value="Advanced Features">Advanced Features</option>
                                    </select>
                                    <textarea
                                        rows="3"
                                        value={manualAnswer}
                                        onChange={(e) => setManualAnswer(e.target.value)}
                                        placeholder="Official Answer"
                                        className={`w-full p-2.5 text-xs rounded border outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-300'}`}
                                        required
                                    />
                                    <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded">
                                        Publish Directly
                                    </button>
                                </form>
                            </div>

                            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <h3 className="text-lg font-bold mb-3 text-amber-500 flex items-center gap-2">🛠️ Moderation Desk</h3>
                                <p className="text-xs opacity-60 mb-3">{pendingAqs.length} unique questions awaiting approval.</p>

                                <div className="flex items-center gap-3 mb-3">
                                    <label className="flex items-center gap-2 text-xs">
                                        <input type="checkbox" checked={selectedAqIds.length === pendingAqs.length && pendingAqs.length > 0} onChange={selectAllToggle} />
                                        Select All
                                    </label>
                                    <button
                                        onClick={async () => {
                                            if (!selectedAqIds.length) return alert('No items selected');
                                            const missing = selectedAqIds.filter(id => !(adminAnswers[id] && adminAnswers[id].trim()));
                                            if (missing.length) return alert('Please provide answers for all selected items before bulk approving.');
                                            for (const id of selectedAqIds) {
                                                const ans = adminAnswers[id];
                                                await fetch(`${BASE_URL}/api/admin/approve`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
                                                    body: JSON.stringify({ id, answer: ans, category: adminCategories[id] || 'Syntax & Basics' })
                                                });
                                            }
                                            fetchPending(adminToken);
                                            fetch(`${BASE_URL}/api/faqs`).then(r => r.json()).then(d => { if(Array.isArray(d)) setFaqs(d); });
                                            setSelectedAqIds([]);
                                            alert('Selected items approved');
                                        }}
                                        className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold"
                                        disabled={selectedAqIds.length === 0}
                                    >
                                        Bulk Approve
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!selectedAqIds.length) return alert('No items selected');
                                            if (!confirm('Permanently delete selected pending items?')) return;
                                            const res = await fetch(`${BASE_URL}/api/admin/pending`, {
                                                method: 'DELETE',
                                                headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
                                                body: JSON.stringify({ ids: selectedAqIds })
                                            });
                                            if (res.ok) {
                                                fetchPending(adminToken);
                                                setSelectedAqIds([]);
                                                alert('Selected items removed');
                                            }
                                        }}
                                        className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold"
                                        disabled={selectedAqIds.length === 0}
                                    >
                                        Bulk Reject
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                                    {pendingAqs.map(aq => (
                                        <div key={aq.id} className="p-3 rounded border text-xs space-y-2 border-amber-500/30 bg-amber-500/5 flex flex-col gap-3">
                                            <div className="flex items-start gap-3">
                                                <input type="checkbox" checked={selectedAqIds.includes(aq.id)} onChange={() => toggleSelect(aq.id)} className="mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-slate-300">AQ: "{aq.question}"</p>
                                                    <p className="text-[10px] text-amber-400">Frequency Score: {aq.submission_count || 1}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: 'column' }}>
                                                <div style={{ width: '100%', maxWidth: '220px' }}>
                                                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Assign Category</label>
                                                    <select
                                                        value={adminCategories[aq.id] || 'Syntax & Basics'}
                                                        onChange={(e) => setAdminCategories(prev => ({ ...prev, [aq.id]: e.target.value }))}
                                                        className="w-full p-2 text-xs rounded border bg-amber-50 text-amber-900"
                                                    >
                                                        <option value="Syntax & Basics">Syntax & Basics</option>
                                                        <option value="OOP Concepts">OOP Concepts</option>
                                                        <option value="Data Structures">Data Structures</option>
                                                        <option value="Advanced Features">Advanced Features</option>
                                                    </select>
                                                </div>

                                                <textarea
                                                    value={adminAnswers[aq.id] || ''}
                                                    onChange={(e) => setAdminAnswers(prev => ({ ...prev, [aq.id]: e.target.value }))}
                                                    placeholder="Type official answer here..."
                                                    className="w-full p-2 text-xs rounded border bg-amber-50 text-amber-900"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={async () => {
                                                        const ans = adminAnswers[aq.id] && adminAnswers[aq.id].trim();
                                                        if (!ans) return alert('Please provide an answer before approving.');
                                                        const res = await fetch(`${BASE_URL}/api/admin/approve`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
                                                            body: JSON.stringify({ id: aq.id, answer: ans, category: adminCategories[aq.id] || 'Syntax & Basics' })
                                                        });
                                                        if (res.ok) {
                                                            setFaqs(prev => prev.filter(f => f.id && String(f.id) !== String(id)));
                                                            fetchPending(adminToken);
                                                            fetch(`${BASE_URL}/api/faqs`).then(r => r.json()).then(d => { if(Array.isArray(d)) setFaqs(d); });
                                                            alert('Question Promoted to Public FAQ!');
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition text-xs flex-1"
                                                    disabled={!(adminAnswers[aq.id] && adminAnswers[aq.id].trim())}
                                                >
                                                    Answer & Approve
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Reject and delete this pending item?')) return;
                                                        const res = await fetch(`${BASE_URL}/api/admin/pending/${aq.id}`, {
                                                            method: 'DELETE',
                                                            headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }
                                                        });
                                                        if (res.ok) {
                                                            setSelectedAqIds(prev => prev.filter(x => x !== aq.id));
                                                            fetchPending(adminToken);
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition text-xs flex-1"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
