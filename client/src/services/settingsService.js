import api from './api';

const settingsService = {
    getAllSettings: async () => {
        const response = await api.get('/admin/settings');
        return response.data;
    },

    getSetting: async (key) => {
        const response = await api.get(`/admin/settings/${key}`);
        return response.data;
    },

    updateSettings: async (settings) => {
        const response = await api.put('/admin/settings', settings);
        return response.data;
    },

    updateSetting: async (key, value) => {
        const response = await api.put(`/admin/settings/${key}`, { value });
        return response.data;
    },

    createSetting: async (setting) => {
        const response = await api.post('/admin/settings', setting);
        return response.data;
    },

    deleteSetting: async (key) => {
        const response = await api.delete(`/admin/settings/${key}`);
        return response.data;
    },

    getPublicConfig: async () => {
        const response = await api.get('/config');
        return response.data;
    }
};

export default settingsService;
