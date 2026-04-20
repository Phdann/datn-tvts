import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Filter, ArrowUpDown, Globe, Image as ImageIcon, Upload, X } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const statusBadge = {
  published: 'text-emerald-500 bg-emerald-50 border-emerald-100 shadow-sm',
  draft: 'text-slate-400 bg-slate-50 border-slate-100 shadow-sm',
  archived: 'text-amber-500 bg-amber-50 border-amber-100 shadow-sm'
};

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_URL}${url}`;
};

export default function AdminNews() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // New filters
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // newest, oldest, most_viewed

  // Multi-select
  const [selectedIds, setSelectedIds] = useState([]);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', status: 'draft', category_id: '', image_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imageSource, setImageSource] = useState('file'); // 'file' | 'url'
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetch = async () => {
    try {
      setLoading(true);
      setSelectedIds([]); // Clear selection on fetch

      let sortBy = 'createdAt';
      let sortOrder = 'DESC';

      if (sortOption === 'oldest') {
        sortOrder = 'ASC';
      } else if (sortOption === 'most_viewed') {
        sortBy = 'views';
        sortOrder = 'DESC';
      }

      const params = {
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder
      };

      const r = await api.get('/admin/posts', { params });
      setPosts(r.data?.data || []);
      setTotalPages(r.data?.totalPages || 1);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page, statusFilter, sortOption]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetch();
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/posts/${id}`);
      fetch();
      toast.success('Xoá bài viết thành công');
    } catch (err) {
      toast.error('Lỗi khi xoá bài viết');
    }
  };

  const handlePublish = async (id) => {
    try {
      await api.patch(`/admin/posts/${id}/publish`);
      fetch();
      toast.success('Đã xuất bản bài viết');
    } catch (err) {
      toast.error('Lỗi khi xuất bản bài viết');
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await api.patch(`/admin/posts/${id}/unpublish`);
      fetch();
      toast.success('Đã gỡ bài viết');
    } catch (err) {
      toast.error('Lỗi khi gỡ bài viết');
    }
  };

  const openEdit = (post) => {
    setEditing(post?.id || 'new');
    setForm(post ? {
      title: post.title,
      content: post.content || '',
      status: post.status,
      category_id: post.category_id || '',
      image_url: post.image_url || ''
    } : {
      title: '',
      content: '',
      status: 'draft',
      category_id: '',
      image_url: ''
    });
    setImageFile(null);
    setImageSource(post?.image_url?.startsWith('http') ? 'url' : 'file');
    setPreviewUrl(post?.image_url || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('status', form.status);
      if (form.category_id) formData.append('category_id', form.category_id);

      if (imageFile) {
        formData.append('image_url', imageFile);
      } else {
        formData.append('image_url', form.image_url || '');
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editing === 'new') await api.post('/admin/posts', formData, config);
      else await api.put(`/admin/posts/${editing}`, formData, config);

      setEditing(null);
      fetch();
      toast.success('Lưu bài viết thành công');
    } catch (err) {
      toast.error('Lỗi khi lưu bài viết');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === posts.length) setSelectedIds([]);
    else setSelectedIds(posts.map(p => p.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${selectedIds.length} bài viết đã chọn?`)) return;
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/admin/posts/${id}`)));
      toast.success(`Đã xoá ${selectedIds.length} bài viết`);
      setSelectedIds([]);
      fetch();
    } catch {
      toast.error('Lỗi khi xoá hàng loạt');
    }
  };

  const inputCls = 'w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:bg-white focus:border-primary rounded-xl transition-all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-blue-950 tracking-tight">Quản lý bài viết</h1>
        <button
          onClick={() => openEdit(null)}
          className="bg-primary text-white text-xs font-black uppercase tracking-widest px-6 py-3 flex items-center gap-2 hover:bg-primary/90 rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Thêm bài mới
        </button>
      </div>

      {editing !== null ? (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 p-8 space-y-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
            <h2 className="text-base font-black text-blue-950 uppercase tracking-tight">
              {editing === 'new' ? 'Tạo bài viết mới' : 'Chỉnh sửa nội dung'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Trạng thái:</span>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="bg-slate-100 border-none text-[11px] font-bold px-3 py-1.5 rounded-lg focus:ring-0 cursor-pointer"
              >
                <option value="draft">Nháp (Ẩn)</option>
                <option value="published">Xuất bản (Hiển thị)</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Tiêu đề bài viết *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Nhập tiêu đề hấp dẫn..." />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Nội dung chi tiết</label>
                <textarea rows={12} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className={`${inputCls} resize-none leading-relaxed`} placeholder="Viết nội dung bài viết tại đây..." />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Hình ảnh đại diện</label>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                   {/* Upload Button */}
                   <button 
                     type="button"
                     onClick={() => document.getElementById('post-image').click()}
                     className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-dashed border-slate-100 text-slate-500 hover:border-primary/50 hover:text-primary transition-all rounded-2xl group shadow-sm"
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
                       value={form.image_url?.startsWith('http') ? form.image_url : ''}
                       onChange={e => {
                         const url = e.target.value;
                         setImageFile(null);
                         setForm({...form, image_url: url});
                         setPreviewUrl(url);
                       }}
                       placeholder="Dán link ảnh & Enter..."
                       className="w-full bg-slate-50/50 border border-slate-100 pl-11 pr-12 py-3.5 text-xs font-bold focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all shadow-inner-sm"
                     />
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-md">
                        <Plus className="w-5 h-5" />
                     </div>
                   </div>

                   {/* Preview Area */}
                   <div className="pt-2 flex justify-center">
                     {previewUrl ? (
                       <div className="relative group/preview w-full max-w-[300px]">
                         <img 
                           src={getImageUrl(previewUrl)} 
                           alt="Preview" 
                           className="w-full aspect-video object-cover rounded-2xl border border-slate-200 shadow-lg group-hover:scale-[1.01] transition-transform" 
                         />
                         <button 
                           type="button" 
                           onClick={() => { setForm({ ...form, image_url: '' }); setImageFile(null); setPreviewUrl(''); }}
                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:bg-red-600 hover:scale-110 transition-all font-bold"
                         >
                             <X className="w-3.5 h-3.5" />
                         </button>
                       </div>
                     ) : (
                       <div className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center bg-slate-50/30 text-slate-300 gap-2">
                          <ImageIcon className="w-8 h-8 opacity-20" />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Phần xem trước (Preview)</span>
                       </div>
                     )}
                   </div>
                   
                   <input 
                     id="post-image"
                     type="file" 
                     accept="image/*" 
                     onChange={handleFileChange} 
                     className="hidden"
                   />
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic leading-relaxed">* Gợi ý: Sử dụng ảnh có tỷ lệ 16:9 để hiển thị đẹp nhất trên trang chủ.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-100 bg-slate-50 px-8 py-5 -mx-8 -mb-8">
            <button type="button" onClick={() => setEditing(null)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
              Huỷ bỏ
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="bg-primary text-white text-xs font-black uppercase tracking-widest px-10 py-4 rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              {saving ? 'Đang lưu nội dung...' : 'Lưu bài viết'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-[24px] p-2.5 shadow-sm mb-6 flex flex-col lg:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full bg-slate-50 border border-transparent pl-11 pr-4 py-3 text-sm font-medium focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-[18px] transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-transparent hover:border-slate-200 px-3.5 py-2 rounded-[16px] transition-all">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-transparent border-none text-[11px] font-black text-slate-600 uppercase tracking-widest focus:ring-0 cursor-pointer h-7"
                >
                  <option value="">Tất cả</option>
                  <option value="draft">Bản nháp</option>
                  <option value="published">Công khai</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-transparent hover:border-slate-200 px-3.5 py-2 rounded-[16px] transition-all">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortOption}
                  onChange={e => { setSortOption(e.target.value); setPage(1); }}
                  className="bg-transparent border-none text-[11px] font-black text-slate-600 uppercase tracking-widest focus:ring-0 cursor-pointer h-7"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="most_viewed">Lượt xem</option>
                </select>
              </div>

              <button
                onClick={() => handleSearch()}
                className="bg-slate-900 text-white px-8 py-3 rounded-[18px] hover:bg-black transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200"
              >
                TÌM KIẾM
              </button>
            </div>

            {selectedIds.length > 0 && (
              <div className="lg:absolute lg:-bottom-12 lg:right-0 flex items-center gap-3 bg-red-50 px-4 py-2.5 rounded-2xl border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Đang chọn: {selectedIds.length}</span>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl hover:bg-red-600 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> XÓA
                </button>
              </div>
            )}
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="bg-white border border-slate-200 overflow-hidden rounded-2xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      <th className="px-4 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === posts.length && posts.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-4 w-12">STT</th>
                      <th className="text-left px-6 py-4">Bài viết</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4">Lượt xem</th>
                      <th className="px-6 py-4">Thời gian tạo</th>
                      <th className="px-6 py-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {posts.map((p, index) => (
                      <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors group ${selectedIds.includes(p.id) ? 'bg-primary/5' : ''}`}>
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(p.id)}
                            onChange={() => toggleSelectRow(p.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-400 text-[11px]">
                          {(page - 1) * 10 + index + 1}
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {p.image_url ? (
                                <img src={getImageUrl(p.image_url)} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                  <Eye className="w-5 h-5 opacity-20" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate max-w-xs">{p.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusBadge[p.status] || ''}`}>
                            {p.status === 'published' ? 'Công khai' : (p.status === 'draft' ? 'Bản nháp' : 'Lưu trữ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <span className="font-black text-slate-900">{p.views?.toLocaleString() || 0}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Lượt xem</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {p.status === 'draft' && (
                              <button onClick={() => handlePublish(p.id)} title="Hiển thị bài viết" className="text-emerald-500 hover:bg-emerald-50 p-2 rounded-xl transition-all">
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            {p.status === 'published' && (
                              <button onClick={() => handleUnpublish(p.id)} title="Ẩn bài viết" className="text-amber-500 hover:bg-amber-50 p-2 rounded-xl transition-all">
                                <EyeOff className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => openEdit(p)} title="Sửa" className="text-blue-500 hover:bg-blue-50 p-2 rounded-xl transition-all">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmDelete({ open: true, id: p.id })} title="Xoá" className="text-red-400 hover:bg-red-50 p-2 rounded-xl transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <Search className="w-12 h-12 mb-4 opacity-10" />
                            <p className="text-sm font-black uppercase tracking-widest">Không tìm thấy bài viết nào</p>
                            <p className="text-xs font-medium text-slate-400 mt-2 italic">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm của bạn</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="mt-8 flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
      <ConfirmModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Xoá bài viết"
        message="Dữ liệu bài viết sẽ bị xoá vĩnh viễn và không thể khôi phục. Bạn có chắc chắn?"
        type="danger"
      />
    </div>
  );
}
