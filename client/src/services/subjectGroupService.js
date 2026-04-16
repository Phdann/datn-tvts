import api from './api';

export const getAllSubjectGroups = async (params = {}) => {
    const response = await api.get('/admin/subject-groups', { params });
    return response.data;
};

export const getSubjectGroupById = async (id) => {
    const response = await api.get(`/admin/subject-groups/${id}`);
    return response.data;
};

export const createSubjectGroup = async (subjectGroupData) => {
    const response = await api.post('/admin/subject-groups', subjectGroupData);
    return response.data;
};

export const updateSubjectGroup = async (id, subjectGroupData) => {
    const response = await api.put(`/admin/subject-groups/${id}`, subjectGroupData);
    return response.data;
};

export const deleteSubjectGroup = async (id) => {
    const response = await api.delete(`/admin/subject-groups/${id}`);
    return response.data;
};

export default {
    getAllSubjectGroups,
    getSubjectGroupById,
    createSubjectGroup,
    updateSubjectGroup,
    deleteSubjectGroup
};
