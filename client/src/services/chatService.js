import api from './api';

export const sendMessage = async (messageData) => {
    const response = await api.post('/chat', messageData);
    return response.data;
};
export const getChatHistory = async (sessionId) => {
    const response = await api.get(`/chat/history/${sessionId}`);
    return response.data;
};

export const getAllChatSessions = async (params = {}) => {
    const response = await api.get('/admin/chat-sessions', { params });
    return response.data;
};

export const getChatSessionById = async (id) => {
    const response = await api.get(`/admin/chat-sessions/${id}`);
    return response.data;
};

export const deleteChatSession = async (id) => {
    const response = await api.delete(`/admin/chat-sessions/${id}`);
    return response.data;
};

export const cleanupOldSessions = async (days = 30) => {
    const response = await api.delete('/admin/chat-sessions/cleanup/old', {
        params: { days }
    });
    return response.data;
};

export const getChatStatistics = async () => {
    const response = await api.get('/admin/chat/statistics');
    return response.data;
};

export default {
    sendMessage,
    getChatHistory,
    getAllChatSessions,
    getChatSessionById,
    deleteChatSession,
    cleanupOldSessions,
    getChatStatistics
};
