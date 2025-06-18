import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ListChecks } from 'lucide-react';
import { useAuth } from '../api/auth';

export default function AttendanceNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, isAdmin } = useAuth();
    const navItems = [
        { to: '/attendance-home', label: 'Attendance Home', icon: <Home size={18} /> },
        { to: '/attendance-transactions', label: 'Attendance Transactions', icon: <ListChecks size={18} /> },
    ];
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (
        <nav className="flex gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 shadow-sm items-center mb-6">
            {navItems.map(({ to, label, icon }) => (
                <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 ${location.pathname === to ? 'bg-gray-100 text-blue-700' : ''}`}
                >
                    {icon}
                    <span>{label}</span>
                </Link>
            ))}
            {!isAdmin && (
                <button
                    onClick={handleLogout}
                    className="ml-auto px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
                >
                    Logout
                </button>
            )}
        </nav>
    );
}
