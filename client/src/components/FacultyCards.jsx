import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { getFaculties } from '../services/facultyService';
import LoadingSpinner from './LoadingSpinner';

export default function FacultyCards() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFaculties();
        setFaculties(Array.isArray(data) ? data : data?.data || []);
      } catch {
        setFaculties([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!faculties.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {faculties.map(fac => (
        <Link
          key={fac.id}
          to={`/khoa/${fac.slug || fac.id}`}
          className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all h-48"
        >
          {/* Background Image */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-300">
            {fac.banner_image_url ? (
              <img
                src={fac.banner_image_url.startsWith('http') ? fac.banner_image_url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${fac.banner_image_url}`}
                alt={fac.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : fac.logo_url ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <img
                  src={fac.logo_url.startsWith('http') ? fac.logo_url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${fac.logo_url}`}
                  alt={fac.name}
                  className="w-20 h-20 object-contain opacity-80"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-300">
                <Building2 className="w-16 h-16 text-slate-400 opacity-30" />
              </div>
            )}
          </div>

          {/* Overlay & Name */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="text-xs sm:text-sm font-black text-white leading-tight line-clamp-2 group-hover:text-primary-light transition-colors">
              {fac.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
