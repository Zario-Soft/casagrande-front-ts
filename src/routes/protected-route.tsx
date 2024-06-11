import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom';
import { pageRoutes } from './routes';
import { useAuth } from '../extensions';

interface ProtectedRouteProps {
    children: ReactNode
}

export const ProtectedRoute: React.FunctionComponent<ProtectedRouteProps> = ({ children }) => {
    const auth = useAuth();

    if (!auth.isAuthenticated()) {
        return <Navigate to={pageRoutes.LOGIN} replace />
    }

    return <>{children}</>;
}