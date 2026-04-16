import api from './api';

export const getDashboardStats = async () => {
    const response = await api.get('/admin/stats/dashboard');
    return response.data;
};

export const getApplicationStats = async () => {
    const response = await api.get('/admin/stats/applications');
    return response.data;
};

export const getMajorStats = async () => {
    const response = await api.get('/admin/stats/majors');
    return response.data;
};

export const getChatbotStats = async () => {
    const response = await api.get('/admin/stats/chatbot');
    return response.data;
};

export const exportDashboardPDF = async () => {
    const response = await api.get('/admin/stats/export-pdf', {
        responseType: 'blob'
    });
    return response.data;
};

export default {
    getDashboardStats,
    getApplicationStats,
    getMajorStats,
    getChatbotStats,
    exportDashboardPDF
};
