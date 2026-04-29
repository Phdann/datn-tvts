import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, GraduationCap, Building2, Users, Settings,
  MessageSquare, BarChart3, Image, Calendar, ChevronDown, LogOut, Menu, X,
  Layers, BookOpen, Database, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo_DUE from '../assets/Logo_DUE.jpg';

export const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  {
    label: 'Đào tạo', icon: GraduationCap, children: [
      { label: 'Ngành đào tạo', to: '/admin/majors' },
      { label: 'Khoa', to: '/admin/faculties' },
      { label: 'Chuyên ngành', to: '/admin/specializations' },
      { label: 'Phương thức tuyển sinh', to: '/admin/admission-methods' },
      { label: 'Điểm chuẩn lịch sử', to: '/admin/historical-scores' },
      { label: 'Chỉ tiêu', to: '/admin/quotas' },
      { label: 'Loại hình đào tạo', to: '/admin/training-types' },
    ]
  },
  {
    label: 'Nội dung', icon: BookOpen, children: [
      { label: 'Bài viết', to: '/admin/news' },
      { label: 'Danh mục bài viết', to: '/admin/categories' },
      { label: 'Banner', to: '/admin/banners' },
      { label: 'Học bổng', to: '/admin/scholarships' },
      { label: 'Chính sách', to: '/admin/policies' },
    ]
  },
  { label: 'Chat AI', icon: MessageSquare, to: '/admin/chat-data' },
  { label: 'Phiên Chat', icon: MessageSquare, to: '/admin/chat-sessions' },
  { label: 'Người dùng', icon: Users, to: '/admin/users' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

 
  const isActive = (to) => {
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(to);
  };

 
  useEffect(() => {
    const newOpenMenus = { ...openMenus };
    let changed = false;
    
    navItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => isActive(child.to));
        if (hasActiveChild && !newOpenMenus[item.label]) {
          newOpenMenus[item.label] = true;
          changed = true;
        }
      }
    });

    if (changed) {
      setOpenMenus(newOpenMenus);
    }
  }, [location.pathname]);

  const toggleMenu = (label) => setOpenMenus((p) => ({ ...p, [label]: !p[label] }));
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const linkCls = (to) =>
    `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-2.5 text-sm transition-all duration-300 ${
      isActive(to) ? 'bg-[#2563eb] text-white font-semibold border-r-4 border-blue-300' : 'text-slate-300 hover:text-white hover:bg-white/5'
    } ${isCollapsed ? 'px-0' : ''}`;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
    
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64 bg-blue-950 text-white flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-5 py-5 border-b border-white/10 overflow-hidden`}>
          {!isCollapsed ? (
            <Link to="/admin" className="text-xl font-black tracking-tight text-white flex items-center gap-2 whitespace-nowrap">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                <img src={Logo_DUE} alt="DUE Logo" className="w-full h-full object-contain p-0.5" />
              </div>
              DUE Admin
            </Link>
          ) : (
            <Link to="/admin" className="shrink-0">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-white/10 shadow-lg">
                <img src={Logo_DUE} alt="DUE Logo" className="w-full h-full object-contain p-0.5" />
              </div>
            </Link>
          )}
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>

       

        <nav className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            if (item.children) {
              const isOpen = openMenus[item.label];
              const childActive = item.children.some((c) => isActive(c.to));
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-2.5 text-sm transition-all ${
                      childActive ? 'text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </span>
                    {!isCollapsed && <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                  </button>
                 
                  {!isCollapsed && (
                    <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="ml-5 mt-1 mb-1 border-l border-white/10 space-y-0.5">
                          {item.children.map((child) => (
                            <Link key={child.to} to={child.to} className={linkCls(child.to)} onClick={() => setSidebarOpen(false)}>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link key={item.to} to={item.to} className={linkCls(item.to)} onClick={() => setSidebarOpen(false)} title={isCollapsed ? item.label : ''}>
                <item.icon className="w-4 h-4" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-2.5 text-sm transition-all text-slate-300 hover:text-white hover:bg-white/5 mt-1 border-t border-white/5 pt-3`}
            title={isCollapsed ? 'Trang chủ' : ''}
          >
            <ExternalLink className="w-4 h-4" />
            {!isCollapsed && <span>Trang chủ</span>}
          </a>
        </nav>

        <div className={`border-t border-white/10 ${isCollapsed ? 'px-2' : 'px-5'} py-4 bg-blue-950/30`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center border border-blue-800 shrink-0">
              <Users className="w-4 h-4 text-blue-200" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name || 'Quản trị viên'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@due.udn.vn'}</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="flex-shrink-0 sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between lg:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-1.5 -ml-1.5 text-slate-600 hover:bg-slate-100 rounded-xl" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <button 
              className="hidden lg:flex p-1.5 -ml-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" 
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-slate-800 hidden sm:block tracking-tight">Hệ thống Quản lý Tuyển sinh DUE</h2>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
