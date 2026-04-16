const StatusBadge = ({ status, type = 'default' }) => {
    const statusConfig = {
        active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoạt động' },
        inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Không hoạt động' },
        pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Chờ duyệt' },
        approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã duyệt' },
        rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối' },
        draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Nháp' },
        published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã xuất bản' },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.inactive;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;
