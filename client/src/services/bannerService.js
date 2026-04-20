import api from './api';

export const getBanners = async (params = {}) => {
    const response = await api.get('/banners', { params });
    return response.data;
};

export const getAllBanners = async () => {
    const response = await api.get('/admin/banners');
    return response.data;
};

export const createBanner = async (data) => {
    const response = await api.post('/admin/banners', data);
    return response.data;
};

export const updateBanner = async (id, data) => {
    const response = await api.put(`/admin/banners/${id}`, data);
    return response.data;
};

export const deleteBanner = async (id) => {
    const response = await api.delete(`/admin/banners/${id}`);
    return response.data;
};

export default {
    getBanners,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner
};