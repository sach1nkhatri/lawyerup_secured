import axiosInstance from './axiosConfig';
import API from './api_endpoints';

const BASE_URL = API.AI;

// All requests now use httpOnly cookies via axiosInstance (withCredentials: true)
export const fetchChats = () => axiosInstance.get(`${BASE_URL}/chats`);
export const getChatById = (id) => axiosInstance.get(`${BASE_URL}/chats/${id}`);
export const createNewChat = () => axiosInstance.post(`${BASE_URL}/chats`, {});
export const deleteChat = (id) => axiosInstance.delete(`${BASE_URL}/chats/${id}`);
export const sendMessageToAI = (payload) => axiosInstance.post(`${BASE_URL}/send`, payload);
