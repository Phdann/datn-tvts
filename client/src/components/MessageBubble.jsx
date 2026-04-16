import { Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function MessageBubble({ message, isUser }) {
  if (isUser) {
    return (
      <div className="flex justify-end mb-8">
        <div className="flex items-start space-x-4 max-w-3xl">
          <div className="bg-primary text-white border-2 border-primary px-6 py-4">
            <p className="text-base leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
          </div>
          <div className="flex-shrink-0 w-12 h-12 bg-primary border-2 border-primary flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-8">
      <div className="flex items-start space-x-4 max-w-4xl">
        <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-300 flex items-center justify-center">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div className="bg-white border-2 border-gray-200 px-6 py-4 flex-1">
          {message.isLoading ? (
            <div className="flex items-center space-x-3 py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-base font-bold text-gray-600 uppercase tracking-wider">Đang xử lý...</span>
            </div>
          ) : (
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-base leading-relaxed text-gray-800 mb-4 font-medium">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold text-gray-950 border-b-2 border-yellow-400">{children}</strong>,
                  ul: ({ children }) => <ul className="list-square list-inside space-y-2 my-4 pl-4 border-l-4 border-gray-100">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 my-4 pl-4 border-l-4 border-gray-100">{children}</ol>,
                  li: ({ children }) => <li className="text-base text-gray-800">{children}</li>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 border-2 border-gray-200">
                      <table className="min-w-full divide-y-2 divide-gray-200">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-widest bg-gray-100">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => <td className="px-4 py-3 text-sm text-gray-700 border-t-2 border-gray-50">{children}</td>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Rich Content - Major Card - FLAT REDESIGN */}
          {message.majorCard && (
            <div className="mt-6 bg-white border-4 border-primary">
              <div className="bg-primary p-4 border-b-4 border-primary-dark">
                <span className="inline-block bg-white text-primary px-3 py-1 text-xs font-bold mb-2 uppercase tracking-tighter">
                  Mã ngành: {message.majorCard.code}
                </span>
                <h4 className="text-xl font-bold text-white uppercase">{message.majorCard.name}</h4>
                {message.majorCard.faculty && (
                  <p className="text-sm text-blue-100 mt-1 font-bold">{message.majorCard.faculty}</p>
                )}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Học phí/năm</p>
                    <p className="text-xl font-black text-primary">
                      {new Intl.NumberFormat('vi-VN').format(message.majorCard.tuition)} đ
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Chỉ tiêu</p>
                    <p className="text-xl font-black text-green-600">{message.majorCard.quota} SV</p>
                  </div>
                </div>
                <a
                  href={`/nganh-dao-tao/${message.majorCard.id}`}
                  className="block w-full text-center px-6 py-4 bg-primary text-white hover:bg-primary-dark transition-colors text-base font-black uppercase tracking-widest border-2 border-primary"
                >
                  Xem chi tiết ngành học
                </a>
              </div>
            </div>
          )}

          {/* Rich Content - Chart - FLAT REDESIGN */}
          {message.chart && (
            <div className="mt-6 bg-white border-2 border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider border-b-2 border-gray-100 pb-2">{message.chart.title}</h4>
              <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200 font-bold uppercase tracking-widest">
                Biểu đồ thống kê
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
