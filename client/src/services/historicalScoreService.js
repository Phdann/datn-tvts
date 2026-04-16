import api from './api';

export const getAllHistoricalScores = async (params = {}) => {
    const response = await api.get('/admin/historical-scores', { params });
    return response.data;
};

export const getHistoricalScoreById = async (id) => {
    const response = await api.get(`/admin/historical-scores/${id}`);
    return response.data;
};

export const createHistoricalScore = async (scoreData) => {
    const response = await api.post('/admin/historical-scores', scoreData);
    return response.data;
};

export const updateHistoricalScore = async (id, scoreData) => {
    const response = await api.put(`/admin/historical-scores/${id}`, scoreData);
    return response.data;
};

export const deleteHistoricalScore = async (id) => {
    const response = await api.delete(`/admin/historical-scores/${id}`);
    return response.data;
};

export const calculateThreshold = async (majorId, params = {}) => {
    const response = await api.get(`/admin/historical-scores/calculate-threshold/${majorId}`, { params });
    return response.data;
};

export const predictAdmission = async (predictionData) => {
    const response = await api.post('/predict-admission', predictionData);
    return response.data;
};

export default {
    getAllHistoricalScores,
    getHistoricalScoreById,
    createHistoricalScore,
    updateHistoricalScore,
    deleteHistoricalScore,
    calculateThreshold,
    predictAdmission
};
