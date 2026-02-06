import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, Settings, LogOut, Users, ChevronRight, BookOpen, Bot } from 'lucide-react';
import { useEffect } from 'react';

const AdminLayout = () => {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/admin/login');
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) return <div className="p-20 text-center">Đang xác thực...</div>;
    if (!isAuthenticated) return null;

    const menuItems = [
        { icon: LayoutDashboard, text: 'Tổng quan', path: '/admin', category: 'main' },
        { icon: FileText, text: 'Quản lý hồ sơ', path: '/admin/applications', category: 'main' },
        { icon: BookOpen, text: 'Quản lý ngành', path: '/admin/majors', category: 'training' },
        { icon: BookOpen, text: 'Chuyên ngành', path: '/admin/specializations', category: 'training' },
        { icon: BookOpen, text: 'Khoa', path: '/admin/faculties', category: 'training' },
        { icon: FileText, text: 'Tin tức', path: '/admin/news', category: 'cms' },
        { icon: FileText, text: 'Sự kiện', path: '/admin/events', category: 'cms' },
        { icon: FileText, text: 'Banner', path: '/admin/banners', category: 'cms' },
        { icon: Bot, text: 'Dữ liệu Chatbot', path: '/admin/chat-data', category: 'system' },
        { icon: Users, text: 'Người dùng', path: '/admin/users', category: 'system' },
        { icon: Settings, text: 'Cài đặt', path: '/admin/settings', category: 'system' },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10 transition-all">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg"></div>
                        <span>Admin Panel</span>
                    </h2>
                </div>
                
                <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item, idx) => (
                        <Link 
                            key={idx} 
                            to={item.path} 
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition group"
                        >
                            <div className="flex items-center space-x-3">
                                <item.icon className="w-5 h-5 text-slate-400 group-hover:text-primary transition" />
                                <span className="font-medium">{item.text}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 p-3 mb-4 rounded-xl bg-slate-800/50">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                            {user.name?.[0].toUpperCase()}
                        </div>
                        <div className="truncate text-sm">
                            <p className="font-bold">{user.name}</p>
                            <p className="text-slate-500 text-xs">Administrator</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-bold">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            <main className="ml-64 flex-grow p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">UniAdvice Dashboard</h1>
                    <div className="text-sm text-slate-500">{new Date().toLocaleDateString('vi-VN')}</div>
                </header>
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
