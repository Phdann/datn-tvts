import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, ExternalLink } from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

const statusMap = {
  upcoming: { label: 'Sắp diễn ra', cls: 'bg-blue-100 text-blue-700' },
  ongoing: { label: 'Đang diễn ra', cls: 'bg-green-100 text-green-700' },
  completed: { label: 'Đã kết thúc', cls: 'bg-slate-100 text-slate-500' },
  cancelled: { label: 'Đã huỷ', cls: 'bg-red-100 text-red-600' },
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 50, status: filter || undefined };
      const res = await api.get('/events', { params });
      setEvents(res.data?.data || []);
    } catch (err) {
      // Fallback if admin endpoint fails
      setEvents([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [filter]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div>
      <PageHeader
        title="Sự kiện"
        subtitle="Các sự kiện nổi bật tại trường"
        breadcrumbs={[{ label: 'Sự kiện' }]}
      />

      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[{ val: '', label: 'Tất cả' }, { val: 'upcoming', label: 'Sắp diễn ra' }, { val: 'ongoing', label: 'Đang diễn ra' }, { val: 'completed', label: 'Đã kết thúc' }].map((f) => (
            <button
              key={f.val}
              onClick={() => setFilter(f.val)}
              className={`text-xs font-semibold px-3 py-1.5 border transition-colors ${filter === f.val ? 'bg-primary text-white border-primary' : 'text-slate-600 border-slate-200 hover:border-primary'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchEvents} />
        ) : events.length === 0 ? (
          <EmptyState title="Chưa có sự kiện nào" description="Các sự kiện sẽ được cập nhật sớm." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const status = statusMap[ev.status] || statusMap.upcoming;
              return (
                <div key={ev.id} className="bg-white border border-slate-100 hover:border-primary transition-colors group">
                  {ev.image ? (
                    <div className="h-44 overflow-hidden bg-slate-100">
                      <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 mb-2 ${status.cls}`}>{status.label}</span>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{ev.title}</h3>
                    {ev.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{ev.description}</p>}
                    <div className="space-y-1 text-[10px] text-slate-400">
                      <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(ev.event_date)} {ev.end_date && `— ${fmtDate(ev.end_date)}`}</p>
                      {ev.location && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.location}</p>}
                    </div>
                    {ev.registration_link && (
                      <a href={ev.registration_link} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary hover:underline">
                        Đăng ký <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
