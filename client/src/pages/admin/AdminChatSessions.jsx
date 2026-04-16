import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Trash2, RefreshCw, AlertCircle, X, Brain, ExternalLink, Zap, Database, MessageSquare, BarChart3 } from 'lucide-react';
import { chatService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminChatSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatStats, setChatStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetch = async (p = page) => {
    try {
      setLoading(true);
      const params = { page: p, limit: 20 };
      if (search.trim()) params.search = search.trim();
      const res = await chatService.getAllChatSessions(params);
      setSessions(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (err) {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetch(); 
    chatService.getChatStatistics().then(setChatStats).catch(() => {});
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetch(1);
  };

  const handleDelete = async (id) => {
    try {
      await chatService.deleteChatSession(id);
      fetch();
      toast.success('Xoá phiên chat thành công');
    } catch (err) {
      toast.error('Lỗi khi xoá phiên chat');
    }
  };

  const refresh = () => fetch();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#0077b6] flex items-center justify-center rounded-xl">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 leading-none">Phiên trò chuyện AI</h1>
              <button 
                onClick={() => setShowGuide(true)}
                className="text-primary hover:text-primary-dark transition-colors p-1"
                title="Hướng dẫn huấn luyện AI"
              >
                <AlertCircle className="w-4.5 h-4.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">Có tổng {total} phiên chat</p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="border border-slate-200 px-3 py-2.5 text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-1.5 rounded-xl"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {chatStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Phiên 24h', value: chatStats.active_sessions_24h, icon: Zap, color: 'from-emerald-500 to-emerald-600' },
            { label: 'Tổng phiên', value: chatStats.total_sessions, icon: Database, color: 'from-slate-600 to-slate-700' },
            { label: 'Tổng tin nhắn', value: chatStats.total_messages, icon: MessageSquare, color: 'from-blue-600 to-blue-700' },
            { label: 'TB tin/phiên', value: chatStats.avg_messages_per_session, icon: BarChart3, color: 'from-primary to-primary-dark' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className={`w-12 h-12 bg-gradient-to-br ${color} flex items-center justify-center rounded-xl shadow-lg shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-slate-900 bg-slate-50/50">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" /> Cách huấn luyện AI khi trả lời sai
              </h2>
              <button onClick={() => setShowGuide(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                  <strong>💡 Gợi ý:</strong> AI không tự "học" từ tin nhắn của khách. Nó trả lời dựa trên kho tri thức mà bạn cung cấp. Khi AI trả lời sai, hãy điều chỉnh tri thức tương ứng.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    step: "1", title: "Phát hiện lỗi", 
                    desc: "Nhấn vào 'Xem' ở danh sách phiên chat bên dưới để rà soát nội dung. Nếu thấy AI trả lời sai hoặc không đúng ý, hãy copy câu hỏi/chủ đề đó." 
                  },
                  { 
                    step: "2", title: "Mở Quản lý tri thức", 
                    desc: "Sử dụng nút liên kết bên dưới để đến trang 'Quản lý tri thức AI'. Đây là nơi chứa các quy tắc và thông tin mà AI sử dụng." 
                  },
                  { 
                    step: "3", title: "Điều chỉnh dữ liệu", 
                    desc: "Tìm kiếm thông tin bị sai. Nếu đã có thì hãy nhấn 'Sửa', nếu chưa có hãy nhấn 'Nạp kiến thức mới'. Viết thật chi tiết và chính xác nội dung bạn muốn AI nói." 
                  },
                  { 
                    step: "4", title: "Thêm từ khóa", 
                    desc: "Trong mục 'Từ khóa' (Keywords), hãy thêm các từ mà người dùng hay hỏi liên quan đến chủ đề đó để AI dễ dàng nhận diện." 
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 bg-primary/10 text-primary font-black rounded-full flex items-center justify-center shrink-0 text-xs">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowGuide(false)} 
                  className="bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all font-sans"
                >
                  Đóng hướng dẫn
                </button>
                <Link
                  to="/admin/chat-data"
                  className="bg-primary text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:ring-4 hover:ring-primary/20 transition-all flex items-center justify-center gap-2 font-sans"
                >
                  Đến trang Tri thức AI <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo ID hoặc nội dung..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 text-sm focus:outline-none focus:border-[#2563eb] placeholder:text-slate-400 rounded-xl transition-all shadow-inner-sm"
        />
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-slate-200 rounded-none overflow-x-auto shadow-none">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Người dùng</th>
                <th className="px-4 py-3 text-left font-semibold">Tin cuối</th>
                <th className="px-4 py-3 text-left font-semibold">Cập nhật</th>
                <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">{s.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                    {s.user_id ? (s.user?.email || `User ID: ${s.user_id}`) : (s.visitor_phone || s.visitor_email || s.visitor_name || 'Khách vãng lai')}
                  </td>
                  <td className="px-4 py-3 text-ellipsis max-w-[200px] overflow-hidden">
                    {s.ChatMessages?.[0]?.content?.slice(-50) || ''}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(s.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link 
                        to={`/admin/chat-sessions/${s.id}`} 
                        className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors rounded-lg"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setConfirmDelete({ open: true, id: s.id })}
                        className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-lg"
                        title="Xoá phiên chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      <ConfirmModal 
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Xoá phiên chat"
        message="Bạn có chắc chắn muốn xoá phiên trò chuyện này?"
        type="danger"
      />
    </div>
  );
}
