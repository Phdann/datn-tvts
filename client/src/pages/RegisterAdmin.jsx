import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Key, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const RegisterAdmin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/register-admin', {
                email: formData.email,
                password: formData.password,
                secretKey: formData.secretKey
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
            <div className="bg-white p-12 border-4 border-[#007d75] w-full max-w-md space-y-8 shadow-none">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-[#007d75] text-white border-4 border-[#007d75] flex items-center justify-center mx-auto">
                        <UserPlus className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-950 uppercase tracking-tighter">Tạo Tài Khoản Admin</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 border-t-2 border-gray-100 pt-2 inline-block">
                            Hệ thống quản trị UniAdvice
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-600 text-white p-4 border-b-4 border-red-800 text-sm font-bold flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-green-600 text-white p-4 border-b-4 border-green-800 text-sm font-bold flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="email" 
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:border-[#007d75] focus:outline-none text-lg font-bold transition-colors"
                                placeholder="admin@uni.edu.vn"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Mật Khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="password" 
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:border-[#007d75] focus:outline-none text-lg font-bold transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Xác Nhận Mật Khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="password" 
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:border-[#007d75] focus:outline-none text-lg font-bold transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Secret Key</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="password" 
                                name="secretKey"
                                required
                                value={formData.secretKey}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:border-[#007d75] focus:outline-none text-lg font-bold transition-colors"
                                placeholder="CREATE_ADMIN_2026"
                            />
                        </div>
                        <p className="text-xs text-gray-500 italic">Liên hệ quản trị viên hệ thống để lấy secret key</p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || success}
                        className="w-full bg-[#007d75] text-white py-5 border-4 border-[#007d75] hover:bg-[#006a64] transition-colors font-black text-xl uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
                    </button>
                </form>

                <div className="text-center pt-4 border-t-2 border-gray-100">
                    <Link to="/admin/login" className="text-[#007d75] hover:text-[#006a64] font-bold uppercase tracking-tighter text-sm">
                        ← Quay lại đăng nhập
                    </Link>
                </div>

                <div className="text-center bg-amber-50 p-4 border-2 border-amber-200">
                    <p className="text-xs text-amber-800 font-bold uppercase tracking-tighter">
                        ⚠️ Secret Key mặc định: CREATE_ADMIN_2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterAdmin;
