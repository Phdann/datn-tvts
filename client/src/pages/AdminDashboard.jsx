import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, BookOpen, Clock, CheckCircle, Plus, Settings, TrendingUp } from 'lucide-react';
import statisticsService from '../services/statisticsService';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            const data = await statisticsService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Pending': 'bg-amber-100 text-amber-600',
            'Approved': 'bg-green-100 text-green-600',
            'Rejected': 'bg-red-100 text-red-600',
            'Under Review': 'bg-blue-100 text-blue-600'
        };
        return colors[status] || 'bg-gray-100 text-gray-600';
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-gray-200 rounded-2xl animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-6"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map(j => (
                                    <div key={j} className="h-16 bg-gray-100 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const statCards = [
        { 
            label: 'Tổng hồ sơ', 
            value: stats?.counts?.applications || 0, 
            icon: FileText, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
        },
        { 
            label: 'Người dùng', 
            value: stats?.counts?.users || 0, 
            icon: Users, 
            color: 'text-purple-600', 
            bg: 'bg-purple-50' 
        },
        { 
            label: 'Ngành học', 
            value: stats?.counts?.majors || 0, 
            icon: BookOpen, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50' 
        },
        { 
            label: 'Chờ duyệt', 
            value: stats?.counts?.pending_applications || 0, 
            icon: Clock, 
            color: 'text-rose-600', 
            bg: 'bg-rose-50' 
        },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:border-primary/30 transition">
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Truy cập nhanh
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link 
                        to="/admin/applications?status=Pending"
                        className="p-6 border-2 border-slate-200 rounded-2xl hover:border-primary hover:bg-blue-50 transition group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">Duyệt hồ sơ chờ</p>
                                <p className="text-xs text-slate-500">{stats?.counts?.pending_applications || 0} hồ sơ</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/admin/news"
                        className="p-6 border-2 border-slate-200 rounded-2xl hover:border-primary hover:bg-blue-50 transition group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">Thêm tin tức mới</p>
                                <p className="text-xs text-slate-500">Quản lý nội dung</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/admin/settings"
                        className="p-6 border-2 border-slate-200 rounded-2xl hover:border-primary hover:bg-blue-50 transition group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">Cấu hình hệ thống</p>
                                <p className="text-xs text-slate-500">Chatbot & Settings</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Applications & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Applications */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Hồ sơ gần đây</h3>
                    <div className="space-y-4">
                        {stats?.recent_applications && stats.recent_applications.length > 0 ? (
                            stats.recent_applications.map(app => (
                                <Link
                                    key={app.id}
                                    to={`/admin/applications/${app.id}`}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">
                                            #{app.id}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{app.candidate_name}</p>
                                            <p className="text-slate-500 text-xs">{app.major_name}</p>
                                        </div>
                                    </div>
                                    <span className={`${getStatusBadge(app.status)} text-[10px] font-bold px-2 py-1 rounded-full uppercase`}>
                                        {app.status}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 py-8 italic">Chưa có hồ sơ nào</p>
                        )}
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Hoạt động hệ thống</h3>
                    <div className="space-y-6">
                        <div className="flex space-x-4">
                            <div className="w-1 bg-primary rounded-full"></div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">
                                    Gemini AI: {stats?.system_health?.gemini_status === 'connected' ? '✅ Hoạt động' : '❌ Offline'}
                                </p>
                                <p className="text-slate-500 text-xs">
                                    {stats?.system_health?.requests_today || 0} requests hôm nay
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <div className="w-1 bg-green-500 rounded-full"></div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">
                                    Database: {stats?.system_health?.database_status === 'healthy' ? '✅ Kết nối tốt' : '⚠️ Lỗi'}
                                </p>
                                <p className="text-slate-500 text-xs">
                                    Uptime: {Math.floor((stats?.system_health?.uptime || 0) / 60)} phút
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
