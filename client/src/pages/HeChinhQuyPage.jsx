import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Award, Users, Building2, CheckCircle,
  ChevronRight, ArrowRight, Clock, BarChart3, TrendingUp, Briefcase,
} from 'lucide-react';
import { getFaculties } from '../services/facultyService';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HeChinhQuyPage() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaculties()
      .then((facData) => {
        setFaculties(Array.isArray(facData) ? facData : facData?.data || []);
      })
      .catch(() => setFaculties([]))
      .finally(() => setLoading(false));
  }, []);

  const totalMajors = faculties.reduce((sum, f) => sum + (f.Majors?.length || 0), 0);

  const highlights = [
    { icon: Clock, label: 'Thời gian đào tạo', value: '4 năm (8 học kỳ)' },
    { icon: GraduationCap, label: 'Bằng cấp', value: 'Cử nhân chính quy' },
    { icon: BarChart3, label: 'Số ngành đào tạo', value: `${totalMajors || '30+'} ngành` },
    { icon: Briefcase, label: 'Tỷ lệ có việc làm', value: '> 95% sau 1 năm' },
  ];

  return (
    <div>
      <PageHeader
        title="Hệ Chính Quy"
        subtitle="Chương trình đào tạo đại học chính quy tại Trường Đại học Kinh tế — Đại học Đà Nẵng"
        breadcrumbs={[{ label: 'Chương trình', to: '/' }, { label: 'Hệ chính quy' }]}
      />

      {/* Overview */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 mb-4 inline-block uppercase tracking-wider">
              Tổng quan
            </span>
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              Đào tạo chính quy chất lượng cao
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Hệ chính quy là chương trình đào tạo chính thống, dành cho sinh viên tốt nghiệp THPT hoặc tương đương.
              Sinh viên theo học toàn thời gian tại trường trong thời gian 4 năm (8 học kỳ) và nhận bằng Cử nhân
              do Đại học Đà Nẵng cấp.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Chương trình được xây dựng theo chuẩn đầu ra quốc tế, tích hợp kiến thức lý thuyết với thực hành,
              thực tập tại doanh nghiệp, giúp sinh viên có đầy đủ kiến thức và kỹ năng để bước vào thị trường
              lao động ngay sau khi tốt nghiệp.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sinh viên được tham gia các hoạt động ngoại khóa, câu lạc bộ học thuật, chương trình trao đổi sinh viên
              quốc tế, và nhiều cơ hội phát triển bản thân.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.label} className="bg-slate-50 border border-slate-100 p-5 rounded-xl">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{h.label}</p>
                  <p className="text-sm font-bold text-slate-900">{h.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* Faculties & Majors */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900">Ngành đào tạo theo Khoa</h2>
            <p className="text-sm text-slate-500 mt-1">Danh sách đầy đủ các ngành đào tạo hệ chính quy</p>
          </div>
          <Link to="/nganh-dao-tao" className="text-xs font-bold text-primary hover:underline hidden sm:inline-flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6">
            {faculties.map((fac) => (
              <div key={fac.id} className="bg-white border border-slate-100 overflow-hidden">
                <Link
                  to={`/khoa/${fac.slug || fac.id}`}
                  className="flex items-center gap-4 bg-slate-50 px-6 py-4 hover:bg-primary/5 transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <Building2 className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{fac.name}</h3>
                    <p className="text-[11px] text-slate-400">{fac.Majors?.length || 0} ngành đào tạo</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                </Link>
                {fac.Majors && fac.Majors.length > 0 && (
                  <div className="px-6 py-3 grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {fac.Majors.map((m) => (
                      <Link
                        key={m.id}
                        to={`/nganh-dao-tao/${m.id}`}
                        className="flex items-center gap-2 py-1.5 text-xs text-slate-600 hover:text-primary transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{m.code && <strong className="text-slate-400 mr-1">{m.code}</strong>}{m.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>


    </div>
  );
}
