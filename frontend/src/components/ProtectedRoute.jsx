import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Helper function to check auth status and role
const useAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            // Check if the token is expired
            if (decoded.exp * 1000 < new Date().getTime()) {
                localStorage.removeItem('token');
                return { user: null }; // Token is expired
            }
            return { user: decoded }; // User is authenticated
        } catch (e) {
            localStorage.removeItem('token');
            return { user: null }; // Token is invalid
        }
    }
    return { user: null }; // No token found
};

const ProtectedRoute = () => {
    const { user } = useAuth();

    // If there's no user, redirect to the login page
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If there is a user, render the child route (AdminDashboard)
    return <Outlet />;
};

export default ProtectedRoute;