import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Brain, Search, Filter, CheckCircle,
  AlertCircle, Archive, RefreshCw, Database, Zap, BookOpen, FileText, MessageSquare, BarChart3, X
} from 'lucide-react';
import api from '../../services/api';
import { chatService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

/* ── Status config ── */
const STATUS_MAP = {
  active: { label: 'Đang hoạt động', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  draft: { label: 'Bản nháp', cls: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  archived: { label: 'Lưu trữ', cls: 'bg-slate-100 text-slate-500', icon: Archive },
};

const TYPE_MAP = {
  general: 'Thông tin chung',
  admission: 'Tuyển sinh',
  major: 'Ngành học',
  scholarship: 'Học bổng',
  tuition: 'Học phí',
  campus: 'Cơ sở vật chất',
  policy: 'Chính sách',
  faq: 'FAQ',
};

export default function AdminChatDataManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  /* ── Fetch ── */
  const fetchData = async () => {
    try {
      setLoading(true);
      const r = await api.get('/admin/chat-data');
      setItems(Array.isArray(r.data) ? r.data : r.data?.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await api.delete(`/admin/chat-data/${id}`);
      fetchData();
      toast.success('Xoá dữ liệu thành công');
    } catch (err) {
      toast.error('Lỗi khi xoá dữ liệu');
    } finally {
      setDeleting(null);
    }
  };

  /* ── Computed ── */
  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchSearch = !search ||
        (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.content || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.keywords || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.major || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchType = typeFilter === 'all' || item.content_type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [items, search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter(i => i.status === 'active').length,
    draft: items.filter(i => i.status === 'draft').length,
    archived: items.filter(i => i.status === 'archived').length,
  }), [items]);

  /* ── Render ── */
  return (
    <div>
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#0077b6] flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Quản lý tri thức AI</h1>
            <p className="text-[11px] text-slate-400">Nạp, quản lý dữ liệu cho bộ não AI tư vấn tuyển sinh</p>
          </div>
        </div>
        <Link
          to="/admin/chat-data/new"
          className="bg-primary text-white text-xs font-black px-5 py-2.5 flex items-center gap-2 hover:bg-primary/90 transition-all rounded-xl shadow-none uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" /> Nạp kiến thức mới
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Tổng cộng', value: stats.total, icon: Database, color: 'from-slate-500 to-slate-600' },
          { label: 'Đang hoạt động', value: stats.active, icon: Zap, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Bản nháp', value: stats.draft, icon: FileText, color: 'from-amber-500 to-amber-600' },
          { label: 'Lưu trữ', value: stats.archived, icon: Archive, color: 'from-slate-400 to-slate-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm group hover:shadow-md transition-all">
            <div className={`w-12 h-12 bg-gradient-to-br ${color} flex items-center justify-center rounded-xl shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Filters ═══ */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung, từ khóa, ngành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 text-sm focus:outline-none focus:border-[#00558d] placeholder:text-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#00558d] bg-white min-w-[150px]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="draft">Bản nháp</option>
          <option value="archived">Lưu trữ</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#00558d] bg-white min-w-[140px]"
        >
          <option value="all">Tất cả loại</option>
          {Object.entries(TYPE_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          onClick={fetchData}
          className="border border-slate-200 px-3 py-2.5 text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ═══ Results count ═══ */}
      <p className="text-xs text-slate-400 mb-3">
        Hiển thị <span className="font-bold text-slate-600">{filtered.length}</span> / {items.length} mục
      </p>

      {/* ═══ Table ═══ */}
      {loading ? <LoadingSpinner /> : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="text-center px-4 py-4 w-12">STT</th>
                <th className="text-left px-6 py-4">Nội dung tri thức</th>
                <th className="text-center px-4 py-4 w-24">Phân loại</th>
                <th className="text-left px-4 py-4 w-40">Ngành / Năm</th>
                <th className="text-left px-4 py-4 w-36">Trạng thái</th>
                <th className="text-center px-4 py-4 w-32">Cập nhật</th>
                <th className="text-right px-6 py-4 w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, i) => {
                const st = STATUS_MAP[item.status] || STATUS_MAP.draft;
                const dotColor = item.status === 'active' ? 'bg-emerald-500' : item.status === 'draft' ? 'bg-amber-500' : 'bg-slate-400';

                return (
                  <tr key={item.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-4 text-center text-xs text-slate-400 font-medium">
                      {i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="font-semibold text-slate-800 leading-snug mb-1.5 transition-colors">
                          {item.title}
                        </p>
                        {item.keywords && (
                          <div className="flex flex-wrap gap-2">
                            {item.keywords.split(',').slice(0, 3).map((kw, i) => (
                              <span key={i} className="text-[10px] text-slate-400">
                                #{kw.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tight">
                        {TYPE_MAP[item.content_type] || item.content_type || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-600 font-medium">{item.major || 'Tổng hợp'}</p>
                      {item.admission_year && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Niên khóa {item.admission_year}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span className="text-xs text-slate-600 font-medium">{st.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-xs text-slate-400">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/chat-data/edit/${item.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete({ open: true, id: item.id })}
                          disabled={deleting === item.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                          title="Xoá"
                        >
                          {deleting === item.id
                            ? <RefreshCw className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-20 text-center">
                    <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-400">Không tìm thấy dữ liệu phù hợp</p>
                    <Link to="/admin/chat-data/new" className="text-xs text-primary font-bold hover:underline mt-2 inline-block uppercase tracking-wider">
                      + Nạp kiến thức mới
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Xoá dữ liệu tri thức"
        message="Bạn có chắc chắn muốn xoá dữ liệu này? Hành động này cũng sẽ xoá vector embedding khỏi AI."
        type="danger"
      />
    </div>
  );
}
