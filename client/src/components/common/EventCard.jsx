import PropTypes from 'prop-types';
import { Calendar, MapPin, Clock } from 'lucide-react';

function EventCard({ 
  title, 
  date,
  time,
  location,
  description,
  type = 'event', // 'event', 'deadline', 'announcement'
  className = '',
  ...props 
}) {
  const typeColors = {
    event: 'bg-blue-600',
    deadline: 'bg-red-600',
    announcement: 'bg-green-600'
  };

  return (
    <div
      className={`
        bg-white 
        border border-gray-200
        hover:border-primary
        transition-colors
        ${className}
      `}
      {...props}
    >
      <div className={`${typeColors[type]} p-4 border-b border-gray-200`}>
        <div className="flex items-center text-white">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="font-bold">
            {new Date(date).toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
        )}
        <div className="space-y-2">
          {time && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {time}
            </div>
          )}
          {location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

EventCard.propTypes = {
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  time: PropTypes.string,
  location: PropTypes.string,
  description: PropTypes.string,
  type: PropTypes.oneOf(['event', 'deadline', 'announcement']),
  className: PropTypes.string,
};

export default EventCard;
