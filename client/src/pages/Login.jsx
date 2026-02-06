import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;
            
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
            <div className="bg-white p-12 border-4 border-primary w-full max-w-md space-y-8 shadow-none">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary text-white border-4 border-primary flex items-center justify-center mx-auto">
                        <Lock className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-950 uppercase tracking-tighter">Admin Login</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 border-t-2 border-gray-100 pt-2 inline-block">Hệ thống quản trị UniAdvice</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-600 text-white p-4 border-b-4 border-red-800 text-sm font-bold flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Tài khoản Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:border-primary focus:outline-none text-lg font-bold transition-colors"
                                placeholder="admin@uni.edu.vn"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Mật mã truy cập</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:border-primary focus:outline-none text-lg font-bold transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary text-white py-5 border-4 border-primary hover:bg-primary-dark transition-colors font-black text-xl uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : <span>Vào hệ thống</span>}
                    </button>
                </form>

                <div className="text-center bg-gray-50 p-4 border-2 border-gray-100 italic">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Thông tin demo: admin@test.com / password123</p>
                </div>

                <div className="text-center pt-4 border-t-2 border-gray-100">
                    <Link to="/admin/register" className="text-[#007d75] hover:text-[#006a64] font-bold uppercase tracking-tighter text-sm">
                        Tạo tài khoản admin mới →
                    </Link>
                </div>
            </div>
        </div>
    );
};

function AlertCircle({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}

export default Login;
