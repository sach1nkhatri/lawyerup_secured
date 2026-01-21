import { useEffect, useState } from 'react';
import { fetchChats, deleteChat, getChatById } from '../../../app/api/chatService';

const useChatHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await fetchChats();
            setHistory(res.data); // ✅ Provide all chat data to UI
        } finally {
            setLoading(false);
        }
    };

    const removeChat = async (id) => {
        await deleteChat(id);
        setHistory(prev => prev.filter(c => c._id !== id));
    };

    const getChat = async (id) => {
        const res = await getChatById(id);
        return res.data;
    };

    useEffect(() => {
        loadHistory();
    }, []);

    return {
        history,
        loading,
        removeChat,
        getChat,
        reload: loadHistory,
    };
};

export default useChatHistory;