import api from './api';

export const getAllCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

export const getAdminCategories = async (params = {}) => {
    const response = await api.get('/admin/categories', { params });
    return response.data;
};

export const getCategoryById = async (id) => {
    const response = await api.get(`/admin/categories/${id}`);
    return response.data;
};

export const createCategory = async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
};

export const updateCategory = async (id, categoryData) => {
    const response = await api.put(`/admin/categories/${id}`, categoryData);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
};

export default {
    getAllCategories,
    getAdminCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
