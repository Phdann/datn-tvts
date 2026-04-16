import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, X, Save, Search,
  Image as ImageIcon, Eye, EyeOff, Calendar, FileText,
  RefreshCw, Loader2, Globe, Upload, Plus as PlusIcon
} from 'lucide-react';
import { trainingTypeService } from '../../services';
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

export default function AdminTrainingTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', content_text: '', year: new Date().getFullYear(), is_visible: true, image_urls: [] });
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  const toast = useToast();

  const loadTypes = async () => {
    try {
      setLoading(true);
      setSelectedIds([]);
      const data = await trainingTypeService.getAdminTrainingTypes();
      setTypes(data || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách loại hình đào tạo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleOpenModal = (type = null) => {
    if (type) {
      setEditingId(type.id);
      setForm({
        name: type.name || '',
        content_text: type.content_text || '',
        year: type.year || new Date().getFullYear(),
        is_visible: type.is_visible ?? true,
        image_urls: type.image_urls || (type.image_url ? [type.image_url] : [])
      });
    } else {
      setEditingId(null);
      setForm({ name: '', content_text: '', year: new Date().getFullYear(), is_visible: true, image_urls: [] });
    }
    setImageFiles([]);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('content_text', form.content_text);
      formData.append('year', form.year);
      formData.append('is_visible', form.is_visible);
      if (form.image_urls) {
        formData.append('kept_images', JSON.stringify(form.image_urls));
      }
      imageFiles.forEach(file => formData.append('images', file));

      if (editingId) {
        await trainingTypeService.updateTrainingType(editingId, formData);
        toast.success('Cập nhật thành công');
      } else {
        await trainingTypeService.createTrainingType(formData);
        toast.success('Thêm mới thành công');
      }
      setModalOpen(false);
      loadTypes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await trainingTypeService.deleteTrainingType(id);
      toast.success('Xoá thành công');
      loadTypes();
    } catch (error) {
      toast.error('Lỗi khi xoá');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTypes.length) setSelectedIds([]);
    else setSelectedIds(filteredTypes.map(t => t.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${selectedIds.length} loại hình đào tạo đã chọn?`)) return;
    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => trainingTypeService.deleteTrainingType(id)));
      toast.success(`Đã xoá ${selectedIds.length} loại hình`);
      setSelectedIds([]);
      loadTypes();
    } catch {
      toast.error('Lỗi khi xoá hàng loạt');
      setLoading(false);
    }
  };

  const filteredTypes = types.filter(t =>
    (t.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-slate-50 focus:bg-white";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 flex items-center justify-center rounded-2xl shadow-sm">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Loại hình đào tạo</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Hệ đào tạo: Chính quy, CLC, Liên kết...</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white text-xs font-black px-6 py-3 flex items-center gap-2 hover:bg-primary/90 rounded-xl transition-all uppercase tracking-widest shadow-sm"
        >
          <Plus className="w-4 h-4" /> Thêm loại hình mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text" placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl transition-all bg-slate-50 focus:bg-white shadow-inner-sm"
            />
          </div>
          <button
            type="button"
            onClick={loadTypes}
            className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Đã chọn: <span className="text-primary">{selectedIds.length}</span> loại hình
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

      {loading && types.length === 0 ? (
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
                      checked={selectedIds.length === filteredTypes.length && filteredTypes.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-5 border-b border-slate-100 w-12 text-center">STT</th>
                  <th className="px-4 py-5 border-b border-slate-100 min-w-[300px]">Hình ảnh & Thông tin</th>
                  <th className="px-4 py-5 border-b border-slate-100 text-center">Năm tuyển sinh</th>
                  <th className="px-4 py-5 border-b border-slate-100 text-center">Trạng thái</th>
                  <th className="px-4 py-5 border-b border-slate-100 text-right w-28 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTypes.map((type, idx) => (
                  <tr key={type.id} className={`hover:bg-slate-50 transition-all group ${selectedIds.includes(type.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(type.id)}
                        onChange={() => toggleSelectRow(type.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 relative shadow-inner-sm overflow-x-auto custom-scrollbar flex gap-1 items-center px-1">
                          {(type.image_urls?.length > 0 || type.image_url) ? (
                            (type.image_urls || [type.image_url]).map((url, i) => (
                              <img key={i} src={getImageUrl(url)} alt={type.name} className="h-10 w-auto object-cover rounded shadow-sm bg-white border border-slate-200 flex-shrink-0" />
                            ))
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-700 block truncate group-hover:text-primary transition-colors">{type.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5 italic line-clamp-1">{type.content_text || 'Chưa có nội dung mô tả'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">{type.year || '—'}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {type.is_visible ? (
                        <span className="text-emerald-500 text-[10px] font-black uppercase px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 tracking-widest shadow-sm flex items-center justify-center gap-1 mx-auto w-fit">
                          <Eye className="w-3 h-3" /> Hiển thị
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-black uppercase px-3 py-1 bg-slate-50 rounded-full border border-slate-100 tracking-widest shadow-sm flex items-center justify-center gap-1 mx-auto w-fit">
                          <EyeOff className="w-3 h-3" /> Đã ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(type)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Sửa">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete({ open: true, id: type.id })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Xoá">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTypes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-32 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <FileText className="w-16 h-16" />
                        <p className="font-black text-sm uppercase tracking-widest">{searchTerm ? 'Không tìm thấy loại hình phù hợp' : 'Chưa có dữ liệu loại hình'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl shadow-2xl border border-slate-200 rounded-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest tracking-tight">
                {editingId ? 'Chỉnh sửa loại hình' : 'Thêm loại hình mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} disabled={saving} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên loại hình *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                    placeholder="VD: Chất lượng cao"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Năm tuyển sinh</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className={`${inputCls} pl-10 font-bold`}
                      placeholder="2024"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mô tả chi tiết</label>
                <textarea
                  rows={4}
                  value={form.content_text}
                  onChange={(e) => setForm({ ...form, content_text: e.target.value })}
                  className={`${inputCls} resize-none`}
                  placeholder="Mô tả tóm tắt về loại hình đào tạo..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hình ảnh minh họa</label>

                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <div className="flex bg-slate-50 border-b border-slate-100 p-1">
                        <button
                          type="button"
                          onClick={() => document.getElementById('image-upload').click()}
                          className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all rounded-lg"
                        >
                          <Upload className="w-3 h-3" /> Tải tệp lên
                        </button>
                        <div className="w-[1px] bg-slate-200 my-1"></div>
                        <div className="flex-1 relative flex items-center px-2">
                          <Globe className="absolute left-4 w-3 h-3 text-slate-400" />
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
                            placeholder="Dán link & Enter..."
                            className="w-full bg-transparent border-none pl-7 py-1 text-[10px] font-bold focus:ring-0 placeholder:text-slate-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (imageUrlInput.trim()) {
                                setForm(f => ({ ...f, image_urls: [...(f.image_urls || []), imageUrlInput.trim()] }));
                                setImageUrlInput('');
                              }
                            }}
                            className="p-1 px-2 bg-primary text-white rounded-lg hover:scale-110 transition-all ml-1"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-wrap gap-4 justify-center min-h-[100px] items-center">
                          {form.image_urls?.map((url, i) => (
                            <div key={`kept-${i}`} className="relative group/img animate-in zoom-in-50">
                              <img src={getImageUrl(url)} alt="Preview" className="h-20 w-20 object-cover rounded-2xl shadow-md border border-slate-200 bg-white" />
                              <button type="button" onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, image_urls: f.image_urls.filter((_, idx) => idx !== i) })) }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 shadow-md transition-all scale-75 hover:scale-100"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                          {imageFiles.map((file, i) => (
                            <div key={`new-${i}`} className="relative group/img animate-in zoom-in-50">
                              <img src={URL.createObjectURL(file)} alt="Preview" className="h-20 w-20 object-cover rounded-2xl shadow-md border border-primary/20 bg-white" />
                              <button type="button" onClick={(e) => { e.stopPropagation(); setImageFiles(prev => prev.filter((_, idx) => idx !== i)) }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 shadow-md transition-all scale-75 hover:scale-100"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                          {(!form.image_urls?.length && !imageFiles.length) && (
                            <div className="flex flex-col items-center gap-2 opacity-20 py-4">
                              <ImageIcon className="w-10 h-10" />
                              <span className="text-[9px] font-black uppercase tracking-widest">Chưa có ảnh nào</span>
                            </div>
                          )}
                        </div>
                        <input id="image-upload" type="file" multiple hidden accept="image/*" onChange={handleImageChange} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-primary/40 transition-all shadow-inner-sm group">
                    <input
                      type="checkbox"
                      checked={form.is_visible}
                      onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                      className="w-6 h-6 text-primary border-slate-300 rounded-lg focus:ring-primary shadow-sm"
                    />
                    <div>
                      <span className="block text-xs font-black text-slate-700 uppercase tracking-wider">Kích hoạt hiển thị</span>
                      <span className="text-[10px] text-slate-400 font-bold leading-tight block mt-1">Cho phép thí sinh xem thông tin này trên hệ thống</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-100 bg-slate-50 px-8 py-5 -mx-8 -mb-8">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white text-[11px] font-black uppercase tracking-widest px-10 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 hover:bg-primary/90 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thông tin
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
        title="Xoá loại hình đào tạo"
        message="Dữ liệu này sẽ được gỡ khỏi tất cả các ngành đào tạo đang liên kết. Bạn có chắc chắn muốn xoá?"
        type="danger"
      />
    </div>
  );
}
