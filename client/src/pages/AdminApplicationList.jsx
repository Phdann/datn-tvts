import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Eye, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

const AdminApplicationList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.get('/admin/applications').then(res => {
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setApplications(data);
            setLoading(false);
        }).catch(error => console.error(error));
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/admin/applications/${id}/status`, { status });
            setApplications(applications.map(app => app.id === id ? { ...app, status } : app));
        } catch {
            alert('Lỗi khi cập nhật trạng thái');
        }
    };

    const filtered = Array.isArray(applications) ? applications.filter(app => 
        app.Candidate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.Major?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Chờ duyệt</span>;
            case 'Approved': return <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Đã duyệt</span>;
            case 'Rejected': return <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Từ chối</span>;
            case 'SupplementNeeded': return <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Cần bổ sung</span>;
            default: return <span>{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                    <span>Danh sách hồ sơ xét tuyển</span>
                </h2>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên, ngành..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Thí sinh</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Ngành đăng ký</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Điểm số</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-10 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
                        ) : filtered.map(app => (
                            <tr key={app.id} className="hover:bg-slate-50/50 transition">
                                <td className="p-4">
                                    <div>
                                        <p className="font-bold text-slate-900">{app.Candidate?.name}</p>
                                        <p className="text-slate-500 text-xs">{app.Candidate?.email}</p>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <p className="text-sm font-medium">{app.Major?.name}</p>
                                    <p className="text-slate-400 text-[10px]">{app.AdmissionMethod?.name}</p>
                                </td>
                                <td className="p-4 text-center font-mono font-bold text-primary">
                                    {app.Candidate?.high_school_score}
                                </td>
                                <td className="p-4 text-center">
                                    {getStatusBadge(app.status)}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button 
                                            onClick={() => updateStatus(app.id, 'Approved')}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" 
                                            title="Duyệt hồ sơ"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(app.id, 'Rejected')}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
                                            title="Từ chối"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(app.id, 'SupplementNeeded')}
                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" 
                                            title="Yêu cầu bổ sung"
                                        >
                                            <AlertCircle className="w-5 h-5" />
                                        </button>
                                        <a 
                                            href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${app.ApplicationDocuments?.[0]?.file_url || ''}`}
 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition"
                                            title="Xem hồ sơ"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminApplicationList;
