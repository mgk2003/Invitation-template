import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Select, notification, Avatar, Tag } from 'antd';
import {
  FiUsers,
  FiUserPlus,
  FiShield,
  FiMail,
  FiFileText,
  FiKey,
  FiUser,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetAdminsQuery, useCreateAdminMutation, useResetAdminPasswordMutation } from '../../store/services/invitationApi';
import AppInput from '../../components/common/AppInput';
import LuxuryLoader from '../../components/loader/LuxuryLoader';
import type { AdminUser } from '../../types/wedding';

export const SuperAdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { data: admins = [], isLoading, isFetching, refetch } = useGetAdminsQuery();
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetAdminPasswordMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedAdminForPassword, setSelectedAdminForPassword] = useState<AdminUser | null>(null);

  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  const regularAdmins = admins.filter((a) => a.role !== 'super_admin');
  const totalInvitationsManaged = regularAdmins.reduce((acc, curr) => acc + (curr.invitationCount || 0), 0);

  const handleCreateAdmin = async (values: any) => {
    try {
      await createAdmin({
        email: values.email.trim(),
        password: values.password,
        name: values.name?.trim(),
        role: 'admin', // Always create as admin only
      }).unwrap();

      api.success({
        message: 'Admin Created Successfully',
        description: `Account for ${values.email} has been provisioned. They can now log in.`,
        placement: 'topRight',
      });

      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to create admin account.';
      api.error({
        message: 'Creation Failed',
        description: msg,
        placement: 'topRight',
      });
    }
  };

  const handleOpenPasswordModal = (admin: AdminUser) => {
    if (admin.role === 'super_admin') {
      api.warning({
        message: 'Action Not Permitted',
        description: 'Super Admin passwords cannot be modified from this interface.',
        placement: 'topRight',
      });
      return;
    }
    setSelectedAdminForPassword(admin);
    passwordForm.resetFields();
    setIsPasswordModalOpen(true);
  };

  const handleResetPassword = async (values: any) => {
    if (!selectedAdminForPassword) return;
    try {
      await resetPassword({
        adminId: selectedAdminForPassword.id,
        newPassword: values.newPassword,
      }).unwrap();

      api.success({
        message: 'Password Changed Successfully',
        description: `Password for ${selectedAdminForPassword.name || selectedAdminForPassword.email} has been updated.`,
        placement: 'topRight',
      });

      setIsPasswordModalOpen(false);
      setSelectedAdminForPassword(null);
      passwordForm.resetFields();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to update password.';
      api.error({
        message: 'Password Update Failed',
        description: msg,
        placement: 'topRight',
      });
    }
  };

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl lg:text-3xl font-bold font-serif text-white tracking-wide">
              Administrator Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
              👑 Super Admin Control
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Create and manage CMS admin accounts, assign invitation responsibilities, and monitor activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-sm"
            title="Refresh List"
          >
            <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-violet-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <FiUserPlus className="text-base" />
            <span>Create New Admin</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-violet-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Total Administrators
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
              <FiUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif text-white tracking-tight">
            {regularAdmins.length}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Delegated staff accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Active Scope
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <FiUser className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif text-indigo-300 tracking-tight">
            {regularAdmins.length}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Scoped to assigned invitations</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Invitations Managed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FiFileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif text-emerald-300 tracking-tight">
            {totalInvitationsManaged}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Across all team administrators</p>
        </div>
      </div>

      {/* Admins Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiShield className="text-violet-400 text-lg" />
            <h2 className="text-base font-semibold text-white">Registered CMS Administrators</h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {regularAdmins.length} {regularAdmins.length === 1 ? 'admin' : 'admins'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12">
            <LuxuryLoader tip="Loading Administrators..." fullScreen={false} />
          </div>
        ) : regularAdmins.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <FiUsers className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
            <p className="text-base font-medium text-zinc-400">No administrators found</p>
            <p className="text-xs text-zinc-500 mt-1">
              Click &quot;Create New Admin&quot; to provision the first team member.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6">Administrator</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Assigned Invitations</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {regularAdmins.map((admin: AdminUser) => {
                  const isSuper = admin.role === 'super_admin';
                  return (
                    <tr
                      key={admin.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className={`font-bold shrink-0 ${isSuper
                              ? 'bg-gradient-to-tr from-amber-500 to-purple-600 text-white shadow-md shadow-amber-500/20'
                              : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md'
                              }`}
                          >
                            {(admin.name || admin.email || 'A')[0].toUpperCase()}
                          </Avatar>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {admin.name || 'Unnamed Admin'}
                              {isSuper && <span className="text-xs">👑</span>}
                            </div>
                            <div className="text-xs text-zinc-400 flex items-center gap-1 font-mono mt-0.5">
                              <FiMail className="text-zinc-500 text-xs" />
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            👑 Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/30">
                            ⚡ Admin
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => {
                            navigate(`/admin/dashboard?adminId=${admin.id}`);
                          }}
                          className="font-mono text-zinc-300 hover:text-violet-300 bg-zinc-800/60 hover:bg-violet-950/40 px-2.5 py-1 rounded-lg border border-zinc-700/50 hover:border-violet-500/50 text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1.5"
                          title="Filter invitations by this admin"
                        >
                          <FiFileText className="text-zinc-500 hover:text-violet-400 text-xs" />
                          <span>{admin.invitationCount || 0} invitations</span>
                        </button>
                      </td>

                      <td className="py-4 px-6 text-zinc-400 text-xs font-mono">
                        {admin.createdAt
                          ? dayjs(admin.createdAt).format('DD MMM YYYY, hh:mm A')
                          : '—'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              navigate(`/admin/dashboard?adminId=${admin.id}`);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-violet-500/50 bg-zinc-800/40 hover:bg-violet-600/10 text-zinc-300 hover:text-violet-300 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            title="View invitations assigned to this admin"
                          >
                            <FiFilter className="text-xs" />
                            <span>Invitations</span>
                          </button>

                          {!isSuper ? (
                            <button
                              onClick={() => handleOpenPasswordModal(admin)}
                              className="px-3 py-1.5 rounded-lg border border-amber-500/30 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                              title={`Reset password for ${admin.name || admin.email}`}
                            >
                              <FiKey className="text-xs text-amber-400" />
                              <span>Reset Password</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-zinc-500 italic px-2 py-1 select-none">
                              Super Admin
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Admin */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-white font-serif text-lg">
            <FiUserPlus className="text-violet-400" />
            <span>Create New Administrator</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
        centered
        className="luxury-modal"
      >
        <div className="pt-2 text-xs text-zinc-400 mb-6">
          Provision a new administrator account with login credentials. They will immediately be able to log in to the CMS.
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAdmin}
          initialValues={{ role: 'admin' }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please enter admin name' }]}
                className="mb-0"
              >
                <AppInput type="text" placeholder="e.g. Rahul Sharma" />
              </Form.Item>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter a valid email' },
                  { type: 'email', message: 'Enter a valid email address' },
                ]}
                className="mb-0"
              >
                <AppInput type="text" placeholder="e.g. rahul@wedding.com" />
              </Form.Item>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Temporary Password
              </label>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please enter a password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
                className="mb-0"
              >
                <AppInput type="password" placeholder="At least 6 characters" />
              </Form.Item>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-sm font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isCreating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating && (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              )}
              <span>Create Account</span>
            </button>
          </div>
        </Form>
      </Modal>

      {/* Modal: Reset Admin Password (Super Admin Only) */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-white font-serif text-lg">
            <FiKey className="text-amber-400" />
            <span>Reset Administrator Password</span>
          </div>
        }
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          setSelectedAdminForPassword(null);
          passwordForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        centered
        className="luxury-modal"
      >
        {selectedAdminForPassword && (
          <div className="pt-2">
            {/* Target Admin Card */}
            <div className="p-3.5 mb-5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-3">
              <Avatar className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold shrink-0">
                {(selectedAdminForPassword.name || selectedAdminForPassword.email || 'A')[0].toUpperCase()}
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate">
                  {selectedAdminForPassword.name || 'Unnamed Admin'}
                </div>
                <div className="text-xs text-zinc-400 truncate font-mono">
                  {selectedAdminForPassword.email}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/30 shrink-0">
                ⚡ Admin
              </span>
            </div>

            <div className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Set a new password for this administrator. Their previous password will be immediately invalidated and they can log in using the new credentials.
            </div>

            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleResetPassword}
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
                      { required: true, message: 'Please confirm the new password' },
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
                    setIsPasswordModalOpen(false);
                    setSelectedAdminForPassword(null);
                    passwordForm.resetFields();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResettingPassword && (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SuperAdminUsers;
