import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { currentUser, initialLoading } = useAuth();

  if (initialLoading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
