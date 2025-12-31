const StatusBadge = ({ status }) => {
    const getStatusClass = () => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'badge-pending';
            case 'approved':
                return 'badge-approved';
            case 'rejected':
                return 'badge-rejected';
            case 'blocked':
                return 'badge-blocked';
            case 'active':
                return 'badge-active';
            default:
                return '';
        }
    };

    return (
        <span className={`badge ${getStatusClass()}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
