import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell, PieChart, Pie
} from 'recharts';
import { 
  MessageSquare, Users, GraduationCap, School, TrendingUp, 
  Clock, AlertCircle, Search, HelpCircle 
} from 'lucide-react';
import { statisticsService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#2563eb', '#2B6CB0', '#1E8E3E', '#FBBF24', '#8B5CF6', '#EC4899', '#06B6D4'];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export default function AdminChatStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await statisticsService.getChatbotStats();
        setStats(data);
      } catch (err) {
        setError('Không thể tải dữ liệu thống kê chatbot.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <LoadingSpinner />
      <p className="text-sm font-medium text-slate-400">Đang phân tích dữ liệu chatbot...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 p-10 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-red-800">{error}</h3>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );

  const usageData = stats.usage.map(item => ({
    name: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    sessions: item.count
  })).sort((a,b) => a.name.localeCompare(b.name));

  const schoolData = stats.schools.map((item, index) => ({
    name: item.visitor_school,
    value: parseInt(item.count)
  }));

  const majorData = stats.majors.map((item, index) => ({
    name: item.major_name,
    value: parseInt(item.count)
  }));

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Thống kê Chatbot AI</h1>
          <p className="text-sm text-slate-500 font-medium font-inter">Phân tích hành vi và sự quan tâm của thí sinh thông qua chatbot.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={MessageSquare} 
          label="Tổng số phiên chat" 
          value={stats.usage.reduce((acc, curr) => acc + parseInt(curr.count), 0)} 
          color="bg-orange-50 text-orange-600"
        />
        <StatCard 
          icon={Users} 
          label="Tổng người dùng" 
          value={stats.schools.reduce((acc, curr) => acc + parseInt(curr.count), 0)} 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          icon={School} 
          label="Trường THPT" 
          value={stats.schools.length} 
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          icon={GraduationCap} 
          label="Ngành học được hỏi" 
          value={stats.majors.length} 
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Usage Trend */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-orange-500" /> Xu hướng sử dụng theo ngày
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip 
                  labelFormatter={(name) => `Ngày: ${name}`}
                  formatter={(value) => [value, 'Số phiên']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line name="Số phiên" type="monotone" dataKey="sessions" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High School Interest */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <School className="w-4 h-4 text-blue-500" /> Top trường THPT quan tâm nhất
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={150} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value) => [value, 'Số người dùng']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#2B6CB0" radius={[0, 4, 4, 0]} barSize={20}>
                  {schoolData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Major Interest */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-emerald-500" /> Ngành học được hỏi nhiều nhất
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={majorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {majorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [value, 'Số câu hỏi']} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Questions */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-purple-500" /> Các thắc mắc phổ biến
          </h2>
          <div className="space-y-3">
            {stats.questions.map((q, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 group hover:border-purple-200 transition-all rounded-xl">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">{q.content}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{q.count} lượt hỏi</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 opacity-20 group-hover:opacity-100" />
              </div>
            ))}
            {stats.questions.length === 0 && (
              <p className="text-center py-10 text-xs text-slate-400 font-medium">Chưa có dữ liệu câu hỏi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
