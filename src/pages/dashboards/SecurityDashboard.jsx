import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import CameraCapture from '../../components/CameraCapture';
import {
    LayoutDashboard, UserPlus, ClipboardList, LogOut as LogOutIcon,
    Camera, Check, X, User, Phone, MapPin, FileText, Building2
} from 'lucide-react';
import { formatDateTime, getInitials } from '../../utils/validators';

const sidebarItems = [
    {
        title: 'Main',
        items: [
            { path: '', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/new-visitor', label: 'New Visitor Entry', icon: UserPlus },
            { path: '/active-visits', label: 'Active Visits', icon: ClipboardList }
        ]
    }
];

// Dashboard Overview
const DashboardHome = () => {
    const { currentRole } = useAuth();
    const { visitors, users, getSocietyById } = useData();

    const society = getSocietyById(currentRole?.societyId);

    const societyVisitors = visitors.filter(v => v.societyId === currentRole?.societyId);

    const today = new Date().toDateString();
    const todayVisitors = societyVisitors.filter(v =>
        new Date(v.entryTime).toDateString() === today
    );

    const pendingVisitors = societyVisitors.filter(v => v.status === 'pending');
    const activeVisitors = societyVisitors.filter(v =>
        v.status === 'approved' && !v.exitTime
    );

    return (
        <div>
            <div className="alert alert-info mb-6">
                <Building2 size={18} />
                <span>Security at: <strong>{society?.name}</strong></span>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{todayVisitors.length}</div>
                        <div className="stat-label">Today's Entries</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <ClipboardList size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{pendingVisitors.length}</div>
                        <div className="stat-label">Pending Approval</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Check size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{activeVisitors.length}</div>
                        <div className="stat-label">Currently Inside</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// New Visitor Entry
const NewVisitorPage = () => {
    const { currentUser, currentRole } = useAuth();
    const { users, addVisitor, getSocietyById } = useData();
    const [showCamera, setShowCamera] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        idProof: '',
        comingFrom: '',
        purpose: '',
        contactNumber: '',
        residentId: ''
    });

    const society = getSocietyById(currentRole?.societyId);

    // Get approved residents for this society
    const residents = users.filter(u =>
        u.roles.some(r =>
            r.role === 'resident' &&
            r.societyId === currentRole?.societyId &&
            r.status === 'approved'
        )
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handlePhotoCapture = (photoData) => {
        setPhoto(photoData);
        setShowCamera(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name || !formData.residentId) {
            setError('Please fill in all required fields');
            return;
        }

        addVisitor({
            ...formData,
            photo: photo,
            societyId: currentRole?.societyId,
            createdBy: currentUser.id
        });

        setSuccess('Visitor entry created! Waiting for resident approval.');
        setFormData({
            name: '',
            gender: 'male',
            idProof: '',
            comingFrom: '',
            purpose: '',
            contactNumber: '',
            residentId: ''
        });
        setPhoto(null);

        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div>
            <h2 className="mb-6">New Visitor Entry</h2>

            <div className="card" style={{ maxWidth: '700px' }}>
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Photo Section */}
                    <div className="form-group">
                        <label className="form-label">Visitor Photo</label>
                        {showCamera ? (
                            <CameraCapture
                                onCapture={handlePhotoCapture}
                                onCancel={() => setShowCamera(false)}
                            />
                        ) : photo ? (
                            <div className="flex gap-4" style={{ alignItems: 'flex-end' }}>
                                <img
                                    src={photo}
                                    alt="Visitor"
                                    style={{
                                        width: 150,
                                        height: 150,
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid var(--border-color)'
                                    }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setPhoto(null); setShowCamera(true); }}
                                >
                                    <Camera size={18} />
                                    Retake Photo
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setShowCamera(true)}
                            >
                                <Camera size={18} />
                                Capture Photo
                            </button>
                        )}
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Visitor Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="Enter visitor's full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select
                                name="gender"
                                className="form-select"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Contact Number</label>
                            <input
                                type="tel"
                                name="contactNumber"
                                className="form-input"
                                placeholder="10-digit mobile number"
                                value={formData.contactNumber}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">ID Proof</label>
                            <input
                                type="text"
                                name="idProof"
                                className="form-input"
                                placeholder="e.g., Aadhar, DL, Voter ID"
                                value={formData.idProof}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Coming From</label>
                        <input
                            type="text"
                            name="comingFrom"
                            className="form-input"
                            placeholder="Company/Organization or Address"
                            value={formData.comingFrom}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Purpose of Visit</label>
                        <input
                            type="text"
                            name="purpose"
                            className="form-input"
                            placeholder="e.g., Delivery, Personal, Service"
                            value={formData.purpose}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Visiting Resident *</label>
                        <select
                            name="residentId"
                            className="form-select"
                            value={formData.residentId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select resident to visit</option>
                            {residents.map(resident => {
                                const residentRole = resident.roles.find(r =>
                                    r.role === 'resident' && r.societyId === currentRole?.societyId
                                );
                                return (
                                    <option key={resident.id} value={resident.id}>
                                        {resident.name} - Block {residentRole?.block}, Flat {residentRole?.flatNumber}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full mt-6">
                        <UserPlus size={20} />
                        Submit Visitor Entry
                    </button>
                </form>
            </div>
        </div>
    );
};

// Active Visits (for closing on exit)
const ActiveVisitsPage = () => {
    const { currentRole } = useAuth();
    const { visitors, users, updateVisitor } = useData();
    const [filter, setFilter] = useState('all');

    const societyVisitors = visitors
        .filter(v => v.societyId === currentRole?.societyId)
        .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));

    const filteredVisitors = societyVisitors.filter(v => {
        switch (filter) {
            case 'pending':
                return v.status === 'pending';
            case 'approved':
                return v.status === 'approved' && !v.exitTime;
            case 'inside':
                return v.status === 'approved' && !v.exitTime;
            case 'exited':
                return v.exitTime !== null;
            default:
                return true;
        }
    });

    const getResidentName = (residentId) => {
        const resident = users.find(u => u.id === residentId);
        if (!resident) return 'Unknown';
        const residentRole = resident.roles.find(r =>
            r.role === 'resident' && r.societyId === currentRole?.societyId
        );
        return `${resident.name} (${residentRole?.block}-${residentRole?.flatNumber})`;
    };

    const handleCloseVisit = (visitorId) => {
        updateVisitor(visitorId, { exitTime: new Date().toISOString() });
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Active Visits</h2>

                <div className="tabs" style={{ marginBottom: 0 }}>
                    <button
                        className={`tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`tab ${filter === 'inside' ? 'active' : ''}`}
                        onClick={() => setFilter('inside')}
                    >
                        Inside
                    </button>
                    <button
                        className={`tab ${filter === 'exited' ? 'active' : ''}`}
                        onClick={() => setFilter('exited')}
                    >
                        Exited
                    </button>
                </div>
            </div>

            {filteredVisitors.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title="No Visitors"
                    description={`No ${filter !== 'all' ? filter : ''} visitors found.`}
                />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Visitor</th>
                                    <th>Purpose</th>
                                    <th>Visiting</th>
                                    <th>Entry</th>
                                    <th>Exit</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVisitors.map(visitor => (
                                    <tr key={visitor.id}>
                                        <td>
                                            <div className="flex gap-3" style={{ alignItems: 'center' }}>
                                                {visitor.photo ? (
                                                    <img
                                                        src={visitor.photo}
                                                        alt={visitor.name}
                                                        style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="header-avatar" style={{ width: 40, height: 40, fontSize: '0.75rem' }}>
                                                        {getInitials(visitor.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{visitor.name}</div>
                                                    <div className="text-xs text-muted">{visitor.contactNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted text-sm">{visitor.purpose || '—'}</td>
                                        <td className="text-sm">{getResidentName(visitor.residentId)}</td>
                                        <td className="text-sm text-muted">{formatDateTime(visitor.entryTime)}</td>
                                        <td className="text-sm text-muted">
                                            {visitor.exitTime ? formatDateTime(visitor.exitTime) : '—'}
                                        </td>
                                        <td>
                                            <StatusBadge status={visitor.status} />
                                        </td>
                                        <td>
                                            {visitor.status === 'approved' && !visitor.exitTime ? (
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => handleCloseVisit(visitor.id)}
                                                >
                                                    <LogOutIcon size={14} />
                                                    Close Visit
                                                </button>
                                            ) : (
                                                <span className="text-muted text-sm">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Dashboard Layout
const SecurityDashboard = () => {
    return (
        <div className="app-container">
            <Sidebar items={sidebarItems} basePath="/security" />
            <div className="main-content">
                <Header title="Security Dashboard" />
                <div className="page-content">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/new-visitor" element={<NewVisitorPage />} />
                        <Route path="/active-visits" element={<ActiveVisitsPage />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboard;
