import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useDispatch } from 'react-redux';
import { sidebarCollapsedAtom, currentUserAtom } from '../../atoms';
import { logout } from '../../store/authSlice';
import { FiCompass, FiPlusCircle, FiLogOut, FiMenu, FiUser, FiChevronDown } from 'react-icons/fi';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setCurrentUser(null);
    navigate('/admin/login');
  };

  const currentKey = location.pathname.includes('/new')
    ? 'create'
    : location.pathname.includes('/edit')
    ? 'edit'
    : 'dashboard';

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <FiCompass className="text-lg" />,
      onClick: () => navigate('/admin/dashboard'),
    },
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

          {/* User profile dropdown container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1.5 pr-3.5 rounded-xl hover:bg-zinc-800/60 border border-transparent hover:border-zinc-850 transition-colors cursor-pointer"
            >
              <Avatar
                icon={<FiUser className="text-zinc-300" />}
                className="bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold shadow-md flex items-center justify-center shrink-0"
              />
              <span className="text-sm font-semibold text-zinc-300 hidden md:inline">
                {currentUser?.username || 'Administrator'}
              </span>
              <FiChevronDown className={`text-zinc-500 text-xs transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Panel */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden py-1 z-35 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-zinc-850/50">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Logged in as</p>
                  <p className="text-sm font-bold text-white truncate">{currentUser?.username || 'admin'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 text-left transition-colors cursor-pointer"
                >
                  <FiLogOut className="text-base" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
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

