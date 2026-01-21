import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { notify } from '../../../app/shared_components/utils/notify';
import API from '../../../app/api/api_endpoints';

const socket = io(process.env.REACT_APP_SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true,
});

export const useChat = (bookingId, senderId, isChatVisible = false) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('lawyerup_user'));

    useEffect(() => {
        if (!bookingId) return;

        socket.emit('joinRoom', bookingId);

        socket.on('receiveMessage', (msg) => {
            setMessages(prev => [...prev, msg]);
            if (msg.sender?._id !== user._id && !isChatVisible) {
                notify('success', `New message from ${msg.sender?.fullName || 'the other user'}`);
            }
        });

        socket.on('userTyping', () => {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 1500);
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('userTyping');
        };
    }, [bookingId, isChatVisible, user._id]);

    useEffect(() => {
        if (!bookingId) return;

        fetch(`${API.BOOKINGS}/${bookingId}/chat`)
            .then(res => res.json())
            .then(data => setMessages(data || []))
            .catch(console.error);
    }, [bookingId]);

    const sendMessage = () => {
        if (!text.trim()) return;

        const messagePayload = {
            bookingId,
            senderId: user._id,
            text,
            senderName: user.fullName,
        };

        socket.emit('sendMessage', messagePayload);
        setText('');
    };

    return { messages, text, setText, sendMessage, messagesEndRef, isTyping };
};
