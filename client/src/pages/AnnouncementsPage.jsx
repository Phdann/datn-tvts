import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Bell, ArrowRight } from 'lucide-react';
import { postService } from '../services';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

export default function AnnouncementsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postService.getPublishedPosts({ page, limit: 10, category_slug: 'thong-bao' });
      setPosts(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [page]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  return (
    <div>
      <PageHeader
        title="Thông báo"
        subtitle="Các thông báo quan trọng từ trường"
        breadcrumbs={[{ label: 'Tin tức', to: '/tin-tuc' }, { label: 'Thông báo' }]}
      />

      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchPosts} />
        ) : posts.length === 0 ? (
          <EmptyState icon={Bell} title="Chưa có thông báo nào" />
        ) : (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/tin-tuc/${post.slug}`}
                  className="flex items-start gap-5 p-6 bg-white border border-slate-100 hover:border-primary transition-all group rounded-2xl hover:shadow-lg hover:shadow-slate-100"
                >
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 rounded-xl group-hover:bg-primary transition-colors">
                    <Bell className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {fmtDate(post.published_at || post.createdAt)}</span>
                      <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-primary" /> {post.views || 0} lượt xem</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all mt-2">
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </section>
    </div>
  );
}
