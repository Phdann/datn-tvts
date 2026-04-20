import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, ArrowRight, Tag } from 'lucide-react';
import { postService } from '../services';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

export default function NewsListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categorySlug, setCategorySlug] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 9, category_slug: categorySlug || undefined };
      const data = await postService.getPublishedPosts(params);
      setPosts(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCats = async () => {
      try {
        const data = await postService.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch {/* silent */}
    };
    loadCats();
  }, []);

  useEffect(() => { fetchPosts(); }, [page, categorySlug]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  return (
    <div>
      <PageHeader
        title="Tin tức"
        subtitle="Cập nhật thông tin mới nhất từ trường"
        breadcrumbs={[{ label: 'Tin tức' }]}
      />

      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => { setCategorySlug(''); setPage(1); }}
              className={`text-xs font-bold px-4 py-2 transition-all border rounded-xl ${!categorySlug ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'text-slate-600 border-slate-200 bg-white hover:border-primary hover:text-primary'}`}
            >
              Tất cả
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCategorySlug(c.slug); setPage(1); }}
                className={`text-xs font-bold px-4 py-2 transition-all border rounded-xl ${categorySlug === c.slug ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'text-slate-600 border-slate-200 bg-white hover:border-primary hover:text-primary'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchPosts} />
        ) : posts.length === 0 ? (
          <EmptyState title="Chưa có bài viết nào" />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} to={`/tin-tuc/${post.slug || post.id}`} className="group bg-white border border-slate-100 hover:border-primary transition-all rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-100 flex flex-col">
                  {/* Image */}
                  {post.image_url ? (
                    <div className="h-52 overflow-hidden bg-slate-100 relative">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {post.Category && (
                        <div className="absolute top-4 left-4">
                           <span className="bg-white/90 backdrop-blur-sm text-[9px] font-black text-primary px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                             {post.Category.name}
                           </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-52 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                      <Tag className="w-10 h-10 text-primary/20" />
                      {post.Category && (
                        <div className="absolute top-4 left-4">
                           <span className="bg-white/90 backdrop-blur-sm text-[9px] font-black text-primary px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                             {post.Category.name}
                           </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {fmtDate(post.published_at || post.createdAt)}</span>
                      <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-primary" /> {post.views || 0}</span>
                    </div>
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
