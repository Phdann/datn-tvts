import api from './api';

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
};
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const isAdmin = () => {
    const user = getCurrentUser();
    return user?.Role?.name === 'Admin';
};

export default {
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    isAdmin
};
