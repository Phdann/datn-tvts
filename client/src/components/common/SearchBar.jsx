import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';

function SearchBar({ 
  value, 
  onChange, 
  onClear,
  placeholder = 'Tìm kiếm...', 
  className = '',
  ...props 
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full pl-12 pr-12 py-3 
          border border-gray-300 
          bg-white
          text-gray-800
          placeholder-gray-400
          focus:outline-none 
          focus:border-primary
          transition-colors duration-200
        "
        {...props}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default SearchBar;
