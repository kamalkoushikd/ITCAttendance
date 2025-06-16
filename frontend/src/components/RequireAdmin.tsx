import { useAuth } from '../api/auth';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

export default function RequireAdmin({ children }: { children: ReactNode }) {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <div className="p-8 text-center text-red-600">Access Denied</div>;
    return <>{children}</>;
}
