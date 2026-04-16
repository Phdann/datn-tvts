import api from './api';

export const globalSearch = (keyword, page = 1, limit = 20) => {
  if (!keyword || keyword.trim().length === 0) {
    return Promise.reject(new Error('Keyword is required'));
  }

  return api.get('/search', {
    params: {
      q: keyword.trim(),
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.max(10, Math.min(100, parseInt(limit) || 20)),
    },
  });
};

export const searchSuggestions = (keyword, limit = 10) => {
  if (!keyword || keyword.trim().length < 2) {
    return Promise.resolve({ data: { suggestions: [] } });
  }

  return api.get('/search/suggestions', {
    params: {
      q: keyword.trim(),
      limit: Math.max(5, Math.min(20, parseInt(limit) || 10)),
    },
  });
};

export default {
  globalSearch,
  searchSuggestions,
};
