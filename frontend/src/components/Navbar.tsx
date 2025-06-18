import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, UserPlus, Building2, UserCog, MapPin, ReceiptText, UserLock, ListChecks } from 'lucide-react';
import { useAuth } from '../api/auth';

export default function Navbar() {
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const navItems = [
        { to: '/', label: 'Home', icon: <Home size={20} />, exact: true },
        { to: '/add-employee', label: 'Add Employee', icon: <UserPlus size={20} /> },
        { to: '/add-vendor', label: 'Add Vendor', icon: <Building2 size={20} /> },
        { to: '/add-approver', label: 'Add Approver', icon: <UserCog size={20} /> },
        { to: '/add-location', label: 'Add Location', icon: <MapPin size={20} /> },
        { to: '/add-billing-cycle-rule', label: 'Add Billing Rule', icon: <ReceiptText size={20} /> },
        { to: '/add-designation', label: 'Add Designation', icon: <UserLock size={20} /> },
        { to: '/attendance-transactions', label: 'Attendance Transactions', icon: <ListChecks size={20} /> },
    ];
    if (!isAuthenticated || !isAdmin) return null;
    return (
        <nav className="flex gap-2 px-6 py-3 bg-white border-b border-gray-200 shadow-sm items-center">
            {navItems.map(({ to, label, icon, exact }) => (
                <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 ${(exact ? location.pathname === to : location.pathname.startsWith(to)) ? 'bg-gray-100 text-blue-700' : ''}`}
                >
                    {icon}
                    <span>{label}</span>
                </Link>
            ))}
            <button
                onClick={() => { logout(); navigate('/login'); }}
                className="ml-auto px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
            >
                Logout
            </button>
        </nav>
    );
}
