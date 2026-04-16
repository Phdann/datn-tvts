import { useState, useEffect } from 'react';
import { 
  FileText, Users, GraduationCap, BarChart3, TrendingUp, 
  Clock, Activity, CheckCircle2, AlertCircle, ChevronRight,
  UserCheck, ShieldCheck, Database, Zap, MessageSquare,
  School, HelpCircle, ExternalLink, Download, FileSpreadsheet, FileDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell, PieChart, Pie
} from 'recharts';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { statisticsService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#2563eb', '#2B6CB0', '#1E8E3E', '#FBBF24', '#8B5CF6', '#EC4899', '#06B6D4'];

const StatCard = ({ icon: Icon, label, value, subValue, color, loading }) => (
  <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm relative overflow-hidden group transition-all">
    <div className="flex items-center justify-between mb-3 relative z-10">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
      <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${color} transition-transform group-hover:scale-110`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-3xl font-black text-slate-900 tracking-tight">{loading ? '...' : value}</p>
      {subValue && (
        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
          <Activity className="w-3 h-3 text-emerald-500" /> {subValue}
        </p>
      )}
    </div>
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] ${color.split(' ')[1]}`} />
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState({ dashboard: null, majors: [], chatStats: null });
  const [loading, setLoading] = useState(true);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // 1. Overview Sheet
      const overviewData = [
        ['TIÊU CHÍ', 'GIÁ TRỊ', 'MÔ TẢ'],
        ['Ngành đào tạo', data.dashboard?.counts?.majors || 0, 'Số lượng ngành học hiện có'],
        ['Quản trị viên', data.dashboard?.counts?.users || 0, 'Số tài khoản quản trị'],
        ['Phiên Chat AI', data.dashboard?.counts?.chat_sessions || 0, 'Tổng số phiên tư vấn'],
        ['Trường THPT', data.chatStats?.schools.length || 0, 'Số trường THPT có học sinh quan tâm'],
        ['Thời gian uptime', `${Math.floor(data.dashboard?.system_health?.uptime / 3600)}h ${Math.floor((data.dashboard?.system_health?.uptime % 3600) / 60)}m`, 'Thời gian hệ thống hoạt động']
      ];
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, wsOverview, 'Tổng quan');

      // 2. Chat Trends
      const trendData = [['Ngày', 'Số phiên chat']];
      data.chatStats?.usage.forEach(item => {
        trendData.push([new Date(item.date).toLocaleDateString('vi-VN'), item.count]);
      });
      const wsTrends = XLSX.utils.aoa_to_sheet(trendData);
      XLSX.utils.book_append_sheet(wb, wsTrends, 'Xu hướng Chat');

      // 3. Major Interests
      const majorInterestData = [['Ngành học', 'Số lượt quan tâm']];
      data.chatStats?.majors.forEach(item => {
        majorInterestData.push([item.major_name, item.count]);
      });
      const wsMajors = XLSX.utils.aoa_to_sheet(majorInterestData);
      XLSX.utils.book_append_sheet(wb, wsMajors, 'Quan tâm ngành học');

      // 4. Schools
      const schoolData = [['Trường THPT', 'Số lượng học sinh']];
      data.chatStats?.schools.forEach(item => {
        schoolData.push([item.visitor_school, item.count]);
      });
      const wsSchools = XLSX.utils.aoa_to_sheet(schoolData);
      XLSX.utils.book_append_sheet(wb, wsSchools, 'Nguồn trường THPT');

      // 5. Top Questions
      const questionsData = [['Câu hỏi/Thắc mắc', 'Số lượt hỏi']];
      data.chatStats?.questions.forEach(item => {
        questionsData.push([item.content, item.count]);
      });
      const wsQuestions = XLSX.utils.aoa_to_sheet(questionsData);
      XLSX.utils.book_append_sheet(wb, wsQuestions, 'Câu hỏi phổ biến');

      XLSX.writeFile(wb, `Bao_cao_tuyen_sinh_${new Date().toISOString().split('T')[0]}.xlsx`);
      setShowExportOptions(false);
    } catch (error) {
      console.error('Export Excel error:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await statisticsService.exportDashboardPDF();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao_cao_tuyen_sinh_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setShowExportOptions(false);
    } catch (error) {
      console.error('Export PDF error:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dash, majors, chatStats] = await Promise.all([
          statisticsService.getDashboardStats(),
          statisticsService.getMajorStats(),
          statisticsService.getChatbotStats()
        ]);
        setData({ dashboard: dash, majors: majors || [], chatStats: chatStats });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <LoadingSpinner />
      <p className="text-sm font-medium text-slate-400 animate-pulse">Đang tải dữ liệu thực tế...</p>
    </div>
  );

  const dashCount = data.dashboard?.counts || {};
  const health = data.dashboard?.system_health || {};

  const cards = [
    { 
      icon: GraduationCap, 
      label: 'Ngành đào tạo', 
      value: dashCount.majors ?? 0, 
      subValue: 'Chương trình đại học',
      color: 'text-violet-600 bg-violet-50 border-violet-100'
    },
    { 
      icon: Users, 
      label: 'Quản trị viên', 
      value: dashCount.users ?? 0, 
      subValue: 'Tài khoản hệ thống',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    { 
      icon: MessageSquare, 
      label: 'Phiên Chat AI', 
      value: dashCount.chat_sessions ?? 0, 
      subValue: 'Lượt tương tác với bot',
      color: 'text-orange-600 bg-orange-50 border-orange-100'
    },
    { 
      icon: School, 
      label: 'Trường THPT', 
      value: data.chatStats?.schools.length ?? 0, 
      subValue: 'Số trường tham gia tư vấn',
      color: 'text-blue-600 bg-blue-50 border-blue-100'
    },
  ];

  const majorData = data.chatStats?.majors.map((item) => ({
    name: item.major_name,
    value: parseInt(item.count)
  })) || [];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-500 font-medium">Chào mừng trở lại, đây là báo cáo phân tích mới nhất.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest"
            >
              <Download className="w-4 h-4" /> Xuất báo cáo
            </button>
            
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-slideUp">
                <button 
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800">Tải Excel</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">.xlsx format</span>
                  </div>
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  <FileDown className="w-4 h-4 text-rose-500" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800">Tải PDF</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Standard PDF</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-slate-700">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => <StatCard key={i} {...c} loading={loading} />)}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
          {/* Recent Messages */}
          <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-primary" /> Tin nhắn gần nhất
              </h2>
              <Link to="/admin/chat-sessions" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                Tất cả phiên chat
              </Link>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {data.chatStats?.recent_messages?.map((m) => (
                <div key={m.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl group hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">
                        {m.ChatSession?.User?.email || m.ChatSession?.visitor_phone || m.ChatSession?.visitor_name || `Khách (ID: ${m.session_id})`}
                      </span>
                    </div>
                    <Link 
                      to={`/admin/chat-sessions/${m.session_id}`}
                      className="p-1 px-2 border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 hover:text-primary hover:border-primary/50 transition-all flex items-center gap-1 uppercase"
                    >
                      Chi tiết <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-3">
                    "{m.content}"
                  </p>
                  <div className="mt-2 flex items-center justify-end">
                    <span className="text-[9px] font-bold text-slate-400">
                      {new Date(m.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}
              {(!data.chatStats?.recent_messages || data.chatStats.recent_messages.length === 0) && (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                   <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                   <p className="text-xs text-slate-400 font-medium">Chưa có tin nhắn nào.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Top Questions */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <h2 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-purple-500" /> Thắc mắc phổ biến
              </h2>
              <div className="space-y-2.5">
                {data.chatStats?.questions?.slice(0, 5).map((q, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg group hover:border-purple-200 transition-all">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-purple-600 transition-colors">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{q.content}</p>
                      <p className="text-[10px] text-slate-400">{q.count} lượt hỏi</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-900 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-5 flex items-center gap-2 relative z-10">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Trạng thái AI
              </h2>
              <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-white/40">DATABASE</p>
                  <p className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> Ổn định
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-white/40">GEMINI PRO</p>
                  <p className="text-xs font-black text-blue-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Sẵn sàng
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-white/40">UPTIME</p>
                  <p className="text-xs font-black text-slate-100">
                    {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2.5 relative z-10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-white/60 tracking-widest uppercase">Giám sát trực tiếp</span>
              </div>
            </div>
          </div>
      </div>

      {/* Analytics Visualization Group */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Usage Trend */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-orange-500" /> Xu hướng trò chuyện
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chatStats?.usage.map(item => ({
                name: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                sessions: item.count
              })).sort((a,b) => a.name.localeCompare(b.name))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip 
                  labelFormatter={(name) => `Ngày: ${name}`}
                  formatter={(value) => [value, 'Số phiên']}
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line name="Số phiên" type="monotone" dataKey="sessions" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interests Visualization Container */}
        <div className="grid sm:grid-cols-2 gap-6">
           {/* High School Interests */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <School className="w-4 h-4 text-blue-500" /> Nguồn quan tâm
            </h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chatStats?.schools.slice(0, 5).map(item => ({ name: item.visitor_school, value: parseInt(item.count) }))} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="#2B6CB0" radius={[0, 4, 4, 0]} barSize={15}>
                    {data.chatStats?.schools.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Major Interest - Consistently integrated from ChatStats */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-emerald-500" /> Ngành học HOT
            </h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={majorData.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {majorData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 9, fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
