import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Save, Award, Image as ImageIcon, Loader2, Search, Filter, X, Calendar, RefreshCw, Globe, Upload, Plus as PlusIcon } from 'lucide-react';
import { scholarshipService } from '../../services';
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

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null, 'new', or id
  const [form, setForm] = useState({ name: '', type: '', time: '', is_active: true, image_urls: [] });
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    is_active: '',
    startDate: '',
    endDate: ''
  });

  const fetchScholarships = useCallback(async () => {
    try {
      setLoading(true);
      setSelectedIds([]);
      const params = {
        ...filters,
        category: 'scholarship'
      };
      // Clean up empty params
      Object.keys(params).forEach(key => !params[key] && delete params[key]);

      const data = await scholarshipService.getAdminScholarships(params);
      setScholarships(data?.data || (Array.isArray(data) ? data : []));
    } catch (error) {
      toast.error('Lỗi khi tải danh sách học bổng');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchScholarships();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchScholarships]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = [...imageFiles, ...files];
      setImageFiles(newFiles);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (id) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
    setDeletedImageIds(prev => [...prev, id]);
  };

  const openEdit = (s = null) => {
    if (s) {
      setEditing(s.id);
      const dateStr = s.time ? new Date(s.time).toISOString().split('T')[0] : '';
      setForm({ name: s.name, type: s.type, time: dateStr, is_active: s.is_active });
      setExistingImages(s.images || []);
    } else {
      setEditing('new');
      setForm({ name: '', type: '', time: '', is_active: true });
      setExistingImages([]);
    }
    setImageFiles([]);
    setPreviews([]);
    setImageUrlInput('');
    setDeletedImageIds([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('type', form.type);
      formData.append('time', form.time);
      formData.append('is_active', form.is_active);
      formData.append('category', 'scholarship');

      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      if (form.image_urls && form.image_urls.length > 0) {
        form.image_urls.forEach(url => {
          formData.append('image_urls', url);
        });
      }

      if (deletedImageIds.length > 0) {
        formData.append('deletedImageIds', JSON.stringify(deletedImageIds));
      }

      if (editing === 'new') {
        if (imageFiles.length === 0 && (!form.image_urls || form.image_urls.length === 0)) {
          toast.error('Vui lòng chọn ít nhất một ảnh');
          setSaving(false);
          return;
        }
        await scholarshipService.createAdminScholarship(formData);
      } else {
        await scholarshipService.updateAdminScholarship(editing, formData);
      }
      setEditing(null);
      fetchScholarships();
      toast.success(editing === 'new' ? 'Thêm học bổng thành công' : 'Cập nhật học bổng thành công');
    } catch (error) {
      toast.error('Lỗi khi lưu học bổng: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await scholarshipService.deleteAdminScholarship(id);
      fetchScholarships();
      toast.success('Xóa học bổng thành công');
    } catch (error) {
      toast.error('Lỗi khi xóa học bổng');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === scholarships.length) setSelectedIds([]);
    else setSelectedIds(scholarships.map(s => s.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${selectedIds.length} mục đã chọn?`)) return;
    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => scholarshipService.deleteAdminScholarship(id)));
      toast.success(`Đã xoá ${selectedIds.length} mục`);
      setSelectedIds([]);
      fetchScholarships();
    } catch {
      toast.error('Lỗi khi xoá hàng loạt');
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-slate-50 focus:bg-white";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 flex items-center justify-center rounded-2xl shadow-sm">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-blue-950 tracking-tight uppercase">Quản lý Học bổng</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Danh sách học bổng & hỗ trợ</p>
          </div>
        </div>
        <button
          onClick={() => openEdit()}
          className="bg-primary text-white text-xs font-black px-6 py-3 flex items-center gap-2 hover:bg-primary/90 rounded-xl transition-all uppercase tracking-widest shadow-sm"
        >
          <Plus className="w-4 h-4" /> Thêm học bổng mới
        </button>
      </div>

      {!editing && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="text"
                placeholder="Tìm kiếm học bổng..."
                className="w-full pl-12 pr-4 py-3.5 border border-blue-100 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl transition-all bg-blue-50/50 focus:bg-white shadow-inner-sm"
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                className="border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest outline-none focus:border-primary bg-slate-50 focus:bg-white"
                value={filters.is_active}
                onChange={e => setFilters({ ...filters, is_active: e.target.value })}
              >
                <option value="">Trạng thái</option>
                <option value="true">Công khai</option>
                <option value="false">Ẩn</option>
              </select>

              <select
                className="border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest outline-none focus:border-primary bg-slate-50 focus:bg-white"
                value={filters.type}
                onChange={e => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">Loại học bổng</option>
                <option value="Khuyến khích">Khuyến khích</option>
                <option value="Doanh nghiệp">Doanh nghiệp</option>
                <option value="Chính sách">Chính sách</option>
                <option value="Khác">Khác</option>
              </select>

              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 bg-slate-50">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  className="bg-transparent text-[11px] font-black uppercase tracking-tighter outline-none text-slate-600"
                  value={filters.startDate}
                  onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                  title="Từ ngày"
                />
                <span className="text-slate-300">-</span>
                <input
                  type="date"
                  className="bg-transparent text-[11px] font-black uppercase tracking-tighter outline-none text-slate-600"
                  value={filters.endDate}
                  onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                  title="Đến ngày"
                />
              </div>

              <button
                type="button"
                onClick={fetchScholarships}
                className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {(filters.search || filters.type || filters.is_active || filters.startDate || filters.endDate || selectedIds.length > 0) && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                {selectedIds.length > 0 && (
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Đã chọn: <span className="text-primary">{selectedIds.length}</span> mục
                  </p>
                )}
                {(filters.search || filters.type || filters.is_active || filters.startDate || filters.endDate) && (
                  <button
                    onClick={() => setFilters({ search: '', type: '', is_active: '', startDate: '', endDate: '' })}
                    className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-widest"
                  >
                    <X className="w-3 h-3" /> Xoá bộ lọc
                  </button>
                )}
              </div>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xoá các mục đã chọn
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {editing ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              {editing === 'new' ? 'Thêm học bổng mới' : 'Chỉnh sửa học bổng'}
            </h3>
            <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSave} className="p-8 space-y-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Tên học bổng *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Học bổng khuyến khích học tập"
                    className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Loại học bổng *</label>
                    <select
                      required
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className={`${inputCls} font-bold`}
                    >
                      <option value="">Chọn loại</option>
                      <option value="Khuyến khích">Khuyến khích</option>
                      <option value="Doanh nghiệp">Doanh nghiệp</option>
                      <option value="Chính sách">Chính sách</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Thời gian bài viết *</label>
                    <input
                      required
                      type="date"
                      value={form.time}
                      onChange={e => setForm({ ...form, time: e.target.value })}
                      className={`${inputCls} font-bold`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    className="w-5 h-5 text-primary border-slate-300 rounded-lg focus:ring-primary shadow-sm"
                  />
                  <label htmlFor="is_active" className="text-sm font-bold text-slate-700 select-none cursor-pointer">Hiển thị công khai</label>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() => document.getElementById('image-upload').click()}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-dashed border-slate-100 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all rounded-xl group shadow-sm"
                  >
                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">TỆP TIN</span>
                  </button>

                  {/* URL Input */}
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      value={imageUrlInput}
                      onChange={e => setImageUrlInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (imageUrlInput.trim()) {
                            setForm(f => ({ ...f, image_urls: [...(f.image_urls || []), imageUrlInput.trim()] }));
                            setImageUrlInput('');
                          }
                        }
                      }}
                      placeholder="Dán link ảnh & Enter..."
                      className="w-full bg-slate-50/50 border border-slate-100 pl-11 pr-12 py-3.5 text-xs font-bold focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl transition-all shadow-inner-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          setForm(f => ({ ...f, image_urls: [...(f.image_urls || []), imageUrlInput.trim()] }));
                          setImageUrlInput('');
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 hover:scale-110 transition-all shadow-indigo-100"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Preview Area */}
                  <div className="pt-2">
                    <div className="flex flex-wrap gap-4 justify-center min-h-[100px] items-center">
                      {/* Existing Images */}
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative group/img animate-in zoom-in-50">
                          <img src={getImageUrl(img.url)} alt="Preview" className="h-20 w-20 object-cover rounded-2xl shadow-md border border-slate-200 bg-white" />
                          <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 shadow-xl transition-all scale-75 hover:scale-100 z-10"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}

                      {/* URL Images */}
                      {form.image_urls?.map((url, i) => (
                        <div key={`url-${i}`} className="relative group/img animate-in zoom-in-50">
                          <img src={getImageUrl(url)} alt="Preview" className="h-20 w-20 object-cover rounded-2xl shadow-md border border-indigo-200 bg-white" />
                          <button type="button" onClick={() => setForm(f => ({ ...f, image_urls: f.image_urls.filter((_, idx) => idx !== i) }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 shadow-xl transition-all scale-75 hover:scale-100 z-10"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}

                      {/* New File Previews */}
                      {previews.map((preview, idx) => (
                        <div key={`file-${idx}`} className="relative group/img animate-in zoom-in-50">
                          <img src={getImageUrl(preview)} alt="Preview" className="h-20 w-20 object-cover rounded-2xl shadow-md border border-emerald-200 bg-white" />
                          <button type="button" onClick={() => removeNewImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 shadow-xl transition-all scale-75 hover:scale-100 z-10"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}

                      {(!existingImages.length && !previews.length && !form.image_urls?.length) && (
                        <div className="flex flex-col items-center gap-3 opacity-10 py-4 w-full">
                          <ImageIcon className="w-12 h-12" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-center">Phần xem trước (Preview)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 bg-slate-50 px-8 py-5 -mx-8 -mb-8">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white text-[11px] font-black uppercase tracking-widest px-10 py-3.5 rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editing === 'new' ? 'Tạo học bổng' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      ) : loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  <th className="px-6 py-5 border-b border-slate-100 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === scholarships.length && scholarships.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-5 border-b border-slate-100 w-12 text-center">STT</th>
                  <th className="px-6 py-5 border-b border-slate-100 min-w-[350px]">Chương trình Học bổng</th>
                  <th className="px-6 py-5 border-b border-slate-100">Phân loại</th>
                  <th className="px-6 py-5 border-b border-slate-100">Thời gian biểu</th>
                  <th className="px-6 py-5 border-b border-slate-100 text-center">Trạng thái</th>
                  <th className="px-6 py-5 border-b border-slate-100 text-right w-28 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scholarships.map((s, idx) => (
                  <tr key={s.id} className={`hover:bg-slate-50 transition-all group ${selectedIds.includes(s.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => toggleSelectRow(s.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 relative shadow-inner-sm">
                          {s.image_url ? (
                            <img src={getImageUrl(s.image_url)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          {s.images?.length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-white px-1.5 py-0.5 rounded font-black tracking-widest backdrop-blur-sm">
                              +{s.images.length - 1}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-700 block truncate group-hover:text-primary transition-colors">{s.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5 italic">ID: #{s.id.toString().slice(-4)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                        {s.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold text-[11px] uppercase tracking-tighter">
                      {new Date(s.time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.is_active ? (
                        <span className="text-emerald-500 text-[10px] font-black uppercase px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 tracking-widest shadow-sm">Công khai</span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-black uppercase px-3 py-1 bg-slate-50 rounded-full border border-slate-100 tracking-widest shadow-sm">Đã ẩn</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          title="Chỉnh sửa nội dung"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ open: true, id: s.id })}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Xóa học bổng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {scholarships.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-32 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <Award className="w-16 h-16" />
                        <p className="font-black text-sm uppercase tracking-widest">Không có dữ liệu học bổng</p>
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
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Xóa học bổng"
        message="Bạn có chắc chắn muốn xóa học bổng này và tất cả hình ảnh liên quan?"
        type="danger"
      />
    </div>
  );
}
