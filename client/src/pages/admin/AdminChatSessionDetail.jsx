import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chatService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, AlertCircle, X, Brain, ExternalLink } from 'lucide-react';

export default function AdminChatSessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    chatService.getChatSessionById(id)
      .then((res) => setSession(res))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!session) return <p>Không tìm thấy phiên chat.</p>;

  return (
    <div className="space-y-6">
      <Link to="/admin/chat-sessions" className="flex items-center gap-1 text-xs text-[#2563eb] font-bold hover:underline mb-2">
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách
      </Link>

      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#0077b6] flex items-center justify-center rounded-xl shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 leading-none">Phiên #{session.id}</h1>
              <button 
                onClick={() => setShowGuide(true)}
                className="text-primary hover:text-primary-dark transition-colors p-1"
                title="Hướng dẫn huấn luyện AI"
              >
                <AlertCircle className="w-4.5 h-4.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Bắt đầu: {new Date(session.createdAt).toLocaleString()} 
              {session.visitor_phone && <span className="ml-2 text-primary">• SĐT: {session.visitor_phone}</span>}
              {session.visitor_email && <span className="ml-2 text-primary">• Email: {session.visitor_email}</span>}
              {session.visitor_school && <span className="ml-2 text-primary">• Trường: {session.visitor_school}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn text-left">
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
                  <strong>💡 Gợi ý:</strong> AI trả lời dựa trên kho tri thức mà bạn cung cấp. Khi phát hiện thông tin sai trong phiên chat này, hãy thực hiện các bước sau.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    step: "1", title: "Sao chép câu hỏi", 
                    desc: "Sao chép nội dung câu hỏi hoặc từ khóa mà AI đã trả lời sai trong đoạn hội thoại này." 
                  },
                  { 
                    step: "2", title: "Mở Quản lý tri thức", 
                    desc: "Sử dụng nút liên kết bên dưới để đến trang 'Quản lý tri thức AI' trong một tab mới." 
                  },
                  { 
                    step: "3", title: "Tìm và Sửa", 
                    desc: "Tìm kiếm thông tin tương ứng. Nếu đã có thì hãy 'Sửa' dữ liệu, nếu chưa có hãy 'Nạp kiến thức mới' với nội dung chính xác." 
                  },
                  { 
                    step: "4", title: "Thêm từ khóa", 
                    desc: "Bổ sung các từ khóa sát với câu hỏi người dùng vừa hỏi để AI dễ dàng nhận diện và trả lời đúng trong tương lai." 
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
                  target="_blank"
                  className="bg-primary text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:ring-4 hover:ring-primary/20 transition-all flex items-center justify-center gap-2 font-sans"
                >
                  Mở trang Tri thức AI <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
        {session.ChatMessages?.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'assistant' ? 'flex-row-reverse text-right' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#2563eb] text-white' : 'bg-blue-500 text-white'}`}>
              <span className="text-[10px] font-black uppercase">{msg.role[0]}</span>
            </div>
            <div className={`max-w-[80%] ${msg.role === 'assistant' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{msg.role === 'user' ? 'Người dùng' : 'AI Assistant'}</p>
                <span className="text-[10px] text-slate-300">•</span>
                <p className="text-[10px] text-slate-300">{new Date(msg.createdAt).toLocaleTimeString()}</p>
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-50 text-slate-800 rounded-tl-none' : 'bg-blue-50 text-slate-800 rounded-tr-none'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
