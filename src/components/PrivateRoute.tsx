import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
    const token = localStorage.getItem('tmk-token');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
