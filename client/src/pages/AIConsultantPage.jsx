import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, MessageCircle } from 'lucide-react';
import { chatService } from '../services';
import PageHeader from '../components/PageHeader';

export default function AIConsultantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý tư vấn AI của Trường Đại học Kinh tế - ĐH Đà Nẵng (DUE). Tôi có thể giúp bạn tìm hiểu về:\n\n• Ngành đào tạo và chương trình học\n• Phương thức tuyển sinh\n• Điểm chuẩn các năm\n• Học phí và chính sách hỗ trợ\n• Và nhiều thông tin khác\n\nBạn cần tư vấn về vấn đề gì?' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setSending(true);

    try {
      const data = await chatService.sendMessage({
        message: userMsg,
        sessionId,
        context: { persona: 'student' },
      });
      setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.' }]);
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Cuộc trò chuyện đã được đặt lại. Bạn cần tư vấn gì?' }]);
    setSessionId(null);
  };

  return (
    <div>
      <PageHeader
        title="Tư vấn trực tuyến"
        subtitle="Trò chuyện với trợ lý AI để được tư vấn tuyển sinh"
        breadcrumbs={[{ label: 'Tư vấn trực tuyến' }]}
      />

      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="border border-slate-200 bg-white flex flex-col" style={{ height: '70vh' }}>
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Trợ lý AI DUE</p>
                <p className="text-[10px] text-green-500 font-semibold">● Trực tuyến</p>
              </div>
            </div>
            <button onClick={clearChat} className="text-slate-400 hover:text-red-500 transition-colors" title="Xoá cuộc trò chuyện">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-slate-50 text-slate-700 border border-slate-100'
                  }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-400">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex border-t border-slate-100 p-3 gap-2">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-slate-200 px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:border-primary"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="bg-primary text-white px-4 py-2.5 hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Quick suggestions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['Ngành nào có điểm chuẩn thấp nhất?', 'Học phí bao nhiêu?', 'Có chương trình du học không?', 'Cách đăng ký xét tuyển?'].map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="text-xs text-primary border border-primary/30 px-3 py-1.5 hover:bg-primary/5 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
