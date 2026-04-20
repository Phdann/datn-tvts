import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000 
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Nếu là FormData, hãy để trình duyệt tự thiết lập Content-Type (bao gồm cả boundary)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const translateError = (error) => {
    if (!error.response) {
        if (error.code === 'ECONNABORTED') return 'Yêu cầu quá hạn. Vui lòng thử lại.';
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.';
    }

    const { status, data } = error.response;
    if (data?.message) return data.message; // Use backend message if available

    switch (status) {
        case 400: return 'Yêu cầu không hợp lệ (400).';
        case 401: return 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.';
        case 403: return 'Bạn không có quyền thực hiện hành động này.';
        case 404: return 'Không tìm thấy dữ liệu (404).';
        case 500: return 'Máy chủ gặp lỗi (500). Vui lòng thử lại sau.';
        default: return `Lỗi hệ thống (${status}).`;
    }
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            const requestUrl = error.config?.url || '';
            if (requestUrl.includes('/admin/')) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = '/admin/login';
            }
        }
        
        // Translate technical message to Vietnamese
        error.message = translateError(error);
        
        return Promise.reject(error);
    }
);

export default api;
