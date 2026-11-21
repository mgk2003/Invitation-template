import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabase';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<
      { access_token: string; user: { username: string; email?: string } },
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

          return {
            data: {
              access_token: data.session.access_token,
              user: {
                username: data.user.email || username,
                email: data.user.email,
              },
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
