import api from './api';

export const getAllUsers = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
};

export const getUserById = async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/admin/users/me');
    return response.data;
};

export const createUser = async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};

export const lockUser = async (id) => {
    const response = await api.patch(`/admin/users/${id}/lock`);
    return response.data;
};

export const unlockUser = async (id) => {
    const response = await api.patch(`/admin/users/${id}/unlock`);
    return response.data;
};

export const changePassword = async (id, passwordData) => {
    const response = await api.patch(`/admin/users/${id}/change-password`, passwordData);
    return response.data;
};

export const assignRole = async (id, roleId) => {
    const response = await api.patch(`/admin/users/${id}/assign-role`, { role_id: roleId });
    return response.data;
};

const userService = {
    getAllUsers,
    getUserById,
    getCurrentUser,
    createUser,
    updateUser,
    deleteUser,
    lockUser,
    unlockUser,
    changePassword,
    assignRole
};

export default userService;
