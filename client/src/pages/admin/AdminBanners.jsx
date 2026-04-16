import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, ExternalLink, Save, X, Search, RefreshCw, Loader2, Eye, EyeOff, Upload, Globe } from 'lucide-react';
import { bannerService, facultyService } from '../../services';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_URL}${url}`;
};

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ title: '', link: '', is_active: true, position: 'main_top', faculty_id: '' });
  const [file, setFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [saving, setSaving] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const toast = useToast();

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setSelectedIds([]);
      const res = await bannerService.getAllBanners();
      setBanners(res?.data || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error('Error fetching banners:', err);
      toast.error('Lỗi khi tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await facultyService.getFaculties();
      setFaculties(res?.data || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error('Error fetching faculties:', err);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchFaculties();
  }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('link', form.link);
      formData.append('is_active', form.is_active);
      formData.append('position', form.position);
      if (form.faculty_id) {
        formData.append('faculty_id', form.faculty_id);
      } else {
        formData.append('faculty_id', 'null');
      }
      if (file) {
        formData.append('image', file);
      } else if (imageUrlInput) {
        formData.append('image_url', imageUrlInput);
      }

      if (editData) {
        await bannerService.updateBanner(editData.id, formData);
        toast.success('Cập nhật banner thành công');
      } else {
        if (!file && !imageUrlInput) { toast.error('Vui lòng chọn ảnh banner'); setSaving(false); return; }
        await bannerService.createBanner(formData);
        toast.success('Thêm banner thành công');
      }
      setEditing(false);
      fetchBanners();
    } catch (err) {
      toast.error('Lỗi khi lưu banner');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (b) => {
    setEditData(b);
    setForm({ title: b.title, link: b.link || '', is_active: b.is_active, position: b.position || 'main_top', faculty_id: b.faculty_id || '' });
    setPreview(b.image_url);
    if (b.image_url && (b.image_url.startsWith('http') || b.image_url.startsWith('data:'))) {
      setImageUrlInput(b.image_url);
    } else {
      setImageUrlInput('');
    }
    setFile(null);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await bannerService.deleteBanner(id);
      toast.success('Xoá banner thành công');
      fetchBanners();
    } catch (err) {
      toast.error('Lỗi khi xoá banner');
    }
  };

  const toggleActive = async (banner) => {
    try {
      const newStatus = !banner.is_active;
      await bannerService.updateBanner(banner.id, { is_active: newStatus });
      toast.success(`${newStatus ? 'Đã bật' : 'Đã tắt'} hiển thị banner`);
      fetchBanners();
    } catch (err) {
      toast.error('Lỗi khi thay đổi trạng thái');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(b => b.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${selectedIds.length} banner đã chọn?`)) return;
    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => bannerService.deleteBanner(id)));
      toast.success(`Đã xoá ${selectedIds.length} banner`);
      setSelectedIds([]);
      fetchBanners();
    } catch {
      toast.error('Lỗi khi xoá hàng loạt');
      setLoading(false);
    }
  };

  const filtered = banners.filter(b =>
    (b.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 flex items-center justify-center rounded-2xl shadow-sm">
            <ImageIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Banner Quảng cáo</h1>
          </div>
        </div>
        <button
          onClick={() => { setEditData(null); setForm({ title: '', link: '', is_active: true, position: 'main_top', faculty_id: '' }); setPreview(null); setFile(null); setImageUrlInput(''); setEditing(true); }}
          className="bg-primary text-white text-xs font-black px-6 py-3 flex items-center gap-2 hover:bg-primary/90 rounded-xl transition-all uppercase tracking-widest shadow-sm"
        >
          <Plus className="w-4 h-4" /> Thêm banner mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text" placeholder="Tìm kiếm banner..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl transition-all bg-slate-50 focus:bg-white shadow-inner-sm"
            />
          </div>
          <button
            type="button"
            onClick={fetchBanners}
            className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Đã chọn: <span className="text-primary">{selectedIds.length}</span> banner
            </p>
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xoá mục đã chọn
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 rounded-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-widest">
                {editData ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
              </h2>
              <button onClick={() => setEditing(false)} className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Tiêu đề banner</label>
                    <input 
                      required type="text" value={form.title} 
                      onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Vị trí hiển thị (Position)</label>
                    <select
                      value={form.position}
                      onChange={e => {
                        const val = e.target.value;
                        setForm(prev => ({
                          ...prev,
                          position: val,
                          faculty_id: val === 'main_top' ? '' : prev.faculty_id
                        }));
                      }}
                      className="w-full border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all appearance-none bg-white font-medium shadow-sm hover:border-slate-300"
                    >
                      <option value="main_top">Trang chủ (Hero Slider)</option>
                      <option value="faculty_top">Đầu trang Khoa (Faculty Top)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Chọn Khoa (Trang chủ nểu để trống)</label>
                    <select
                      value={form.faculty_id}
                      onChange={e => setForm({ ...form, faculty_id: e.target.value })}
                      disabled={form.position === 'main_top'}
                      className={`w-full border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all appearance-none bg-white font-medium shadow-sm ${form.position === 'main_top' ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-60' : 'hover:border-slate-300'}`}
                    >
                      <option value="">Tất cả (Site-wide / Trang chủ)</option>
                      {faculties.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox" id="banner-active"
                      checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                      className="w-5 h-5 border-slate-300 rounded text-primary focus:ring-primary cursor-pointer shadow-sm transition-all"
                    />
                    <label htmlFor="banner-active" className="text-sm font-bold text-slate-700 select-none cursor-pointer">Kích hoạt hiển thị công khai</label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Hình ảnh Banner</label>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={() => document.getElementById('banner-file').click()}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-dashed border-slate-100 text-slate-500 hover:border-primary/50 hover:text-primary transition-all rounded-xl group shadow-sm"
                      >
                        <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest leading-none">TỆP TIN</span>
                      </button>

                      {/* URL Input */}
                      <div className="relative group/input">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <input
                          value={imageUrlInput}
                          onChange={e => {
                            setImageUrlInput(e.target.value);
                            if (e.target.value.trim()) {
                              setPreview(e.target.value.trim());
                              setFile(null);
                            }
                          }}
                          placeholder="Dán link ảnh & Enter..."
                          className="w-full bg-slate-50/50 border border-slate-100 pl-11 pr-12 py-3.5 text-xs font-bold focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all shadow-inner-sm"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-md border border-white/20">
                          <Plus className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Preview Area */}
                      <div className="pt-2 flex justify-center">
                        {preview ? (
                          <div className="relative group/preview w-full">
                            <img
                              src={getImageUrl(preview)}
                              alt="Preview"
                              className="w-full aspect-[21/9] object-cover rounded-2xl border border-slate-200 shadow-lg group-hover:scale-[1.01] transition-transform"
                            />
                            <button
                              type="button"
                              onClick={() => { setPreview(null); setFile(null); setImageUrlInput(''); }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:bg-red-600 hover:scale-110 transition-all z-10"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center bg-slate-50/30 text-slate-300 gap-2">
                            <ImageIcon className="w-8 h-8 opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Phần xem trước (Preview)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <input id="banner-file" type="file" hidden accept="image/*" onChange={(e) => {
                      handleFile(e);
                      setImageUrlInput('');
                    }} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-100 bg-slate-50 px-6 py-4 mt-auto">
                <button type="button" onClick={() => setEditing(false)} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white text-[11px] font-black uppercase tracking-widest px-10 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 hover:bg-primary/90 transition-all font-black"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editData ? 'Lưu thay đổi' : 'Tạo banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  <th className="px-6 py-5 border-b border-slate-100 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-5 border-b border-slate-100 w-12 text-center">STT</th>
                  <th className="px-4 py-5 border-b border-slate-100 min-w-[300px]">Hình ảnh & Tiêu đề</th>
                  <th className="px-4 py-5 border-b border-slate-100">Vị trí & Khoa</th>
                  <th className="px-4 py-5 border-b border-slate-100 text-center">Trạng thái</th>
                  <th className="px-4 py-5 border-b border-slate-100 text-right w-28 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b, idx) => (
                  <tr key={b.id} className={`hover:bg-slate-50 transition-all group ${selectedIds.includes(b.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(b.id)}
                        onChange={() => toggleSelectRow(b.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 aspect-[21/9] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 shadow-inner-sm">
                          <img src={getImageUrl(b.image_url)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-700 block truncate group-hover:text-primary transition-colors">{b.title}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Banner ID: #{b.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-700">{b.position === 'main_top' ? 'Trang chủ' : b.position === 'sidebar' ? 'Thanh bên' : 'Đầu trang Khoa'}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Khoa: {faculties.find(f => f.id === b.faculty_id)?.name || 'Tất cả (Site-wide)'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {b.is_active ? (
                        <span className="text-emerald-500 text-[10px] font-black uppercase px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100 tracking-widest shadow-sm">Đang dùng</span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-black uppercase px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100 tracking-widest shadow-sm">Đã tắt</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleActive(b)}
                          className={`p-2 ${b.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'} rounded-xl transition-all`}
                          title={b.is_active ? "Tắt hiển thị" : "Bật hiển thị"}
                        >
                          {b.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => startEdit(b)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Sửa banner">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete({ open: true, id: b.id })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Xoá banner">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-32 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <ImageIcon className="w-16 h-16" />
                        <p className="font-black text-sm uppercase tracking-widest">Chưa có banner nào được tạo</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Xoá banner" message="Bạn có chắc muốn xoá banner này?"
        type="danger"
      />
    </div>
  );
}
