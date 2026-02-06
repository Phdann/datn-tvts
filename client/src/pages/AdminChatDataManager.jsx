import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Database, Search, Plus, Edit, Trash2, Eye, 
    Filter, MoreHorizontal, FileText 
} from 'lucide-react';
import api from '../services/api';
import { LoadingSpinner, Badge} from '../components/common';

function AdminChatDataManager() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/chat-data'); 
            setData(res.data || []);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/admin/chat-data/${deleteId}`);
            setData(data.filter(item => item.id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error("Lỗi xóa dữ liệu:", error);
            alert("Không thể xóa dữ liệu này.");
        }
    };

    const filteredData = data.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.keywords?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.content_type === filterType;
        return matchesSearch && matchesType;
    });

    const getContentTypeBadge = (type) => {
        const styles = {
            quy_che: 'bg-blue-100 text-blue-800',
            hoc_phi: 'bg-green-100 text-green-800',
            diem_chuan: 'bg-purple-100 text-purple-800',
            default: 'bg-gray-100 text-gray-800'
        };
        return styles[type] || styles.default;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
         
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Database className="w-8 h-8 mr-3 text-primary" />
                        Kho Dữ liệu Chatbot
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý toàn bộ kiến thức đã nạp cho AI</p>
                </div>
                <Link 
                    to="/admin/chat-data/new" 
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" /> Thêm dữ liệu mới
                </Link>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tiêu đề, từ khóa..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select 
                        className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary bg-white"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Tất cả loại tin</option>
                        <option value="quy_che">Quy chế</option>
                        <option value="hoc_phi">Học phí</option>
                        <option value="diem_chuan">Điểm chuẩn</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <LoadingSpinner size="lg" />
                        <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <FileText className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Chưa có dữ liệu nào</h3>
                        <p className="text-gray-500 mb-4">Hãy bắt đầu nạp kiến thức cho Chatbot ngay.</p>
                        <Link to="/admin/chat-data/new" className="text-primary font-medium hover:underline">
                            + Thêm dữ liệu đầu tiên
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề / Nguồn</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại & Năm</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngành học</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 line-clamp-1" title={item.title}>
                                                {item.title}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 truncate max-w-xs" title={item.source}>
                                                Nguồn: {item.source || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium w-fit ${getContentTypeBadge(item.content_type)}`}>
                                                    {item.content_type}
                                                </span>
                                                <span className="text-xs text-gray-500">Năm: {item.admission_year}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.major || <span className="text-gray-400 italic">Chung</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {item.status === 'active' ? '● Active' : '○ Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    to={`/admin/chat-data/edit/${item.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button 
                                                    onClick={() => setDeleteId(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {deleteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Hành động này sẽ xóa dữ liệu khỏi cả Database và bộ nhớ AI (Vector DB). Không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm"
                            >
                                Xóa vĩnh viễn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminChatDataManager;