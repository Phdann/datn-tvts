import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LogoDUE from '../../assets/Logo_DUE.jpg';

export default function RegisterAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Mật khẩu xác nhận không khớp');
    try {
      setLoading(true); setError('');
      await api.post('/auth/register', { email: form.email, password: form.password });
      navigate('/admin/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full pl-10 pr-4 py-2.5 border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-primary';

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8">
          <div className="w-16 h-16 bg-white mx-auto flex items-center justify-center mb-4 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <img src={LogoDUE} alt="DUE Logo" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Đăng ký tài khoản</h1>
        {error && <div className="bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2 mb-6"><AlertCircle className="w-4 h-4 text-red-500" /><p className="text-xs text-red-600">{error}</p></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="email" required placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputCls} /></div>
          <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="password" required placeholder="Mật khẩu" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={inputCls} /></div>
          <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="password" required placeholder="Xác nhận mật khẩu" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} className={inputCls} /></div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white text-sm font-bold py-3 hover:bg-primary-light disabled:opacity-50">{loading ? 'Đang xử lý...' : 'Đăng ký'}</button>
        </form>
      </div>
    </div>
  );
}
