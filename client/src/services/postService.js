import api from './api';


export const getPosts = async (params = {}) => {
  const response = await api.get('/posts', { params });
  return response.data;
};

export const getPublishedPosts = async (params = {}) => {
  const response = await api.get('/posts', { params });
  return response.data;
};

export const getPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const getPostBySlug = async (slug) => {
  const response = await api.get(`/posts/slug/${slug}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};


export const adminGetAllPosts = async (params = {}) => {
  const response = await api.get('/admin/posts', { params });
  return response.data;
};

export default {
  getPosts,
  getPublishedPosts,
  getPostById,
  getPostBySlug,
  getCategories,
  adminGetAllPosts
};
