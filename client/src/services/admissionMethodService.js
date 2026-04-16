import api from './api';
export const getAllAdmissionMethods = async (params = {}) => {
    const response = await api.get('/admin/admission-methods', { params });
    return response.data;
};

export const getAdmissionMethodById = async (id) => {
    const response = await api.get(`/admin/admission-methods/${id}`);
    return response.data;
};

export const createAdmissionMethod = async (methodData) => {
    const config = methodData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.post('/admin/admission-methods', methodData, config);
    return response.data;
};

export const updateAdmissionMethod = async (id, methodData) => {
    const config = methodData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.put(`/admin/admission-methods/${id}`, methodData, config);
    return response.data;
};

export const deleteAdmissionMethod = async (id) => {
    const response = await api.delete(`/admin/admission-methods/${id}`);
    return response.data;
};

export default {
    getAllAdmissionMethods,
    getAdmissionMethodById,
    createAdmissionMethod,
    updateAdmissionMethod,
    deleteAdmissionMethod
};
