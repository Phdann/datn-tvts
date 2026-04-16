import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Building2, Search,
  Info, Save, X, BookOpen, Target, RefreshCw,
  Filter, Globe, Image as ImageIcon, Upload
} from 'lucide-react';
import { facultyService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_URL}${url}`;
};

export default function AdminFaculties() {
  const [facs, setFacs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', slug: '', introduction: '', logo_url: '', banner_image_url: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoSource, setLogoSource] = useState('file'); // 'file' | 'url'
  const [bannerSource, setBannerSource] = useState('file'); // 'file' | 'url'
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      setSelectedIds([]);
      const d = await facultyService.getAllFaculties();
      const data = Array.isArray(d) ? d : d.data || [];
      setFacs(data);
    } catch {
      setFacs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleDelete = async (id) => {
    try {
      await facultyService.deleteFaculty(id);
      fetchFaculties();
      toast.success('Xoá khoa thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xoá Khoa này.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFacs.length) setSelectedIds([]);
    else setSelectedIds(filteredFacs.map(f => f.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${selectedIds.length} khoa đã chọn?`)) return;
    try {
      await Promise.all(selectedIds.map(id => facultyService.deleteFaculty(id)));
      toast.success(`Đã xoá ${selectedIds.length} khoa`);
      setSelectedIds([]);
      fetchFaculties();
    } catch {
      toast.error('Lỗi khi xoá hàng loạt. Có thể một số khoa đang chứa ngành học.');
    }
  };

  const openEdit = (f) => {
    setEditing(f?.id || 'new');
    setLogoFile(null);
    setBannerFile(null);
    setLogoSource(f?.logo_url?.startsWith('http') ? 'url' : 'file');
    setBannerSource(f?.banner_image_url?.startsWith('http') ? 'url' : 'file');
    setForm(f ? {
      name: f.name,
      code: f.code || '',
      slug: f.slug || '',
      introduction: f.introduction || '',
      logo_url: f.logo_url || '',
      banner_image_url: f.banner_image_url || ''
    } : {
      name: '',
      code: '',
      slug: '',
      introduction: '',
      logo_url: '',
      banner_image_url: ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && k !== 'logo_url' && k !== 'banner_image_url') {
          data.append(k, v);
        }
      });
      if (logoFile) data.append('logo_url', logoFile);
      if (bannerFile) data.append('banner_image_url', bannerFile);

      if (editing === 'new') {
        await facultyService.createFaculty(data);
      } else {
        await facultyService.updateFaculty(editing, data);
      }
      setEditing(null);
      fetchFaculties();
      toast.success(editing === 'new' ? 'Tạo khoa mới thành công' : 'Cập nhật khoa thành công');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi lưu dữ liệu khoa');
    } finally {
      setSaving(false);
    }
  };

  const filteredFacs = facs.filter(f =>
    (f.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-blue-950 tracking-tight flex items-center gap-2 uppercase">
            <Building2 className="w-8 h-8 text-primary" /> Quản lý Khoa đào tạo
          </h1>
          <p className="text-xs text-blue-400 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> Quản lý các đơn vị học thuật trực thuộc trường
          </p>
        </div>
        <button
          onClick={() => openEdit(null)}
          className="bg-primary text-white text-xs font-black px-6 py-3 flex items-center gap-2 hover:bg-primary/90 transition-all rounded-xl uppercase tracking-widest shadow-none"
        >
          <Plus className="w-4 h-4" /> Thêm khoa mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo tên khoa hoặc mã khoa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:border-primary transition-all rounded-xl shadow-inner-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <button
            type="button"
            onClick={fetchFaculties}
            className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Đã chọn: <span className="text-primary">{selectedIds.length}</span> khoa
            </p>
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xoá mục đã chọn
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0 text-center">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <th className="px-6 py-5 border-b border-slate-100 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredFacs.length && filteredFacs.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-5 border-b border-slate-100 w-12">STT</th>
                <th className="text-left px-6 py-5 border-b border-slate-100">Logo & Tên Khoa</th>
                <th className="px-6 py-5 border-b border-slate-100">Mã khoa</th>
                <th className="px-6 py-5 border-b border-slate-100">Số ngành</th>
                <th className="px-6 py-5 border-b border-slate-100">Chỉ tiêu</th>
                <th className="text-center px-6 py-5 border-b border-slate-100">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center"><LoadingSpinner /></td>
                </tr>
              ) : filteredFacs.map((f, index) => (
                <tr key={f.id} className={`hover:bg-slate-50/80 transition-all group ${selectedIds.includes(f.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-6 py-5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(f.id)}
                      onChange={() => toggleSelectRow(f.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-5 font-bold text-slate-400 text-[11px]">
                    {index + 1}
                  </td>
                  <td className="px-6 py-5 text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-black text-xs shadow-inner overflow-hidden shrink-0 border border-primary/10">
                        {f.logo_url ? (
                          <img src={getImageUrl(f.logo_url)} alt={f.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          f.code || f.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 text-sm leading-tight group-hover:text-primary transition-colors truncate max-w-xs">{f.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate max-w-xs">{f.introduction || 'Chưa có giới thiệu...'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-black text-slate-600 uppercase bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                      {f.code || '---'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-1.5 font-black text-xs text-indigo-600">
                      <BookOpen className="w-3.5 h-3.5" /> {f.Majors?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-1.5 font-black text-xs text-emerald-600">
                      <Target className="w-3.5 h-3.5" /> {f.Majors?.reduce((acc, m) => acc + (m.quota || 0), 0) || 0}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(f)}
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ open: true, id: f.id })}
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredFacs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Building2 className="w-16 h-16" />
                      <p className="font-black text-sm uppercase tracking-widest">Không tìm thấy khoa nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-slate-900 bg-slate-50/50 shrink-0">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                {editing === 'new' ? 'Thêm khoa mới' : 'Chỉnh sửa khoa'}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Mã khoa</label>
                      <input
                        value={form.code}
                        onChange={e => setForm({ ...form, code: e.target.value })}
                        placeholder="VD: CNTT"
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all rounded-xl shadow-inner-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tên khoa *</label>
                      <input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Nhập tên khoa đào tạo..."
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all rounded-xl shadow-inner-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Đường dẫn thân thiện (Slug)</label>
                    <input
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      placeholder="khoa-cong-nghe-thong-tin"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all rounded-xl shadow-inner-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Lời giới thiệu</label>
                    <textarea
                      rows={6}
                      value={form.introduction}
                      onChange={e => setForm({ ...form, introduction: e.target.value })}
                      placeholder="Mô tả ngắn gọn về khoa..."
                      className="w-full bg-slate-50 border border-slate-200 p-4 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all rounded-xl shadow-inner-sm resize-none"
                    />
                  </div>
                </div>

                {/* Right Column: Media */}
                <div className="space-y-6">
                  {/* Logo Picker */}
                  <div className="space-y-3 p-0 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="flex bg-slate-50 border-b border-slate-100 p-1">
                      <button 
                        type="button"
                        onClick={() => setLogoSource('file')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${logoSource === 'file' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Upload className="w-3 h-3" /> Tệp tin
                      </button>
                      <button 
                        type="button"
                        onClick={() => setLogoSource('url')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${logoSource === 'url' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Globe className="w-3 h-3" /> Đường dẫn
                      </button>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-2 relative group overflow-hidden shadow-inner-sm shrink-0">
                          {logoFile || form.logo_url ? (
                            <img 
                              src={logoFile ? URL.createObjectURL(logoFile) : getImageUrl(form.logo_url)} 
                              alt="logo" 
                              className="w-full h-full object-contain animate-in zoom-in-50 duration-300" 
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-slate-200" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          {logoSource === 'file' ? (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => {
                                const f = e.target.files[0];
                                setLogoFile(f);
                              }}
                              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                            />
                          ) : (
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                              <input 
                                value={form.logo_url?.startsWith('http') ? form.logo_url : ''}
                                onChange={e => {
                                  setLogoFile(null);
                                  setForm({...form, logo_url: e.target.value});
                                }}
                                placeholder="Dán link ảnh tại đây..."
                                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-primary rounded-xl transition-all shadow-inner-sm"
                              />
                            </div>
                          )}
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Logo khoa (Đề xuất: 1:1)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Banner Picker */}
                  <div className="space-y-3 p-0 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="flex bg-slate-50 border-b border-slate-100 p-1">
                      <button 
                        type="button"
                        onClick={() => setBannerSource('file')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${bannerSource === 'file' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Upload className="w-3 h-3" /> Tệp tin
                      </button>
                      <button 
                        type="button"
                        onClick={() => setBannerSource('url')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${bannerSource === 'url' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Globe className="w-3 h-3" /> Đường dẫn
                      </button>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="w-full h-28 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center relative group overflow-hidden shadow-inner-sm">
                        {bannerFile || form.banner_image_url ? (
                          <img 
                            src={bannerFile ? URL.createObjectURL(bannerFile) : getImageUrl(form.banner_image_url)} 
                            alt="banner" 
                            className="w-full h-full object-cover animate-in zoom-in-50 duration-300" 
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-200">
                             <ImageIcon className="w-8 h-8" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Xem trước Banner</span>
                          </div>
                        )}
                      </div>

                      {bannerSource === 'file' ? (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const f = e.target.files[0];
                            setBannerFile(f);
                          }}
                          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                        />
                      ) : (
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input 
                            value={form.banner_image_url?.startsWith('http') ? form.banner_image_url : ''}
                            onChange={e => {
                              setBannerFile(null);
                              setForm({...form, banner_image_url: e.target.value});
                            }}
                            placeholder="Dán link ảnh tại đây..."
                            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-primary rounded-xl transition-all shadow-inner-sm"
                          />
                        </div>
                      )}
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Ảnh bìa trang khoa (Đề xuất: 3:1)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-slate-900 text-white px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editing === 'new' ? 'Tạo khoa' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Xoá khoa đào tạo"
        message="Bạn có chắc chắn muốn xoá Khoa này? Thao tác này không thể hoàn tác nếu Khoa không có ngành học."
        type="danger"
      />
    </div>
  );
}
