import api from './api';

export const getAllCandidates = async (params = {}) => {
    const response = await api.get('/admin/candidates', { params });
    return response.data;
};

export const getCandidateById = async (id) => {
    const response = await api.get(`/admin/candidates/${id}`);
    return response.data;
};

export const createCandidate = async (candidateData) => {
    const response = await api.post('/admin/candidates', candidateData);
    return response.data;
};

export const updateCandidate = async (id, candidateData) => {
    const response = await api.put(`/admin/candidates/${id}`, candidateData);
    return response.data;
};

export const deleteCandidate = async (id) => {
    const response = await api.delete(`/admin/candidates/${id}`);
    return response.data;
};

export default {
    getAllCandidates,
    getCandidateById,
    createCandidate,
    updateCandidate,
    deleteCandidate
};
