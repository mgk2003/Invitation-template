import React, { useEffect } from 'react';
import { Form, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAtom } from 'jotai';
import { useLoginMutation } from '../../store/services/authApi';
import { setCredentials } from '../../store/authSlice';
import { currentUserAtom } from '../../atoms';
import { motion } from 'framer-motion';
import { showApiErrorModal } from '../../utils/showApiErrorModal';
import AppInput from '../../components/common/AppInput';
import type { RootState } from '../../store';

export const AdminLogin: React.FC = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [, setCurrentUser] = useAtom(currentUserAtom);
  const [api, contextHolder] = notification.useNotification();
  
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const onFinish = async (values: any) => {
    try {
      const res = await login(values).unwrap();
      dispatch(setCredentials(res));
      setCurrentUser(res.user);
      api.success({
        message: 'Welcome Administrator',
        description: 'Successfully logged in to Wedding Invitation Generator CMS.',
      });
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login Failed:', err);
      const apiMessage = err?.data?.message || err?.message || 'An unexpected error occurred.';
      const errorMessage = Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage;
      api.error({
        message: 'Login Authentication Failed',
        description: errorMessage,
        placement: 'topRight',
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {contextHolder}
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        whileHover={{ scale: 1.01 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-panel glow-border-violet shadow-2xl rounded-3xl p-8 transition-all">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 via-indigo-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-violet-500/30 transform rotate-3 glow-border-violet">
              💍
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-serif bg-gradient-to-r from-violet-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent mb-1">
              Wedding CMS
            </h1>
            <p className="text-xs text-zinc-450 uppercase tracking-widest font-semibold font-mono">
              Admin Portal
            </p>
          </div>

          <Form name="admin_login" onFinish={onFinish} layout="vertical">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Username
                </label>
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Please input admin username' }]}
                  className="mb-0"
                >
                  <AppInput
                    type="text"
                    placeholder="Enter admin username"
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input password' }]}
                  className="mb-0"
                >
                  <AppInput
                    type="password"
                    placeholder="Enter password"
                  />
                </Form.Item>
              </div>
            </div>

            <div className="h-6" />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : null}
              <span>Sign In to Dashboard</span>
            </button>
          </Form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
