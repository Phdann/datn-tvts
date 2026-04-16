import { useState } from 'react';
import { X, Plus, User, Users as UsersIcon, MessageCircle, Trash2 } from 'lucide-react';

function ChatSidebar({ sessions, currentSession, onNewChat, onSelectSession, onDeleteSession, persona, setPersona, isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-80 bg-white border-r-4 border-gray-100
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 border-b-4 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-950 flex items-center space-x-3 uppercase tracking-tighter">
              <MessageCircle className="h-6 w-6 text-primary" />
              <span>AI Tư vấn</span>
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Chế độ quản lý
            </label>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setPersona('student')}
                className={`w-full px-4 py-3 border-2 font-bold text-sm transition-colors text-left flex items-center justify-between ${
                  persona === 'student'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                }`}
              >
                <span>Học sinh</span>
                <User className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPersona('parent')}
                className={`w-full px-4 py-3 border-2 font-bold text-sm transition-colors text-left flex items-center justify-between ${
                  persona === 'parent'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                }`}
              >
                <span>Phụ huynh</span>
                <UsersIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary text-white hover:bg-primary-dark transition-colors font-bold uppercase tracking-widest border-2 border-primary"
          >
            <Plus className="h-5 w-5" />
            <span>Trò chuyện mới</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Lịch sử tư vấn
          </h3>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Trống
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`
                    group relative p-4 border-2 cursor-pointer transition-colors
                    ${currentSession?.id === session.id
                      ? 'bg-primary-dark text-white border-primary-dark'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                    }
                  `}
                  onClick={() => onSelectSession(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${currentSession?.id === session.id ? 'text-white' : 'text-gray-900'}`}>
                        {session.title || 'Cuộc trò chuyện'}
                      </p>
                      <p className={`text-xs mt-1 font-medium ${currentSession?.id === session.id ? 'text-blue-200' : 'text-gray-500'}`}>
                        {session.messageCount || 0} tin nhắn
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className={`p-1 transition-colors ${
                        currentSession?.id === session.id 
                          ? 'hover:bg-white/20 text-white' 
                          : 'opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-600'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 border-t-4 border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>DUE AI Assistant</span>
            <span>v2.0</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatSidebar;
