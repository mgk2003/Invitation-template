import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ConfigProvider, theme, App as AntdApp, Spin } from 'antd';
import { setCredentials, logout } from './store/authSlice';
import { supabase } from './lib/supabase';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import InvitationForm from './pages/admin/InvitationForm';
import PublicInvitation from './pages/public/PublicInvitation';

// Protected Route Guard Component - Enforces Supabase Admin Authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Verify active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        dispatch(
          setCredentials({
            access_token: session.access_token,
            user: { username: session.user.email || 'Admin' },
          })
        );
      } else {
        setIsAuthenticated(false);
        dispatch(logout());
      }
      setCheckingAuth(false);
    });

    // 2. Subscribe to Supabase auth state changes (sign-in, token refresh, sign-out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        dispatch(
          setCredentials({
            access_token: session.access_token,
            user: { username: session.user.email || 'Admin' },
          })
        );
      } else {
        setIsAuthenticated(false);
        dispatch(logout());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // While checking Supabase session, show a sleek loading state to prevent flash
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <Spin size="large" />
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  // If not authenticated in Supabase, redirect immediately to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          colorBgContainer: '#090a0f',
          colorBgElevated: '#18181b',
          colorBorder: 'rgba(139, 92, 246, 0.2)',
          fontFamily: "'Poppins', sans-serif",
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <Routes>
            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Workspace - Strictly guarded */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="invitations/new" element={<InvitationForm />} />
              <Route path="invitations/:id/edit" element={<InvitationForm />} />
            </Route>

            {/* Public Dynamic Invitation Route */}
            <Route path="/:slug" element={<PublicInvitation />} />

            {/* Default Root Redirect */}
            <Route path="/" element={<Navigate to="/admin/login" replace />} />
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
