import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Eye, ArrowLeft, Tag, User } from 'lucide-react';
import { postService } from '../services';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postService.getPostBySlug(slug);
      setPost(data);
    } catch (err) {
      setError(err.message || 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPost(); }, [slug]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchPost} />;
  if (!post) return null;

  return (
    <div>
      <PageHeader
        title={post.title}
        breadcrumbs={[
          { label: 'Tin tức', to: '/tin-tuc' },
          { label: post.Category?.name || 'Bài viết' }
        ]}
      />

      <article className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/tin-tuc" className="inline-flex items-center gap-2 text-xs text-primary font-bold hover:gap-3 transition-all mb-10">
          <ArrowLeft className="w-4 h-4" /> QUAY LẠI TIN TỨC
        </Link>
        
        {/* Header Section */}
        <header className="mb-12">
          {post.Category && (
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-primary/30" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{post.Category.name}</span>
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight mb-8">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-slate-100 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Tác giả</p>
                <p className="text-xs font-bold text-slate-800">{post.User?.fullname || post.User?.email || 'Ban biên tập DUE'}</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-100 hidden sm:block" />
            
            <div className="flex items-center gap-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Ngày đăng</p>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> {fmtDate(post.published_at || post.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Lượt xem</p>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-primary" /> {post.views || 0}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Featured image */}
        {post.image_url && (
          <figure className="mb-12 -mx-4 sm:mx-0">
            <div className="aspect-video bg-slate-100 overflow-hidden relative group rounded-2xl shadow-2xl shadow-slate-200">
               <img 
                 src={post.image_url} 
                 alt={post.title} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
            {post.excerpt && (
               <figcaption className="mt-4 text-center text-xs text-slate-400 italic">
                 {post.excerpt}
               </figcaption>
            )}
          </figure>
        )}

        {/* Content Section with Quill Styles */}
        <div className="ql-container ql-snow border-none">
          <div
            className="ql-editor prose prose-slate max-w-none text-slate-700 leading-relaxed !p-0"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
        
        {/* Footer actions */}
        <footer className="mt-16 pt-8 border-t border-slate-100">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Chia sẻ:</span>
                 <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.248h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                 </button>
              </div>
              <Link to="/tin-tuc" className="text-xs font-bold text-primary hover:underline">
                 Xem các tin tức khác
              </Link>
           </div>
        </footer>
      </article>
    </div>
  );
}
