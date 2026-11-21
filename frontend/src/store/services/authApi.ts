import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabase';
import type { AuthUser } from '../authSlice';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<
      { access_token: string; user: AuthUser },
      { username: string; password: string }
    >({
      async queryFn(credentials) {
        try {
          const { username, password } = credentials;
          // Support direct email or username (default domain if no @ provided)
          const email = username.includes('@') ? username.trim() : `${username.trim()}@weddingcms.local`;

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return {
              error: {
                status: 401,
                data: { message: error.message || 'Authentication failed' },
              },
            };
          }

          if (!data.session || !data.user) {
            return {
              error: {
                status: 401,
                data: { message: 'No session returned from authentication provider' },
              },
            };
          }

          // Fetch profile to know role (super_admin vs admin)
          let role: 'super_admin' | 'admin' = 'admin';
          let name = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Admin';

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, name')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profile) {
              if (profile.role === 'super_admin' || profile.role === 'admin') {
                role = profile.role;
              }
              if (profile.name) {
                name = profile.name;
              }
            }
          } catch {
            // Profile fetch optional fallback
          }

          const authUser: AuthUser = {
            id: data.user.id,
            username: data.user.email || username,
            email: data.user.email || email,
            role,
            name,
          };

          return {
            data: {
              access_token: data.session.access_token,
              user: authUser,
            },
          };
        } catch (err: any) {
          return {
            error: {
              status: 500,
              data: { message: err?.message || 'Unexpected login error' },
            },
          };
        }
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;
