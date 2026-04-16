import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  X,
  Loader,
  AlertCircle,
  BookOpen,
  GraduationCap,
  FileText,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { searchService } from '../services';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(!!initialQuery);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);

  const performSearch = useCallback(async (keyword, pageNum = 1) => {
    if (!keyword || keyword.trim().length === 0) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await searchService.globalSearch(keyword, pageNum, 20);
      setResults(response.data);
      setSearchParams({ q: keyword.replace(/^\/+|\/+$/g, '') });
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Lỗi khi thực hiện tìm kiếm');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  const fetchSuggestions = useCallback(async (keyword) => {
    if (!keyword || keyword.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const response = await searchService.searchSuggestions(keyword, 12);
      if (response.data.success) {
        setSuggestions(response.data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Suggestions error:', err);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setPage(1);
      setShowSuggestions(false);
      performSearch(query);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setPage(1);
    performSearch(suggestion.text);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setResults(null);
    setError(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (query) {
      performSearch(query, newPage);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type) => {
    const iconClass = 'w-5 h-5';
    switch (type) {
      case 'major':
        return <GraduationCap className={iconClass + ' text-blue-600'} />;
      case 'faculty':
        return <BookOpen className={iconClass + ' text-violet-600'} />;
      case 'post':
        return <FileText className={iconClass + ' text-amber-600'} />;
      case 'event':
        return <Calendar className={iconClass + ' text-emerald-600'} />;
      default:
        return <Search className={iconClass + ' text-slate-400'} />;
    }
  };

  const getResultLink = (result) => {
    switch (result.type) {
      case 'major':
        return `/nganh-dao-tao/${result.id}`;
      case 'faculty':
        return `/khoa/${result.id}`;
      case 'post':
        return `/tin-tuc/${result.slug}`;
      case 'event':
        return '#'; 
      default:
        return '#';
    }
  };

  const getAllResults = () => {
    if (!results) return [];
    return [
      ...((results.results?.majors || []).map((r) => ({ ...r, type: 'major' }))),
      ...((results.results?.faculties || []).map((r) => ({ ...r, type: 'faculty' }))),
      ...((results.results?.posts || []).map((r) => ({ ...r, type: 'post' }))),
      ...((results.results?.events || []).map((r) => ({ ...r, type: 'event' }))),
    ];
  };

  const allResults = getAllResults();

  return (
    <div>
      <PageHeader
        title="Tìm kiếm"
        subtitle="Tìm kiếm ngành đào tạo, khoa, tin tức, sự kiện..."
        breadcrumbs={[{ label: 'Tìm kiếm' }]}
      />

      <section className="max-w-4xl mx-auto px-4 py-12">
       
        <form onSubmit={handleSearch} className="mb-8">
          <div ref={suggestionsRef} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Nhập từ khóa tìm kiếm..."
                className="w-full pl-12 pr-12 py-3 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                {suggestionsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader className="w-5 h-5 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 group"
                      >
                        <div className="flex-shrink-0">
                          {getTypeIcon(suggestion.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate group-hover:text-primary transition-colors">
                            {suggestion.text}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {suggestion.type === 'major'
                              ? 'Ngành đào tạo'
                              : suggestion.type === 'faculty'
                              ? 'Khoa'
                              : suggestion.type === 'post'
                              ? 'Bài viết'
                              : 'Sự kiện'}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {loading && <LoadingSpinner />}

        {error && !loading && <ErrorState title="Lỗi tìm kiếm" message={error} />}

        {!loading && !error && !results && (
          <EmptyState
            icon={<Search className="w-16 h-16" />}
            title="Hãy bắt đầu tìm kiếm"
            message="Nhập từ khóa để tìm kiếm ngành đào tạo, khoa, tin tức hoặc sự kiện"
          />
        )}

        {!loading && !error && results && (
          <div>
            <div className="mb-6 pb-6 border-b border-slate-200">
              <p className="text-sm text-slate-600">
                Tìm thấy{' '}
                <span className="font-bold text-primary">{results.totalResults}</span>{' '}
                kết quả cho "<span className="font-bold">{results.keyword}</span>"
              </p>
            </div>

            {allResults.length === 0 ? (
              <EmptyState
                icon={<AlertCircle className="w-16 h-16" />}
                title="Không tìm thấy kết quả"
                message={`Rất tiếc, không có kết quả nào khớp với từ khóa "${results.keyword}"`}
              />
            ) : (
              <>
                {results.results?.majors?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Ngành đào tạo ({results.results.majors.length})
                    </h3>
                    <div className="space-y-3">
                      {results.results.majors.map((major) => (
                        <Link
                          key={major.id}
                          to={`/nganh-dao-tao/${major.id}`}
                          className="block p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                          <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors mb-1">
                            {major.name}
                          </h4>
                          <p className="text-sm text-slate-600 mb-2">{major.description}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="bg-slate-100 px-2 py-1 rounded">Mã: {major.code}</span>
                            {major.faculty && (
                              <span className="bg-slate-100 px-2 py-1 rounded">
                                Khoa: {major.faculty}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.results?.faculties?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-violet-600" />
                      Khoa ({results.results.faculties.length})
                    </h3>
                    <div className="space-y-3">
                      {results.results.faculties.map((faculty) => (
                        <Link
                          key={faculty.id}
                          to={`/khoa/${faculty.id}`}
                          className="block p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                          <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors mb-1">
                            {faculty.name}
                          </h4>
                          <p className="text-sm text-slate-600">{faculty.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.results?.posts?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-600" />
                      Bài viết ({results.results.posts.length})
                    </h3>
                    <div className="space-y-3">
                      {results.results.posts.map((post) => (
                        <Link
                          key={post.id}
                          to={`/tin-tuc/${post.slug}`}
                          className="block p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                          <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors mb-1">
                            {post.title}
                          </h4>
                          <p className="text-sm text-slate-600 mb-2">{post.excerpt}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.results?.events?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      Sự kiện ({results.results.events.length})
                    </h3>
                    <div className="space-y-3">
                      {results.results.events.map((event) => (
                        <div
                          key={event.id}
                          className="p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <h4 className="font-semibold text-slate-900 mb-1">{event.title}</h4>
                          <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                          <p className="text-xs text-slate-500">
                            {event.date && new Date(event.date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={results.page}
                      totalPages={results.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
