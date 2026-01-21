import axios from 'axios';
import API from './api_endpoints';

const BASE_URL = API.AI;

const authHeaders = () => {
    const token = localStorage.getItem('lawyerup_token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const fetchChats = () => axios.get(`${BASE_URL}/chats`, authHeaders());
export const getChatById = (id) => axios.get(`${BASE_URL}/chats/${id}`, authHeaders());
export const createNewChat = () => axios.post(`${BASE_URL}/chats`, {}, authHeaders());
export const deleteChat = (id) => axios.delete(`${BASE_URL}/chats/${id}`, authHeaders());
export const sendMessageToAI = (payload) => axios.post(`${BASE_URL}/send`, payload, authHeaders());
