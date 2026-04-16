import api from './api';

export const getAll = async (params = {}) => {
  const response = await api.get('/scholarships', { params });
  return response.data;
};

export const getById = async (id) => {
  const response = await api.get(`/scholarships/${id}`);
  return response.data;
};

export const getAdminScholarships = async (params = {}) => {
  const response = await api.get('/admin/scholarships', { params });
  return response.data;
};

export const getAdminScholarshipById = async (id) => {
  const response = await api.get(`/admin/scholarships/${id}`);
  return response.data;
};

export const createAdminScholarship = async (formData) => {
  const response = await api.post('/admin/scholarships', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateAdminScholarship = async (id, formData) => {
  const response = await api.put(`/admin/scholarships/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteAdminScholarship = async (id) => {
  const response = await api.delete(`/admin/scholarships/${id}`);
  return response.data;
};

export default {
  getAll,
  getById,
  create: createAdminScholarship,
  update: updateAdminScholarship,
  delete: deleteAdminScholarship,
  getAdminScholarships,
  getAdminScholarshipById,
  createAdminScholarship,
  updateAdminScholarship,
  deleteAdminScholarship
};
