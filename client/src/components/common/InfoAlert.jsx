import PropTypes from 'prop-types';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

function InfoAlert({ 
  type = 'info', // 'info', 'success', 'warning', 'error'
  title,
  message,
  onClose,
  className = '',
  ...props 
}) {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-900',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-900',
      icon: AlertCircle,
      iconColor: 'text-yellow-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-900',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    }
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div 
      className={`
        ${style.bg} 
        border ${style.border}
        p-4
        ${className}
      `}
      {...props}
    >
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${style.iconColor} mt-0.5`} />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-bold ${style.text}`}>{title}</h3>
          )}
          {message && (
            <p className={`text-sm ${style.text} ${title ? 'mt-1' : ''}`}>{message}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${style.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

InfoAlert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default InfoAlert;
