import api from './api';

export const getAllMappings = async (params = {}) => {
    const response = await api.get('/admin/major-subject-mappings', { params });
    return response.data;
};

export const getMappingById = async (majorId, subjectGroupId) => {
    const response = await api.get(`/admin/major-subject-mappings/${majorId}/${subjectGroupId}`);
    return response.data;
};

export const getSubjectGroupsByMajor = async (majorId) => {
    const response = await api.get(`/admin/majors/${majorId}/subject-groups`);
    return response.data;
};

export const getMajorsBySubjectGroup = async (subjectGroupId) => {
    const response = await api.get(`/admin/subject-groups/${subjectGroupId}/majors`);
    return response.data;
};

export const createMapping = async (mappingData) => {
    const response = await api.post('/admin/major-subject-mappings', mappingData);
    return response.data;
};

export const deleteMapping = async (majorId, subjectGroupId) => {
    const response = await api.delete(`/admin/major-subject-mappings/${majorId}/${subjectGroupId}`);
    return response.data;
};

export const bulkCreateMappings = async (mappingsData) => {
    const response = await api.post('/admin/major-subject-mappings/bulk-create', mappingsData);
    return response.data;
};

export const deleteAllMappingsByMajor = async (majorId) => {
    const response = await api.delete(`/admin/majors/${majorId}/subject-groups`);
    return response.data;
};

export const replaceMajorSubjectGroups = async (majorId, subjectGroupIds) => {
    const response = await api.put(`/admin/majors/${majorId}/subject-groups`, { subject_group_ids: subjectGroupIds });
    return response.data;
};

export const getMappingStatistics = async () => {
    const response = await api.get('/admin/major-subject-mappings/statistics');
    return response.data;
};

export default {
    getAllMappings,
    getMappingById,
    getSubjectGroupsByMajor,
    getMajorsBySubjectGroup,
    createMapping,
    deleteMapping,
    bulkCreateMappings,
    deleteAllMappingsByMajor,
    replaceMajorSubjectGroups,
    getMappingStatistics
};
