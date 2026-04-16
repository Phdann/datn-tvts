import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const DataTable = ({ 
    columns, 
    data, 
    onEdit, 
    onDelete, 
    onBulkDelete,
    searchable = true,
    sortable = true,
    selectable = true 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [selectedRows, setSelectedRows] = useState([]);
    const itemsPerPage = 10;

    const filteredData = searchable ? data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : data;

    const sortedData = sortable && sortConfig.key
        ? [...filteredData].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        })
        : filteredData;

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (key) => {
        if (!sortable) return;
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(paginatedData.map(item => item.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        if (selectedRows.length === 0) return;
        if (window.confirm(`Xóa ${selectedRows.length} mục đã chọn?`)) {
            onBulkDelete?.(selectedRows);
            setSelectedRows([]);
        }
    };

    return (
        <div className="bg-white border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                {searchable && (
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                )}
                {selectable && selectedRows.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition text-sm font-bold"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa {selectedRows.length} mục
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {selectable && (
                                <th className="p-3 text-left w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4"
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                    className={`p-3 text-left text-xs font-black uppercase tracking-widest text-slate-600 ${
                                        col.sortable !== false && sortable ? 'cursor-pointer hover:bg-slate-100' : ''
                                    }`}
                                >
                                    {col.label}
                                    {sortConfig.key === col.key && (
                                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </th>
                            ))}
                            <th className="p-3 text-right text-xs font-black uppercase tracking-widest text-slate-600">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedData.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 transition">
                                {selectable && (
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(row.id)}
                                            onChange={() => handleSelectRow(row.id)}
                                            className="w-4 h-4"
                                        />
                                    </td>
                                )}
                                {columns.map((col) => (
                                    <td key={col.key} className="p-3 text-sm">
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                                <td className="p-3 text-right">
                                    <div className="flex justify-end gap-2 relative z-10">
                                        {onEdit && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Edit clicked:', row.id);
                                                    onEdit(row);
                                                }}
                                                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition rounded"
                                            >
                                                Sửa
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Delete clicked:', row.id);
                                                    onDelete(row.id);
                                                }}
                                                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition rounded"
                                            >
                                                Xóa
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-between items-center">
                <div className="text-sm text-slate-600">
                    Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedData.length)} / {sortedData.length}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1 text-sm font-bold">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
