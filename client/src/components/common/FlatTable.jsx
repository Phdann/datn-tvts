import PropTypes from 'prop-types';

function FlatTable({ 
  columns = [], 
  data = [],
  className = '',
  ...props 
}) {
  return (
    <div className={`w-full overflow-x-auto ${className}`} {...props}>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300 last:border-r-0"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 text-sm text-gray-800 border-r border-gray-200 last:border-r-0"
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

FlatTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    render: PropTypes.func,
  })).isRequired,
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
};

export default FlatTable;
