import React, { useState } from 'react';
import { Avatar, Modal, Form, notification } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useDispatch } from 'react-redux';
import { sidebarCollapsedAtom, currentUserAtom } from '../../atoms';
import { logout } from '../../store/authSlice';
import { invitationApi } from '../../store/services/invitationApi';
import { authApi } from '../../store/services/authApi';
import { supabase } from '../../lib/supabase';
import {
  FiCompass,
  FiPlusCircle,
  FiLogOut,
  FiMenu,
  FiUser,
  FiUsers,
  FiKey,
} from 'react-icons/fi';
import AppInput from '../../components/common/AppInput';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordForm] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleLogout = () => {
    supabase.auth.signOut().catch(() => { });
    dispatch(logout());
    dispatch(invitationApi.util.resetApiState());
    dispatch(authApi.util.resetApiState());
    setCurrentUser(null);
    navigate('/admin/login');
  };

  const handleChangeMyPassword = async (values: any) => {
    try {
      setIsChangingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) {
        api.error({
          message: 'Password Update Failed',
          description: error.message || 'Could not update your password.',
          placement: 'topRight',
        });
        return;
      }

      api.success({
        message: 'Password Changed Successfully',
        description: 'Your login password has been updated. Use it on your next login.',
        placement: 'topRight',
      });

      setIsChangePasswordOpen(false);
      changePasswordForm.resetFields();
    } catch (err: any) {
      api.error({
        message: 'Password Update Failed',
        description: err?.message || 'An unexpected error occurred.',
        placement: 'topRight',
      });
    } finally {
      setIsChangingPassword(false);
    }
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
        className={`bg-zinc-900 border-r border-zinc-800/80 flex flex-col h-full transition-all duration-300 select-none ${collapsed ? 'w-20' : 'w-64'
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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border ${isActive
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
                className={`font-bold shadow-md flex items-center justify-center shrink-0 ${isSuperAdmin
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
        {contextHolder}

        {/* Header Bar */}
        <header className="h-16 px-6 bg-zinc-950/60 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between shrink-0 z-20">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <FiMenu className="text-xl" />
          </button>

          <div className="flex items-center gap-3">
            {/* Super Admin Manage Users Link */}
            {isSuperAdmin && (
              <button
                onClick={() => navigate('/admin/users')}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Manage team administrators & reset passwords"
              >
                <FiUsers className="text-sm" />
                <span>Manage Admins</span>
              </button>
            )}

            {/* Change My Password (Every Logged-in User) */}
            <button
              onClick={() => {
                changePasswordForm.resetFields();
                setIsChangePasswordOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Change your login password"
            >
              <FiKey className="text-amber-400 text-sm" />
              <span className="hidden sm:inline">Change Password</span>
            </button>

            {isSuperAdmin ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-violet-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                👑 Super Admin
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1.5 shadow-sm">
                ⚡ Admin
              </span>
            )}
            <span className="text-xs text-zinc-400 font-mono hidden lg:inline">
              {currentUser?.email || currentUser?.username}
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          <Outlet />
        </main>
      </div>

      {/* Modal: Change My Password (Available to Every Logged-in User) */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-white font-serif text-lg">
            <FiKey className="text-amber-400" />
            <span>Change Your Password</span>
          </div>
        }
        open={isChangePasswordOpen}
        onCancel={() => {
          setIsChangePasswordOpen(false);
          changePasswordForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        centered
        className="luxury-modal"
      >
        <div className="pt-2">
          {/* User Info Card */}
          <div className="p-3.5 mb-5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-3">
            <Avatar
              className={`font-bold shrink-0 ${isSuperAdmin
                  ? 'bg-gradient-to-tr from-amber-500 to-purple-600 text-white'
                  : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                }`}
            >
              {(currentUser?.name || currentUser?.email || 'U')[0].toUpperCase()}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">
                {currentUser?.name || currentUser?.username || 'Current User'}
              </div>
              <div className="text-xs text-zinc-400 truncate font-mono">
                {currentUser?.email || currentUser?.username}
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border shrink-0 ${isSuperAdmin
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                }`}
            >
              {isSuperAdmin ? '👑 Super Admin' : '⚡ Admin'}
            </span>
          </div>

          <div className="text-xs text-zinc-400 mb-5 leading-relaxed">
            Enter a new password for your account. Once changed, use your new credentials for future logins.
          </div>

          <Form
            form={changePasswordForm}
            layout="vertical"
            onFinish={handleChangeMyPassword}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <Form.Item
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Please enter a new password' },
                    { min: 6, message: 'Password must be at least 6 characters' },
                  ]}
                  className="mb-0"
                >
                  <AppInput
                    type="password"
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <Form.Item
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm your new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match'));
                      },
                    }),
                  ]}
                  className="mb-0"
                >
                  <AppInput
                    type="password"
                    placeholder="Re-enter new password"
                  />
                </Form.Item>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsChangePasswordOpen(false);
                  changePasswordForm.resetFields();
                }}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword && (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                )}
                <span>Update Password</span>
              </button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLayout;
