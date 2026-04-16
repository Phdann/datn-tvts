import PropTypes from 'prop-types';

function SharpCard({ 
  children, 
  title,
  subtitle,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  ...props 
}) {
  return (
    <div 
      className={`
        bg-white 
        border border-gray-200
        ${className}
      `}
      {...props}
    >
      {(title || subtitle) && (
        <div className={`px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}

SharpCard.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
};

export default SharpCard;
