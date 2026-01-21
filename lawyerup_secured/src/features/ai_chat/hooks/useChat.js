import { useState, useRef, useEffect } from 'react';
import API from '../../../app/api/api_endpoints';

const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [chatId, setChatId] = useState(null);
    const [title, setTitle] = useState('New Chat');
    const [model, setModel] = useState('lawai-2.0');
    const [isGenerating, setIsGenerating] = useState(false);
    const [responseTime, setResponseTime] = useState(null);
    const textareaRef = useRef(null);
    const scrollRef = useRef(null);
    const shouldAutoScroll = useRef(true);
    const [locked, setLocked] = useState(false);


    const hasStarted = messages.length > 0;

    const resizeTextarea = () => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 120) + 'px';
        }
    };

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        shouldAutoScroll.current = distanceFromBottom < 100;
    };

    const handleSend = async (text = input.trim()) => {
        if (!text) return;

        const userMessage = { text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        resizeTextarea();
        setIsGenerating(true);

        // ➕ Placeholder for bot stream
        setMessages(prev => [...prev, { text: '', sender: 'bot' }]);

        try {
            const startTime = Date.now();
            let currentChatId = chatId;

            if (!chatId) {
                const res = await fetch(`${API.AI}/chats`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('lawyerup_token')}`
                    },
                    body: JSON.stringify({
                        title: 'New Chat',
                        model: model || 'gemma-3-12b-it-q4f'
                    })
                });
                const data = await res.json();
                currentChatId = data._id;
                setChatId(currentChatId);
            }

            const saveRes = await fetch(`${API.AI}/appendUserMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('lawyerup_token')}`
                },
                body: JSON.stringify({ chatId: currentChatId, message: text })
            });

// 🛡️ Check if trial limit is hit
            if (!saveRes.ok) {
                const errorText = await saveRes.text();
                throw new Error(errorText || 'Trial limit reached or message save failed');
            }


            const response = await fetch('http://localhost:8010/proxy/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3:8b-instruct',
                    stream: true,
                    messages: [
                        { role: 'system', content: 'You are LawyerUp AI – a professional, reliable Nepali legal assistant.\n' +
                                '\n' +
                                'You must only answer questions strictly related to:\n' +
                                '- Nepali law and legal procedures\n' +
                                '- Social, political, and geopolitical matters (if they relate to law)\n' +
                                '- Government regulations, legal rights, or constitutional topics\n' +
                                '\n' +
                                'Do NOT answer anything unrelated to legal, civic, or governmental matters.\n' +
                                '\n' +
                                'You may respond in simple English or Nepali based on the user’s tone. Be concise, helpful, and accurate. If a user asks something outside your domain, politely say that LawyerUp AI is focused only on legal topics.\n.' },
                        ...messages.map(m => ({
                            role: m.sender === 'user' ? 'user' : 'assistant',
                            content: m.text
                        })),
                        { role: 'user', content: text }
                    ]
                })
            });

            if (!response.ok || !response.body) throw new Error('Streaming failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.trim() === 'data: [DONE]') continue;

                    if (line.startsWith('data:')) {
                        try {
                            const json = JSON.parse(line.replace('data: ', ''));
                            const token = json.choices?.[0]?.delta?.content;
                            if (token) {
                                fullText += token;
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = {
                                        ...updated[updated.length - 1],
                                        text: fullText
                                    };
                                    return updated;
                                });
                                await new Promise(r => setTimeout(r, 8));
                            }
                        } catch (err) {
                            console.warn("⚠️ Malformed line skipped:", line);
                        }
                    }
                }
            }

            setIsGenerating(false);
            setResponseTime(Date.now() - startTime);

            if (fullText.trim()) {
                await fetch(`${API.AI}/saveReply`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('lawyerup_token')}`
                    },
                    body: JSON.stringify({ chatId: currentChatId, reply: fullText })
                });
            }

            if (title === 'New Chat') {
                const short = text.trim().slice(0, 30);
                const formattedTitle = short.charAt(0).toUpperCase() + short.slice(1);
                setTitle(formattedTitle);

                await fetch(`${API.AI}/chats/${currentChatId}/title`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('lawyerup_token')}`
                    },
                    body: JSON.stringify({ title: formattedTitle })
                });
            }

        } catch (err) {
            setIsGenerating(false);

            if (err.message.includes('403') || err.message.includes('Trial')) {
                setLocked(true);
                setMessages(prev => [...prev, {
                    text: '❌ You’ve hit your daily limit. Upgrade to continue or come back tomorrow.',
                    sender: 'bot'
                }]);

                // Optionally show SweetAlert upsell
                import('sweetalert2').then(({ default: Swal }) => {
                    Swal.fire({
                        title: 'Trial Ended 💡',
                        text: 'Upgrade to LawyerUp Premium for unlimited access.',
                        icon: 'warning',
                        confirmButtonText: 'Get Premium',
                        showCancelButton: true
                    });
                });

            } else {
                console.error('❌ Streaming error:', err.message);
                setMessages(prev => [...prev, {
                    text: '⚠️ Error connecting to LLM server.',
                    sender: 'bot'
                }]);
            }
        }
    };

    const newChat = () => {
        setMessages([]);
        setInput('');
        setChatId(null);
        setTitle('New Chat');
    };

    const loadChat = (chat) => {
        setChatId(chat._id);
        setMessages(chat.messages.map(m => ({
            text: m.content,
            sender: m.role === 'user' ? 'user' : 'bot',
        })));
        setTitle(chat.title);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.addEventListener('scroll', handleScroll);
        return () => el?.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (scrollRef.current && shouldAutoScroll.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        document.body.style.overflow = hasStarted ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [hasStarted]);

    return {
        messages,
        input,
        setInput,
        handleSend,
        textareaRef,
        resizeTextarea,
        hasStarted,
        isGenerating,
        responseTime,
        scrollRef,
        chatId,
        title,
        model,
        setModel,
        newChat,
        loadChat,
        locked,
    };
};

export default useChat;
