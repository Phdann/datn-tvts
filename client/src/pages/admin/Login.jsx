import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services';
import Logo_DUE from '../../assets/Logo_DUE.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authService.login(form);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white mx-auto flex items-center justify-center mb-4 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <img src={Logo_DUE} alt="DUE Logo" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Đăng nhập quản trị</h1>
          <p className="text-xs text-slate-400 mt-1">Cổng quản trị DUE</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-primary"
                placeholder="Nhập email..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type={showPw ? 'text' : 'password'} required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-primary"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white text-sm font-bold py-3 hover:bg-primary-light transition-colors disabled:opacity-50 rounded-xl">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
