import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { WeddingContent, InvitationStatus } from '../../types/wedding';

export interface QueryParams {
  search?: string;
  status?: InvitationStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface InvitationsResponse {
  items: WeddingContent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts: {
    total: number;
    draft: number;
    active: number;
    inactive: number;
    completed: number;
  };
}

export const invitationApi = createApi({
  reducerPath: 'invitationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Invitation', 'PublicInvitation'],
  endpoints: (builder) => ({
    getInvitations: builder.query<InvitationsResponse, QueryParams>({
      query: (params) => ({
        url: '/invitations',
        params,
      }),
      providesTags: ['Invitation'],
    }),

    getInvitation: builder.query<WeddingContent, string>({
      query: (id) => `/invitations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Invitation', id }],
    }),

    getPublicInvitation: builder.query<WeddingContent, { slug: string; preview?: boolean }>({
      query: ({ slug, preview }) => ({
        url: `/public/${slug}`,
        params: preview ? { preview: true } : undefined,
      }),
      providesTags: (result, error, { slug }) => [{ type: 'PublicInvitation', id: slug }],
    }),

    checkSlug: builder.query<{ available: boolean; slug: string }, { slug: string; excludeId?: string }>({
      query: ({ slug, excludeId }) => ({
        url: `/check-slug/${slug}`,
        params: excludeId ? { excludeId } : undefined,
      }),
    }),

    createDraft: builder.mutation<WeddingContent, Partial<WeddingContent>>({
      query: (body) => ({
        url: '/invitations/draft',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Invitation'],
    }),

    publishInvitation: builder.mutation<WeddingContent, Partial<WeddingContent>>({
      query: (body) => ({
        url: '/invitations/publish',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Invitation'],
    }),

    updateDraft: builder.mutation<WeddingContent, { id: string; data: Partial<WeddingContent> }>({
      query: ({ id, data }) => ({
        url: `/invitations/${id}/draft`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Invitation', id }, 'Invitation'],
    }),

    updatePublished: builder.mutation<WeddingContent, { id: string; data: Partial<WeddingContent> }>({
      query: ({ id, data }) => ({
        url: `/invitations/${id}/publish`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Invitation', id },
        'Invitation',
        'PublicInvitation',
      ],
    }),

    changeStatus: builder.mutation<WeddingContent, { id: string; status: 'Active' | 'Inactive' }>({
      query: ({ id, status }) => ({
        url: `/invitations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Invitation', 'PublicInvitation'],
    }),

    deleteInvitation: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/invitations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invitation'],
    }),

    uploadFile: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetInvitationsQuery,
  useGetInvitationQuery,
  useGetPublicInvitationQuery,
  useLazyCheckSlugQuery,
  useCreateDraftMutation,
  usePublishInvitationMutation,
  useUpdateDraftMutation,
  useUpdatePublishedMutation,
  useChangeStatusMutation,
  useDeleteInvitationMutation,
  useUploadFileMutation,
} = invitationApi;
