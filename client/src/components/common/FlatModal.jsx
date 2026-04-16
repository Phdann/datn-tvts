import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { useEffect } from 'react';

function FlatModal({ 
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  className = '',
  ...props 
}) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative
            bg-white 
            border-2 border-gray-300
            w-full
            ${sizes[size]}
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}

          <div className="px-6 py-6">
            {children}
          </div>

          {footer && (
            <div className="px-6 py-4 border-t border-gray-300 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

FlatModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
};

export default FlatModal;
