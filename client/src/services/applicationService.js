import api from './api';

export const submitApplication = async (formData) => {
    const response = await api.post('/applications', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const uploadDocument = async (id, formData) => {
    const response = await api.post(`/applications/${id}/upload-document`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
export const getAllApplications = async (params = {}) => {
    const response = await api.get('/admin/applications', { params });
    return response.data;
};

export const getApplicationById = async (id) => {
    const response = await api.get(`/admin/applications/${id}`);
    return response.data;
};

export const updateApplicationStatus = async (id, statusData) => {
    const response = await api.patch(`/admin/applications/${id}/status`, statusData);
    return response.data;
};

export const approveApplication = async (id, notes = {}) => {
    const response = await api.post(`/admin/applications/${id}/approve`, notes);
    return response.data;
};

export const rejectApplication = async (id, reason) => {
    const response = await api.post(`/admin/applications/${id}/reject`, { reason });
    return response.data;
};

export const requestSupplement = async (id, message) => {
    const response = await api.post(`/admin/applications/${id}/request-supplement`, { message });
    return response.data;
};

export const exportApplications = async (params = {}) => {
    const response = await api.get('/admin/applications/export/excel', {
        params,
        responseType: 'blob'
    });
    return response.data;
};

export const deleteApplication = async (id) => {
    const response = await api.delete(`/admin/applications/${id}`);
    return response.data;
};

export default {
    submitApplication,
    uploadDocument,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    approveApplication,
    rejectApplication,
    requestSupplement,
    exportApplications,
    deleteApplication
};
