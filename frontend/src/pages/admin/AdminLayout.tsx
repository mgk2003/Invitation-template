import React from 'react';
import { Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useDispatch } from 'react-redux';
import { sidebarCollapsedAtom, currentUserAtom } from '../../atoms';
import { logout } from '../../store/authSlice';
import { supabase } from '../../lib/supabase';
import { FiCompass, FiPlusCircle, FiLogOut, FiMenu, FiUser, FiUsers } from 'react-icons/fi';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleLogout = () => {
    supabase.auth.signOut().catch(() => {});
    dispatch(logout());
    setCurrentUser(null);
    navigate('/admin/login');
  };

  const currentKey = location.pathname.includes('/new')
    ? 'create'
    : location.pathname.includes('/users')
    ? 'users'
    : location.pathname.includes('/edit')
    ? 'edit'
    : 'dashboard';

  const menuItems = [
    {
      key: 'dashboard',
      label: isSuperAdmin ? 'All Invitations' : 'My Invitations',
      icon: <FiCompass className="text-lg" />,
      onClick: () => navigate('/admin/dashboard'),
    },
    ...(isSuperAdmin
      ? [
          {
            key: 'users',
            label: 'Manage Admins',
            icon: <FiUsers className="text-lg" />,
            onClick: () => navigate('/admin/users'),
          },
        ]
      : []),
    {
      key: 'create',
      label: 'Create Invitation',
      icon: <FiPlusCircle className="text-lg" />,
      onClick: () => navigate('/admin/invitations/new'),
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-white font-sans">
      {/* Sidebar Sider */}
      <aside
        className={`bg-zinc-900 border-r border-zinc-800/80 flex flex-col h-full transition-all duration-300 select-none ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg shadow-violet-500/20 glow-border-violet">
              💍
            </div>
            {!collapsed && (
              <span className="font-serif font-bold text-sm tracking-widest bg-gradient-to-r from-violet-200 to-indigo-200 bg-clip-text text-transparent truncate uppercase">
                Wedding CMS
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentKey === item.key;
            return (
              <button
                key={item.key}
                onClick={item.onClick}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-violet-600/10 text-violet-400 border-violet-500/20 shadow-md shadow-violet-500/5'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {item.icon}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {isActive && !collapsed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow shadow-violet-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer (Profile & Logout) */}
        <div className="p-4 border-t border-zinc-800/80 shrink-0 bg-zinc-900/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar
                icon={<FiUser className="text-zinc-300" />}
                className={`font-bold shadow-md flex items-center justify-center shrink-0 ${
                  isSuperAdmin
                    ? 'bg-gradient-to-tr from-amber-500 to-purple-600 text-white'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-500 text-white'
                }`}
              />
              {!collapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-zinc-300 truncate">
                    {currentUser?.name || currentUser?.username || 'Admin'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">
                    {isSuperAdmin ? '👑 Super Admin' : '⚡ Admin'}
                  </span>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer shrink-0"
              >
                <FiLogOut className="text-lg" />
              </button>
            )}
          </div>
          {collapsed && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
              >
                <FiLogOut className="text-lg" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 px-6 bg-zinc-950/60 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between shrink-0 z-20">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <FiMenu className="text-xl" />
          </button>

          <div className="flex items-center gap-3">
            {isSuperAdmin ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-violet-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                👑 Super Admin
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1.5 shadow-sm">
                ⚡ Admin
              </span>
            )}
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              {currentUser?.email || currentUser?.username}
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
