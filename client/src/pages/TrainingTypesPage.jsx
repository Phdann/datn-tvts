import { useState, useEffect } from 'react';
import { GraduationCap, Layers } from 'lucide-react';
import { trainingTypeService } from '../services';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function TrainingTypesPage() {
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainingTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all visible training types
        const data = await trainingTypeService.getAllTrainingTypes({ is_visible: true });
        setTrainingTypes(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách loại hình đào tạo');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingTypes();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="bg-slate-50/30 min-h-screen pb-20">
      <PageHeader
        title="Loại hình đào tạo"
        subtitle="Khám phá các chương trình học đa dạng tại Trường Đại học Kinh tế — Đại học Đà Nẵng"
        breadcrumbs={[{ label: 'Loại hình đào tạo' }]}
      />

      <section className="max-w-7xl mx-auto px-4 py-14">
        {trainingTypes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <Layers className="w-16 h-16 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-medium">Hiện chưa có thông tin loại hình đào tạo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 w-full">
            {trainingTypes.map((type) => (
              <div 
                key={type.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6 md:p-8 border-b border-slate-50 relative">
                  <div className="flex items-center flex-wrap gap-4 mb-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900">
                        {type.name}
                      </h3>
                      {type.year && (
                         <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                           Niên khóa {type.year}
                         </span>
                      )}
                    </div>
                  </div>
                  {type.content_text ? (
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                      {type.content_text}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Thông tin chi tiết về loại hình đào tạo này đang được cập nhật.</p>
                  )}
                </div>

                <div className="w-full relative bg-slate-100 flex items-center justify-center p-4">
                  {(() => {
                    const allImages = type.image_urls && type.image_urls.length > 0
                      ? type.image_urls 
                      : (type.image_url ? [type.image_url] : []);
                    
                    if (allImages.length > 0) {
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                           {allImages.map((url, idx) => (
                             <img 
                               key={idx}
                               src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`} 
                               alt={`${type.name} - ${idx + 1}`} 
                               className="w-full h-auto object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
                             />
                           ))}
                        </div>
                      );
                    }
                    
                    return (
                      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-300">
                        <Layers className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-sm font-medium">Hình ảnh đang được cập nhật...</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
