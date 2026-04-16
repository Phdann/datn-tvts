import api from './api';

export const getAllDocuments = async (params = {}) => {
    const response = await api.get('/admin/application-documents', { params });
    return response.data;
};

export const getDocumentById = async (id) => {
    const response = await api.get(`/admin/application-documents/${id}`);
    return response.data;
};

export const getDocumentsByApplication = async (applicationId) => {
    const response = await api.get(`/admin/applications/${applicationId}/documents`);
    return response.data;
};

export const createDocument = async (documentData) => {
    const response = await api.post('/admin/application-documents', documentData);
    return response.data;
};

export const updateDocument = async (id, documentData) => {
    const response = await api.put(`/admin/application-documents/${id}`, documentData);
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await api.delete(`/admin/application-documents/${id}`);
    return response.data;
};

export const downloadDocument = async (id) => {
    const response = await api.get(`/admin/application-documents/${id}/download`, {
        responseType: 'blob'
    });
    return response.data;
};

export const getDocumentStatistics = async () => {
    const response = await api.get('/admin/application-documents/statistics/by-type');
    return response.data;
};

export const bulkCreateDocuments = async (documentsData) => {
    const response = await api.post('/admin/application-documents/bulk-create', documentsData);
    return response.data;
};

export default {
    getAllDocuments,
    getDocumentById,
    getDocumentsByApplication,
    createDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    getDocumentStatistics,
    bulkCreateDocuments
};
