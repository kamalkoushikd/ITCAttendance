import { useAuth } from '../api/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

export default function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) return <AccessDenied reason="token" />;
    if (adminOnly && !isAdmin) return <AccessDenied reason="admin" />;
    return <>{children}</>;
}

function AccessDenied({ reason }: { reason: 'token' | 'admin' }) {
    const navigate = useNavigate();
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login', { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigate]);
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-500 mb-6">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9l6 6m0-6l-6 6" />
            </svg>
            <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-lg text-gray-700 mb-4">
                {reason === 'token'
                    ? 'You must be logged in to access this page.'
                    : 'You do not have permission to view this page.'}
            </p>
            <span className="inline-block px-6 py-2 bg-blue-600 text-white rounded font-semibold transition-all opacity-60 cursor-not-allowed">Redirecting to Login...</span>
        </div>
    );
}
