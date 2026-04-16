import api from './api';

export const getAllTrainingTypes = async (params) => {
  const response = await api.get('/training-types', { params });
  return response.data;
};

export const getAdminTrainingTypes = async (params = {}) => {
  const response = await api.get('/admin/training-types', { params });
  return response.data;
};

export const getTrainingTypeById = async (id) => {
  const response = await api.get(`/training-types/${id}`);
  return response.data;
};

export const getAdminTrainingTypeById = async (id) => {
    const response = await api.get(`/admin/training-types/${id}`);
    return response.data;
};

export const createTrainingType = async (formData) => {
  const response = await api.post('/admin/training-types', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateTrainingType = async (id, formData) => {
  const response = await api.put(`/admin/training-types/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteTrainingType = async (id) => {
  const response = await api.delete(`/admin/training-types/${id}`);
  return response.data;
};

export default {
  getAllTrainingTypes,
  getAdminTrainingTypes,
  getTrainingTypeById,
  getAdminTrainingTypeById,
  createTrainingType,
  updateTrainingType,
  deleteTrainingType,
};
