import api from './api';

export const getAllMajors = async (params = {}) => {
    const response = await api.get('/majors', { params });
    return response.data;
};

export const getMajorById = async (id) => {
    const response = await api.get(`/majors/${id}`);
    return response.data;
};

export const getMajorImages = async (id) => {
    const response = await api.get(`/majors/${id}/images`);
    return response.data;
};

export const getAdminMajors = async (params = {}) => {
    const response = await api.get('/admin/majors', { params });
    return response.data;
};

export const getAdminMajorById = async (id) => {
    const response = await api.get(`/admin/majors/${id}`);
    return response.data;
};

export const createMajor = async (majorData) => {
    const response = await api.post('/admin/majors', majorData);
    return response.data;
};

export const updateMajor = async (id, majorData) => {
    const response = await api.put(`/admin/majors/${id}`, majorData);
    return response.data;
};

export const deleteMajor = async (id) => {
    const response = await api.delete(`/admin/majors/${id}`);
    return response.data;
};

export const deleteAdminMajor = deleteMajor;

export const getMajorStatistics = async (id) => {
    const response = await api.get(`/admin/majors/${id}/statistics`);
    return response.data;
};

export const getMajorSummaryStats = async () => {
    const response = await api.get('/admin/majors/summary-stats');
    return response.data;
};

export const uploadMajorImages = async (id, formData) => {
    const response = await api.post(`/admin/majors/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteMajorImage = async (imageId) => {
    const response = await api.delete(`/admin/images/${imageId}`);
    return response.data;
};

export const updateImageOrder = async (imageId, displayOrder) => {
    const response = await api.patch(`/admin/images/${imageId}/order`, { display_order: displayOrder });
    return response.data;
};

export default {
    getAllMajors,
    getMajorById,
    getMajorImages,
    getAdminMajors,
    getAdminMajorById,
    createMajor,
    updateMajor,
    getMajorStatistics,
    getMajorSummaryStats,
    uploadMajorImages,
    deleteMajorImage,
    updateImageOrder,
    deleteAdminMajor
};
