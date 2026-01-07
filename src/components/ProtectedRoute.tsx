import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    requireAuth = true
}) => {
    const { user, isAuthenticated } = useAuth();

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return null; // Will be handled by App.tsx to show login
    }

    // If specific roles are required, check user role
    if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !allowedRoles.includes(user.role)) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Access Denied</h1>
                        <p className="text-slate-600 mb-4">
                            You don't have permission to access this page.
                        </p>
                        <p className="text-sm text-slate-500">
                            Your role: <span className="font-bold">{user?.role || 'None'}</span>
                        </p>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
};
