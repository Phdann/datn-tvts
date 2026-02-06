import api from './api';

export const getAllRoles = async () => {
    const response = await api.get('/admin/roles');
    return response.data;
};

export const getRoleById = async (id) => {
    const response = await api.get(`/admin/roles/${id}`);
    return response.data;
};

export const createRole = async (roleData) => {
    const response = await api.post('/admin/roles', roleData);
    return response.data;
};

export const updateRole = async (id, roleData) => {
    const response = await api.put(`/admin/roles/${id}`, roleData);
    return response.data;
};

export const deleteRole = async (id) => {
    const response = await api.delete(`/admin/roles/${id}`);
    return response.data;
};

export default {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};
