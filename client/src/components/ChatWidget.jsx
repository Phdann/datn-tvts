import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle, Send, Maximize2, Minimize2, X, Bot, User,
  GraduationCap, Users, Sparkles, ExternalLink, ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendMessage, getChatHistory } from '../services/chatService';
import logoDue from '../assets/Logo_DUE.jpg';

/* ─────────── Utils ─────────── */
const fmtMoney = (n) => n ? new Intl.NumberFormat('vi-VN').format(n) + ' đ' : '—';
const GREETINGS = [
  'Xin chào! 👋 Mình là Trợ Lý Tư Vấn Tuyển Sinh - Giải đáp mọi thắc mắc.',
  'Bạn hãy hỏi mình bất cứ điều gì về ngành học, điểm chuẩn, học phí nhé! 🎓'
];

/* ─────────── Typing indicator ─────────── */
function TypingDots() {
  return (
    <div className="flex items-end gap-2 py-2">
      <div className="w-7 h-7 bg-white flex items-center justify-center shrink-0 rounded-full border border-slate-100 overflow-hidden shadow-sm">
        <img src={logoDue} alt="DUE Logo" className="w-full h-full object-contain" />
      </div>
      <div className="bg-slate-50/50 px-4 py-3 flex items-center gap-1 rounded-2xl">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full"
            style={{
              animation: 'typingBounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────── Major Card inside bubble ─────────── */
function MajorCard({ data }) {
  if (!data) return null;
  return (
    <div className="mt-3 bg-gradient-to-br from-[#2563eb]/5 to-[#2B6CB0]/5 border border-[#2563eb]/20 overflow-hidden">
      <div className="bg-[#2563eb] px-4 py-2.5 flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-white/80" />
        <span className="text-xs font-bold text-white tracking-wide uppercase">Thẻ ngành học</span>
      </div>
      <div className="p-4 space-y-2.5">
        <h4 className="text-sm font-extrabold text-[#2563eb] leading-tight">{data.name}</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {[
            ['Mã ngành', data.code],
            ['Khoa', data.faculty],
            ['Học phí', fmtMoney(data.tuition)],
            ['Chỉ tiêu', data.quota ? `${data.quota} SV` : '—']
          ].map(([label, val]) => (
            <div key={label}>
              <span className="text-slate-400 font-semibold">{label}</span>
              <p className="font-bold text-slate-700">{val || '—'}</p>
            </div>
          ))}
        </div>
        {data.id && (
          <a
            href={`/nganh-dao-tao/${data.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2563eb] hover:underline mt-1"
          >
            Xem chi tiết <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ─────────── Chart Card inside bubble ─────────── */
function ChartCard({ data }) {
  if (!data?.scores?.length) return null;
  const maxScore = Math.max(...data.scores.map(s => s.score || 0));
  return (
    <div className="mt-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 overflow-hidden">
      <div className="bg-amber-500 px-4 py-2 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-white/80" />
        <span className="text-xs font-bold text-white tracking-wide uppercase">{data.title || 'Điểm chuẩn'}</span>
      </div>
      <div className="p-4 space-y-2">
        {data.scores.map((s, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <span className="w-10 text-right font-bold text-slate-500">{s.year}</span>
            <div className="flex-1 h-5 bg-amber-100 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
                style={{ width: maxScore > 0 ? `${((s.score || 0) / maxScore) * 100}%` : '0%' }}
              />
              <span className="absolute inset-0 flex items-center px-2 font-extrabold text-[10px] text-slate-800">
                {s.score} đ — {s.major} ({s.method})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Suggestions List ─────────── */
function SuggestionList({ suggestions, onSelect, disabled }) {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3 ml-8">
      {suggestions.map((text, i) => (
        <button
          key={i}
          disabled={disabled}
          onClick={() => onSelect(text)}
          className="bg-white hover:bg-slate-50 text-[#2563eb] text-xs font-bold px-3 py-2 border border-[#2563eb]/20 shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
        >
          {text} ✨
        </button>
      ))}
    </div>
  );
}

/* ─────────── Single Chat Bubble ─────────── */
function ChatBubble({ msg, onSelectSuggestion, isLatest, loading }) {
  const isUser = msg.role === 'user';

  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div
          className={`w-7 h-7 flex items-center justify-center shrink-0 rounded-full overflow-hidden ${
            isUser ? 'bg-slate-700' : 'bg-white border border-slate-100 shadow-sm'
          }`}
        >
          {isUser
            ? <User className="w-3.5 h-3.5 text-white" />
            : <img src={logoDue} alt="DUE Logo" className="w-full h-full object-contain" />
          }
        </div>

        {/* Content */}
        <div className={`max-w-[80%] ${isUser ? 'ml-8' : 'mr-8'}`}>
          <div
            className={`px-4 py-2.5 text-[13px] leading-relaxed break-words border border-slate-100 shadow-sm ${
              isUser
                ? 'bg-slate-50 text-slate-700 font-bold rounded-2xl rounded-br-[4px]'
                : 'bg-white text-slate-600 font-medium rounded-2xl rounded-bl-[4px]'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            ) : (
              <div className="chat-markdown prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-2 prose-a:text-[#2563eb] prose-strong:text-slate-900">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Structured data cards */}
          {msg.majorCard && <MajorCard data={msg.majorCard} />}
          {msg.chart && <ChartCard data={msg.chart} />}

          {/* Timestamp */}
          <p className={`text-[10px] mt-1 ${isUser ? 'text-right' : ''} text-slate-400`}>
            {msg.time || ''}
          </p>
        </div>
      </div>
      
      {/* Suggestions - Only show for latest assistant message */}
      {!isUser && isLatest && msg.suggestions && (
        <SuggestionList 
          suggestions={msg.suggestions} 
          onSelect={onSelectSuggestion} 
          disabled={loading}
        />
      )}
    </div>
  );
}

/* ─────────── Welcome Form (Name + Phone) ─────────── */
function WelcomeForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      name: name.trim(), 
      phone: phone.trim(),
      email: email.trim(),
      school: school.trim()
    });
  };

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-white p-2 flex items-center justify-center mb-4 rounded-full border border-slate-100 shadow-md">
        <img src={logoDue} alt="DUE Logo" className="w-full h-full object-contain" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 mb-1">Trợ Lý Tư Vấn Tuyển Sinh</h3>
      <p className="text-xs text-slate-500 mb-5 max-w-[240px]">
        Vui lòng nhập đầy đủ thông tin để mình hỗ trợ bạn tốt nhất nhé! ✨
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-[280px] space-y-3">
        <input
          required
          autoFocus
          placeholder="Họ và tên *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] placeholder:text-slate-400 rounded-xl"
        />
        <input
          required
          type="tel"
          placeholder="Số điện thoại *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] placeholder:text-slate-400 rounded-xl"
        />
        <input
          required
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] placeholder:text-slate-400 rounded-xl"
        />
        <input
          required
          placeholder="Trường THPT *"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="w-full border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] placeholder:text-slate-400 rounded-xl"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#2563eb] via-[#1E8E3E] to-[#2B6CB0] text-white text-sm font-bold py-3 hover:shadow-lg transition-all rounded-xl mt-2"
        >
          Bắt đầu chat ngay ✨
        </button>
      </form>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ░░░  MAIN CHAT WIDGET  ░░░
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function ChatWidget() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  /* ---- State ---- */
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [persona, setPersona] = useState('student');
  const [userInfo, setUserInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  
  /* ---- External trigger to open chat ---- */
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chat', handleOpen);
    return () => window.removeEventListener('open-chat', handleOpen);
  }, []);


  /* ---- Scroll helpers ---- */
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  const handleBodyScroll = () => {
    if (!bodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120);
  };

  /* ---- Focus input after open ---- */
  useEffect(() => {
    if (isOpen && !showWelcome) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, showWelcome]);

  /* ---- Welcome form handler ---- */
  const handleWelcomeSubmit = (info) => {
    if (info) setUserInfo(info);
    setShowWelcome(false);
    // Insert greeting messages
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages(GREETINGS.map((text, i) => ({
      id: `greet-${i}`,
      role: 'assistant',
      content: text,
      time: now
    })));
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  /* ---- Send message ---- */
  const handleSend = async (customText = null) => {
    const text = typeof customText === 'string' ? customText : input.trim();
    if (!text || loading) return;

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), role: 'user', content: text, time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        message: text,
        sessionId: sessionId || undefined,
        context: {
          persona,
          user_info: userInfo || undefined
        }
      };

      const res = await sendMessage(payload);

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.reply || 'Không nhận được phản hồi.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        majorCard: res.majorCard || null,
        chart: res.chart || null,
        suggestions: res.suggestions || []
      };

      setMessages((prev) => [...prev, botMsg]);
      if (res.sessionId) setSessionId(res.sessionId);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Rất xin lỗi, hệ thống đang gặp sự cố. Bạn vui lòng thử lại sau nhé! 😓',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---- Toggle open / close ---- */
  const toggleOpen = () => {
    setIsOpen((v) => !v);
    if (isFullscreen) setIsFullscreen(false);
  };

    if (isAdminRoute) return null;

  /* ─── Sizing classes ─── */
  const panelCls = isFullscreen
    ? 'fixed inset-4 z-[60]'
    : 'fixed bottom-5 right-5 z-[60] w-[380px] h-[560px] sm:w-[400px] sm:h-[600px]';

  /* ━━━━━━━━━ RENDER ━━━━━━━━━ */
  return (
    <>
      {/* ─── Injection: keyframe animation ─── */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(241, 90, 36, 0.4); }
          50%      { box-shadow: 0 0 0 12px rgba(241, 90, 36, 0); }
        }
        .chat-markdown a { text-decoration: underline; }
        .chat-markdown ul { list-style: disc; padding-left: 1.2rem; }
        .chat-markdown ol { list-style: decimal; padding-left: 1.2rem; }
        .chat-markdown code { background: rgba(0,0,0,.06); padding: 1px 4px; font-size: 0.85em; }
        .chat-markdown pre { background: #1e293b; color: #e2e8f0; padding: 12px; overflow-x: auto; font-size: 0.8em; margin: 6px 0; }
        .chat-markdown pre code { background: none; padding: 0; color: inherit; }
        .chat-markdown p:last-child { margin-bottom: 0; }
      `}</style>

      {/* ═══════ FAB Button ═══════ */}
      {/* ═══════ FAB Button ═══════ */}
      <button
        onClick={toggleOpen}
        aria-label="Chat tư vấn"
        className={`
          fixed bottom-5 right-5 z-[61] w-14 h-14 flex items-center justify-center
          text-white transition-all duration-300 group rounded-full
          ${isOpen
            ? 'scale-0 opacity-0 pointer-events-none'
            : 'scale-100 opacity-100 bg-gradient-to-r from-orange-400 via-emerald-500 to-blue-500 shadow-lg shadow-orange-500/10'
          }
        `}
        style={!isOpen ? { animation: 'fabPulse 2.5s infinite' } : {}}
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {/* unread dot */}
        {messages.length === 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
        )}
      </button>

      {/* ═══════ Chat Panel ═══════ */}
      {isOpen && (
        <div
          className={`${panelCls} flex flex-col bg-white border border-slate-200 shadow-2xl overflow-hidden rounded-xl`}
          style={{ animation: 'chatSlideUp 0.3s ease-out' }}
        >
          {/* ──── HEADER ──── */}
          <div className="bg-gradient-to-r from-orange-400 via-emerald-500 to-blue-500 px-4 py-4 shrink-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-white flex items-center justify-center rounded-full p-1 shadow-inner overflow-hidden border border-white/20">
                  <img src={logoDue} alt="DUE Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white leading-none tracking-tight">Trợ Lý Tư Vấn Tuyển Sinh</h3>
                  <p className="text-[10px] font-bold text-white/90 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-pulse shadow-sm shadow-orange-200" />
                    Hỗ trợ 24/7 - Giải đáp mọi thắc mắc
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsFullscreen((v) => !v)}
                  className="text-white/70 hover:text-white p-1.5 transition-colors"
                  title={isFullscreen ? 'Thu nhỏ' : 'Mở rộng'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleOpen}
                  className="text-white/70 hover:text-white p-1.5 transition-colors"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Persona Switcher ── */}
            {!showWelcome && (
              <div className="flex items-center gap-2 mt-2.5">
                {[
                  { key: 'student', label: 'Học sinh', icon: GraduationCap },
                  { key: 'parent', label: 'Phụ huynh', icon: Users }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPersona(key)}
                    className={`
                      flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 transition-all
                      ${persona === key
                        ? 'bg-white text-[#2563eb] shadow-sm'
                        : 'bg-white/15 text-white/80 hover:bg-white/25'
                      }
                    `}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
                {userInfo?.name && (
                  <span className="ml-auto text-[10px] text-white/50 truncate max-w-[100px]">
                    👤 {userInfo.name}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ──── BODY ──── */}
          <div
            ref={bodyRef}
            onScroll={handleBodyScroll}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative"
            style={{ scrollBehavior: 'smooth' }}
          >
            {showWelcome ? (
              <WelcomeForm onSubmit={handleWelcomeSubmit} />
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <ChatBubble 
                    key={msg.id} 
                    msg={msg} 
                    isLatest={idx === messages.length - 1}
                    onSelectSuggestion={(text) => handleSend(text)}
                    loading={loading}
                  />
                ))}
                {loading && <TypingDots />}
                <div ref={scrollRef} />
              </>
            )}

            {/* Scroll-to-bottom */}
            {showScrollBtn && !showWelcome && (
              <button
                onClick={() => scrollToBottom(true)}
                className="sticky bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 via-emerald-500 to-blue-500 text-white w-8 h-8 flex items-center justify-center shadow-lg z-10 rounded-full hover:scale-110 transition-transform"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ──── FOOTER (Input) ──── */}
          {!showWelcome && (
            <div className="border-t border-slate-200 px-3 py-3 bg-white shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Bạn cần hỗ trợ gì?"
                  disabled={loading}
                  className="flex-1 resize-none border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] placeholder:text-slate-400 disabled:opacity-50 max-h-24 overflow-y-auto leading-snug rounded-xl"
                  style={{ minHeight: '40px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={`
                    w-10 h-10 flex items-center justify-center shrink-0 transition-all
                    ${input.trim() && !loading
                      ? 'bg-gradient-to-br from-orange-400 via-emerald-500 to-blue-500 text-white hover:shadow-md'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    } rounded-xl shadow-sm
                  `}
                  title="Gửi"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
            </div>
          )}
        </div>
      )}
    </>
  );
}
