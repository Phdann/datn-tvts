import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, FileText, Trophy, ArrowRight } from 'lucide-react';
import { StatCard, NewsCard, MajorCard, PrimaryButton, SecondaryButton, LoadingSpinner } from '../components/common';
import { majorService, postService } from '../services';

function Home() {
  const [loading, setLoading] = useState(true);
  const [featuredMajors, setFeaturedMajors] = useState([]);
  const [latestNews, setLatestNews] = useState([]);

  const stats = [
    { icon: Users, value: '5,000+', label: 'Sinh viên', color: 'text-blue-600' },
    { icon: GraduationCap, value: '45+', label: 'Ngành đào tạo', color: 'text-green-600' },
    { icon: FileText, value: '3,200+', label: 'Hồ sơ đã nộp', color: 'text-purple-600' },
    { icon: Trophy, value: '2,100+', label: 'Đã trúng tuyển', color: 'text-yellow-600' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const majorsData = await majorService.getAllMajors({ page: 1, limit: 6 });
      setFeaturedMajors(majorsData.data || []);

      const newsData = await postService.getPublishedPosts({ page: 1, limit: 3 });
      setLatestNews(newsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="bg-primary text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-white text-primary border border-white">
                <span className="text-sm font-bold uppercase">Tuyển sinh 2025</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Chào mừng đến với
                <span className="block mt-2">ĐH Kinh tế - ĐH Đà Nẵng</span>
              </h1>
              
              <p className="text-xl text-blue-50 leading-relaxed font-medium">
                Nơi khởi nguồn tri thức, định hình tương lai. Cùng chúng tôi xây dựng nền tảng vững chắc cho sự nghiệp của bạn.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/dang-ky-xet-tuyen">
                  <PrimaryButton className="!bg-white !text-primary !border-white hover:!bg-gray-100">
                    <FileText className="h-5 w-5 mr-2 inline" />
                    Nộp hồ sơ ngay
                  </PrimaryButton>
                </Link>
                
                <Link to="/nganh-dao-tao">
                  <SecondaryButton className="!bg-transparent !border-white !text-white hover:!bg-white hover:!text-primary">
                    <GraduationCap className="h-5 w-5 mr-2 inline" />
                    Khám phá ngành học
                  </SecondaryButton>
                </Link>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="bg-white border-4 border-white shadow-none">
                <img
                  src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200"
                  alt="University Campus"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                iconColor={stat.color}
              />
            ))}
          </div>
        </div>
      </section>

      {featuredMajors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8 border-b-4 border-primary pb-4">
              <div>
                <h2 className="text-4xl font-bold text-gray-900">Ngành học nổi bật</h2>
                <p className="text-lg text-gray-600 mt-2">Khám phá các chương trình đào tạo chất lượng cao</p>
              </div>
              <Link to="/nganh-dao-tao">
                <SecondaryButton>
                  Xem tất cả
                  <ArrowRight className="h-4 w-4 ml-2 inline" />
                </SecondaryButton>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMajors.map((major) => (
                <MajorCard
                  key={major.id}
                  id={major.id}
                  code={major.code}
                  name={major.name}
                  tuition={major.tuition}
                  quota={major.quota}
                  faculty={major.Faculty?.name}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {latestNews.length > 0 && (
        <section className="py-16 bg-background-light">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8 border-b-4 border-primary pb-4">
              <div>
                <h2 className="text-4xl font-bold text-gray-900">Tin tức mới nhất</h2>
                <p className="text-lg text-gray-600 mt-2">Cập nhật thông tin tuyển sinh và sự kiện</p>
              </div>
              <Link to="/tin-tuc">
                <SecondaryButton>
                  Xem tất cả
                  <ArrowRight className="h-4 w-4 ml-2 inline" />
                </SecondaryButton>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {latestNews.map((post) => (
                <NewsCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  excerpt={post.excerpt}
                  image={post.featured_image}
                  date={post.published_at}
                  author={post.author}
                  category={post.Category?.name}
                  slug={post.slug}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sẵn sàng bắt đầu hành trình của bạn?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Đăng ký ngay hôm nay để nhận thông tin tuyển sinh mới nhất và các ưu đãi đặc biệt
          </p>
          <Link to="/dang-ky-xet-tuyen">
            <PrimaryButton className="text-primary border-white hover:bg-gray-100 text-lg px-10 py-4">
              <FileText className="h-6 w-6 mr-2 inline" />
              Nộp hồ sơ trực tuyến
              <ArrowRight className="h-6 w-6 ml-2 inline" />
            </PrimaryButton>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
