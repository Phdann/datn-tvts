import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, ArrowUpDown, X } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-600 font-medium placeholder:text-slate-400 placeholder:font-normal";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetch = async () => {
    try {
      setLoading(true);
      const params = { search: search || undefined };
      const r = await api.get('/admin/categories', { params });
      setCategories(r.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetch();
  };

  const openEdit = (category) => {
    setEditing(category?.id || 'new');
    setForm(category ? {
      name: category.name,
      description: category.description || ''
    } : {
      name: '',
      description: ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing === 'new') {
        await api.post('/admin/categories', form);
        toast.success('Thêm danh mục thành công');
      } else {
        await api.put(`/admin/categories/${editing}`, form);
        toast.success('Cập nhật danh mục thành công');
      }
      setEditing(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      fetch();
      toast.success('Xoá danh mục thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xoá danh mục. Có thể danh mục này đang chứa bài viết.');
    }
  };

  if (loading && categories.length === 0) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Quản lý danh mục bài viết</h1>
          <p className="text-slate-500 font-medium">Tạo và quản lý các phân loại cho tin tức & thông báo</p>
        </div>
        <button
          onClick={() => openEdit(null)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-xl transition-all outline-none text-slate-600 font-medium"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Tên danh mục</th>
                <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Mô tả</th>
                <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Số bài viết</th>
                <th className="text-right px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tight">Slug: {item.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-500 line-clamp-1">{item.description || 'Không có mô tả'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">
                    {item.Posts?.length || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ open: true, id: item.id })}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy danh mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !saving && setEditing(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {editing === 'new' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Vui lòng điền đầy đủ thông tin bên dưới</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Tên danh mục *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="Ví dụ: Thông báo, Tin tức, Sự kiện..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Mô tả</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`}
                  placeholder="Nhập mô tả ngắn gọn về danh mục này..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                  className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] px-6 py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu danh mục'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => {
          handleDelete(confirmDelete.id);
          setConfirmDelete({ open: false, id: null });
        }}
        title="Xoá danh mục"
        message="Bạn có chắc chắn muốn xoá danh mục này? Hành động này không thể hoàn tác và chỉ có thể thực hiện nếu danh mục không có bài viết."
        type="danger"
      />
    </div>
  );
}
