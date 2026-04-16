import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';

function NewsCard({ 
  id,
  title, 
  excerpt,
  image,
  date,
  author,
  category,
  slug,
  className = '',
  ...props 
}) {
  const href = slug ? `/tin-tuc/${slug}` : `/tin-tuc/${id}`;

  return (
    <Link
      to={href}
      className={`
        block
        bg-white 
        border border-gray-200
        hover:border-primary
        transition-colors
        ${className}
      `}
      {...props}
    >
      {image && (
        <div className="w-full h-48 bg-gray-200 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        {category && (
          <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold uppercase mb-3">
            {category}
          </span>
        )}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        {excerpt && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {excerpt}
          </p>
        )}
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {date && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(date).toLocaleDateString('vi-VN')}
            </div>
          )}
          {author && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {author}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

NewsCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string.isRequired,
  excerpt: PropTypes.string,
  image: PropTypes.string,
  date: PropTypes.string,
  author: PropTypes.string,
  category: PropTypes.string,
  slug: PropTypes.string,
  className: PropTypes.string,
};

export default NewsCard;
