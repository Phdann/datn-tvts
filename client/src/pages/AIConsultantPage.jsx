import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, X, UserCircle, Phone } from 'lucide-react';
import { chatService } from '../services';
import { LoadingSpinner, Badge, PrimaryButton } from '../components/common';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function AIConsultantPage() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [persona, setPersona] = useState('student');
  const [userInfo, setUserInfo] = useState(null); 
  const [showInfoForm, setShowInfoForm] = useState(true); 
  const [tempInfo, setTempInfo] = useState({ name: '', phone: '' });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: persona === 'student' 
          ? '👋 Chào bạn! Mình là AI tư vấn tuyển sinh. Bạn muốn hỏi gì về trường và ngành học nào?'
          : 'Xin chào Quý phụ huynh! Tôi là trợ lý AI tư vấn tuyển sinh. Tôi có thể giúp Quý vị tìm hiểu về chương trình đào tạo, học phí và cơ hội nghề nghiệp.',
        timestamp: new Date()
      }
    ]);
  }, [persona]);

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (tempInfo.name && tempInfo.phone) {
      setUserInfo(tempInfo);
      setShowInfoForm(false);
      
      setMessages([
        {
          id: 1,
          role: 'assistant',
          content: persona === 'student' 
            ? `👋 Chào ${tempInfo.name}! Mình là AI tư vấn tuyển sinh. Bạn muốn hỏi gì về trường và ngành học nào?`
            : `Xin chào Quý phụ huynh ${tempInfo.name}! Tôi là trợ lý AI. Tôi có thể giúp gì cho Quý vị?`,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage({
        message: inputMessage,
        sessionId,
        context: { persona,
          user_info: userInfo
         }
      });

      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
      }

      const botMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: response.reply,
        majorCard: response.majorCard,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = persona === 'student' ? [
    'Ngành CNTT học những gì?',
    'Điểm chuẩn năm ngoái?',
    'Học phí bao nhiêu?',
    'Cơ hội việc làm ra sao?'
  ] : [
    'Chất lượng đào tạo như thế nào?',
    'Học phí và học bổng?',
    'Tỷ lệ có việc làm sau tốt nghiệp?',
    'Cơ sở vật chất và ký túc xá?'
  ];

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {showInfoForm && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border-t-4 border-primary animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Tư vấn tuyển sinh DUE</h2>
              <p className="text-gray-500 mt-2">Vui lòng cung cấp thông tin để chúng tôi hỗ trợ bạn tốt nhất.</p>
            </div>

            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="Nguyễn Văn A"
                    value={tempInfo.name}
                    onChange={(e) => setTempInfo({...tempInfo, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="0905xxxxxx"
                    value={tempInfo.phone}
                    onChange={(e) => setTempInfo({...tempInfo, phone: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-primary/30 mt-2"
              >
                Bắt đầu trò chuyện
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="bg-primary text-white p-6 border-b-4 border-primary-dark">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 border-2 border-white">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Tư vấn tuyển sinh</h1>
                <p className="text-blue-100">Trợ lý thông minh 24/7</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-100">Chế độ:</span>
              <button
                onClick={() => setPersona('student')}
                className={`px-4 py-2 border-2 font-semibold transition-colors ${
                  persona === 'student'
                    ? 'bg-white text-primary border-white'
                    : 'bg-transparent text-white border-white hover:bg-white hover:text-primary'
                }`}
              >
                Học sinh
              </button>
              <button
                onClick={() => setPersona('parent')}
                className={`px-4 py-2 border-2 font-semibold transition-colors ${
                  persona === 'parent'
                    ? 'bg-white text-primary border-white'
                    : 'bg-transparent text-white border-white hover:bg-white hover:text-primary'
                }`}
              >
                Phụ huynh
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border-b-2 border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Câu hỏi gợi ý:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInputMessage(q)}
                className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-primary transition-colors text-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar - FLAT */}
                  <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 ${
                    msg.role === 'user' 
                      ? 'bg-primary border-primary' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className={`px-6 py-4 border-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-900 border-gray-300'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              strong: ({node, ...props}) => <span className="font-bold text-primary-dark" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="pl-1" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                              a: ({node, ...props}) => <a className="text-blue-600 hover:underline font-medium" target="_blank" {...props} />,
                              h1: ({node, ...props}) => <h1 className="text-lg font-bold text-primary mb-2 mt-4" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-base font-bold text-gray-800 mb-2 mt-3" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-sm font-bold text-gray-700 mb-1 mt-2" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {msg.majorCard && (
                      <div className="mt-3 bg-white border-2 border-gray-300 p-4">
                        <Badge variant="primary" size="sm" className="mb-2">
                          {msg.majorCard.code}
                        </Badge>
                        <h3 className="font-bold text-gray-900 mb-2">{msg.majorCard.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Học phí: <span className="font-semibold text-primary">
                            {new Intl.NumberFormat('vi-VN').format(msg.majorCard.tuition)} đ/năm
                          </span></p>
                          <p>Chỉ tiêu: <span className="font-semibold">{msg.majorCard.quota} SV</span></p>
                          {msg.majorCard.faculty && (
                            <p>Khoa: <span className="font-semibold">{msg.majorCard.faculty}</span></p>
                          )}
                        </div>
                        <a
                          href={`/nganh-dao-tao/${msg.majorCard.id}`}
                          className="inline-block mt-3 px-4 py-2 bg-primary text-white border-2 border-primary hover:bg-primary-dark transition-colors text-sm font-semibold"
                        >
                          Xem chi tiết →
                        </a>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="px-6 py-4 bg-white border-2 border-gray-300">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="bg-white border-t-4 border-gray-300 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={persona === 'student' ? 'Nhập câu hỏi của bạn...' : 'Nhập câu hỏi của Quý vị...'}
              className="flex-1 px-6 py-4 border-2 border-gray-300 focus:outline-none focus:border-primary disabled:bg-gray-100 text-base"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              className="px-8 py-4 bg-primary text-white border-2 border-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              disabled={isTyping || !inputMessage.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIConsultantPage;
