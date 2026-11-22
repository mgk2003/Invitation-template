import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ConfigProvider, theme, App as AntdApp, Spin } from 'antd';
import { setCredentials, logout, type AuthUser } from './store/authSlice';
import { supabase } from './lib/supabase';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import InvitationForm from './pages/admin/InvitationForm';
import SuperAdminUsers from './pages/admin/SuperAdminUsers';
import PublicInvitation from './pages/public/PublicInvitation';
import LuxuryLoader from './components/loader/LuxuryLoader';

// Helper to fetch user profile with role
const fetchFullAuthUser = async (session: any): Promise<AuthUser> => {
  let role: 'super_admin' | 'admin' = 'admin';
  let name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin';

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile?.role === 'super_admin' || profile?.role === 'admin') {
      role = profile.role;
    }
    if (profile?.name) {
      name = profile.name;
    }
  } catch {
    // fallback
  }

  return {
    id: session.user.id,
    username: session.user.email || 'Admin',
    email: session.user.email || '',
    role,
    name,
  };
};

// Protected Route Guard Component - Enforces Supabase Admin Authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Verify active Supabase session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const authUser = await fetchFullAuthUser(session);
        dispatch(
          setCredentials({
            access_token: session.access_token,
            user: authUser,
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const authUser = await fetchFullAuthUser(session);
        dispatch(
          setCredentials({
            access_token: session.access_token,
            user: authUser,
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
    return <LuxuryLoader tip="Verifying Admin Credentials..." fullScreen={true} variant="brand" />;
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
              <Route path="users" element={<SuperAdminUsers />} />
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
