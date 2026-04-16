import { useState, useEffect } from 'react';
import { Save, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get('/admin/settings').then(r => {
      const s = {};
      (Array.isArray(r.data) ? r.data : r.data?.data || []).forEach(item => { s[item.key] = item.value; });
      setSettings(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const update = (key, val) => setSettings({ ...settings, [key]: val });

  const handleSave = async () => {
    try {
      setSaving(true);
      const promises = Object.entries(settings).map(([key, value]) => api.put(`/admin/settings/${key}`, { value }));
      await Promise.all(promises);
      setMsg({ type: 'success', text: 'Đã lưu cài đặt thành công!' });
    } catch {
      setMsg({ type: 'error', text: 'Lưu thất bại!' });
    } finally { setSaving(false); setTimeout(() => setMsg(null), 3000); }
  };

  if (loading) return <LoadingSpinner />;
  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all bg-white';

  const fields = [
    { key: 'site_name', label: 'Tên website' },
    { key: 'site_description', label: 'Mô tả' },
    { key: 'contact_email', label: 'Email liên hệ' },
    { key: 'contact_phone', label: 'Số điện thoại' },
    { key: 'address', label: 'Địa chỉ' },
    { key: 'facebook_url', label: 'Facebook URL' },
    { key: 'youtube_url', label: 'YouTube URL' },
    { key: 'maintenance_mode', label: 'Chế độ bảo trì', type: 'toggle' },
  ];

  return (
    <div>
      <h1 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Cài đặt hệ thống</h1>

      {msg && (
        <div className={`flex items-center gap-2 px-4 py-3 mb-4 border ${msg.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
          <p className={`text-xs ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 p-6 space-y-4 max-w-2xl rounded-xl shadow-sm">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{f.label}</label>
            {f.type === 'toggle' ? (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings[f.key] === 'true' || settings[f.key] === true} onChange={e => update(f.key, e.target.checked ? 'true' : 'false')} />
                {settings[f.key] === 'true' ? 'Bật' : 'Tắt'}
              </label>
            ) : (
              <input value={settings[f.key] || ''} onChange={e => update(f.key, e.target.value)} className={inputCls} />
            )}
          </div>
        ))}
        <button onClick={handleSave} disabled={saving} className="bg-primary text-white text-sm font-semibold px-6 py-2.5 flex items-center gap-2 hover:bg-primary-light disabled:opacity-50 rounded-xl transition-all shadow-none">
          <Save className="w-4 h-4" />{saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  );
}
