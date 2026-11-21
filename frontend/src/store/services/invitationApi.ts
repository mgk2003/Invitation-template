import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { WeddingContent, InvitationStatus } from '../../types/wedding';
import { supabase } from '../../lib/supabase';

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

// Format default date strings if not manually provided
function formatDefaultDates(dates: any) {
  if (!dates || !dates.weddingDatetime) return dates;
  const d = new Date(dates.weddingDatetime);
  if (isNaN(d.getTime())) return dates;

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  const day = d.getDate();
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  const formatted = { ...dates };
  if (!formatted.weddingDateDisplay) {
    formatted.weddingDateDisplay = `${day} ${month} ${year}`;
  }
  if (!formatted.saveTheDateDisplay) {
    formatted.saveTheDateDisplay = `${month} ${String(day).padStart(2, '0')} - ${year}`;
  }
  if (!formatted.weddingTimeDisplay) {
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    formatted.weddingTimeDisplay = `${formattedHours}:${minutes} ${ampm} Onwards`;
  }
  return formatted;
}

export const invitationApi = createApi({
  reducerPath: 'invitationApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Invitation', 'PublicInvitation'],
  endpoints: (builder) => ({
    getInvitations: builder.query<InvitationsResponse, QueryParams>({
      async queryFn(params = {}) {
        try {
          // Attempt using the optimized Supabase RPC function first
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'get_invitations_with_counts',
            {
              p_status: params.status || null,
              p_search: params.search || null,
              p_start_date: params.startDate || null,
              p_end_date: params.endDate || null,
              p_sort_by: params.sortBy || 'createdAt',
              p_sort_order: params.sortOrder || 'desc',
              p_page: params.page || 1,
              p_limit: params.limit || 10,
            }
          );

          if (!rpcError && rpcData) {
            return { data: rpcData as InvitationsResponse };
          }

          // Fallback to direct table queries if RPC is not installed yet
          const page = params.page || 1;
          const limit = params.limit || 10;
          const from = (page - 1) * limit;
          const to = from + limit - 1;

          let query = supabase.from('invitations').select('*', { count: 'exact' });

          if (params.status) {
            query = query.eq('status', params.status);
          }

          if (params.search) {
            const s = params.search.trim();
            query = query.or(
              `slug.ilike.%${s}%,couple->>brideName.ilike.%${s}%,couple->>groomName.ilike.%${s}%`
            );
          }

          const sortField = params.sortBy === 'weddingDate' ? 'dates->>weddingDatetime' : (params.sortBy || 'createdAt');
          const isAsc = params.sortOrder === 'asc';
          query = query.order(sortField, { ascending: isAsc }).range(from, to);

          const { data: items, count: totalCount, error: tableError } = await query;
          if (tableError) {
            return { error: { status: 500, data: { message: tableError.message } } };
          }

          // Fetch count metrics
          const [
            { count: totalAll },
            { count: draftCount },
            { count: activeCount },
            { count: inactiveCount },
            { count: completedCount },
          ] = await Promise.all([
            supabase.from('invitations').select('*', { count: 'exact', head: true }),
            supabase.from('invitations').select('*', { count: 'exact', head: true }).eq('status', 'Draft'),
            supabase.from('invitations').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
            supabase.from('invitations').select('*', { count: 'exact', head: true }).eq('status', 'Inactive'),
            supabase.from('invitations').select('*', { count: 'exact', head: true }).eq('status', 'Completed'),
          ]);

          const total = totalCount || 0;
          return {
            data: {
              items: (items as unknown as WeddingContent[]) || [],
              meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
              },
              counts: {
                total: totalAll || 0,
                draft: draftCount || 0,
                active: activeCount || 0,
                inactive: inactiveCount || 0,
                completed: completedCount || 0,
              },
            },
          };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message || 'Error fetching invitations' } } };
        }
      },
      providesTags: ['Invitation'],
    }),

    getInvitation: builder.query<WeddingContent, string>({
      async queryFn(id) {
        try {
          const { data, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('id', id)
            .single();

          if (error || !data) {
            return { error: { status: 404, data: { message: error?.message || 'Invitation not found' } } };
          }

          return { data: data as unknown as WeddingContent };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message } } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Invitation', id }],
    }),

    getPublicInvitation: builder.query<WeddingContent, { slug: string; preview?: boolean }>({
      async queryFn({ slug, preview }) {
        try {
          const formattedSlug = slug.toLowerCase().trim();
          let query = supabase
            .from('invitations')
            .select('*')
            .eq('slug', formattedSlug);

          if (!preview) {
            query = query.in('status', ['Active', 'Completed']);
          }

          const { data, error } = await query.single();
          if (error || !data) {
            return {
              error: {
                status: 404,
                data: { message: 'Invitation not found or currently not published.' },
              },
            };
          }

          // Asynchronously increment views if public view
          if (!preview) {
            supabase.rpc('increment_invitation_views', { p_slug: formattedSlug }).then();
          }

          return { data: data as unknown as WeddingContent };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message } } };
        }
      },
      providesTags: (result, error, { slug }) => [{ type: 'PublicInvitation', id: slug }],
    }),

    checkSlug: builder.query<{ available: boolean; slug: string }, { slug: string; excludeId?: string }>({
      async queryFn({ slug, excludeId }) {
        try {
          const formattedSlug = slug.toLowerCase().trim();
          let query = supabase
            .from('invitations')
            .select('id')
            .eq('slug', formattedSlug);

          if (excludeId) {
            query = query.neq('id', excludeId);
          }

          const { data, error } = await query;
          if (error) {
            return { error: { status: 500, data: { message: error.message } } };
          }

          const available = !data || data.length === 0;
          return { data: { available, slug: formattedSlug } };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message } } };
        }
      },
    }),

    createDraft: builder.mutation<WeddingContent, Partial<WeddingContent>>({
      async queryFn(body) {
        try {
          const formattedSlug = (body.slug || '').toLowerCase().trim();
          const dates = formatDefaultDates(body.dates);

          const payload: any = {
            ...body,
            slug: formattedSlug,
            dates,
            status: 'Draft',
          };

          const { data, error } = await supabase
            .from('invitations')
            .insert(payload)
            .select()
            .single();

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: data as unknown as WeddingContent };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message } } };
        }
      },
      invalidatesTags: ['Invitation'],
    }),

    publishInvitation: builder.mutation<WeddingContent, Partial<WeddingContent>>({
      async queryFn(body) {
        try {
          const formattedSlug = (body.slug || '').toLowerCase().trim();
          const dates = formatDefaultDates(body.dates);

          let status: InvitationStatus = 'Active';
          if (dates?.weddingDatetime) {
            const weddingDate = new Date(dates.weddingDatetime);
            if (!isNaN(weddingDate.getTime()) && weddingDate < new Date()) {
              status = 'Completed';
            }
          }

          const payload: any = {
            ...body,
            slug: formattedSlug,
            dates,
            status,
          };

          const { data, error } = await supabase
            .from('invitations')
            .insert(payload)
            .select()
            .single();

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: data as unknown as WeddingContent };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message } } };
        }
      },
      invalidatesTags: ['Invitation'],
    }),

    updateDraft: builder.mutation<WeddingContent, { id: string; data: Partial<WeddingContent> }>({
      async queryFn({ id, data: updateData }) {
        try {
          const payload: any = { ...updateData };
          if (payload.slug) {
            payload.slug = payload.slug.toLowerCase().trim();
          }
          if (payload.dates) {
            payload.dates = formatDefaultDates(payload.dates);
          }
          payload.status = 'Draft';

          const { data, error } = await supabase
            .from('invitations')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: data as unknown as WeddingContent };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message } } };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Invitation', id }, 'Invitation'],
    }),

    updatePublished: builder.mutation<WeddingContent, { id: string; data: Partial<WeddingContent> }>({
      async queryFn({ id, data: updateData }) {
        try {
          const payload: any = { ...updateData };
          if (payload.slug) {
            payload.slug = payload.slug.toLowerCase().trim();
          }
          if (payload.dates) {
            payload.dates = formatDefaultDates(payload.dates);
          }

          let status: InvitationStatus = 'Active';
          if (payload.dates?.weddingDatetime) {
            const weddingDate = new Date(payload.dates.weddingDatetime);
            if (!isNaN(weddingDate.getTime()) && weddingDate < new Date()) {
              status = 'Completed';
            }
          }
          payload.status = status;

          const { data, error } = await supabase
            .from('invitations')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: data as unknown as WeddingContent };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message } } };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Invitation', id },
        'Invitation',
        'PublicInvitation',
      ],
    }),

    changeStatus: builder.mutation<WeddingContent, { id: string; status: 'Active' | 'Inactive' }>({
      async queryFn({ id, status }) {
        try {
          const { data, error } = await supabase
            .from('invitations')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: data as unknown as WeddingContent };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message } } };
        }
      },
      invalidatesTags: ['Invitation', 'PublicInvitation'],
    }),

    deleteInvitation: builder.mutation<{ success: boolean }, string>({
      async queryFn(id) {
        try {
          const { error } = await supabase
            .from('invitations')
            .delete()
            .eq('id', id);

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: { success: true } };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message } } };
        }
      },
      invalidatesTags: ['Invitation'],
    }),

    uploadFile: builder.mutation<{ url: string }, FormData>({
      async queryFn(formData) {
        try {
          const file = formData.get('file') as File;
          if (!file) {
            return { error: { status: 400, data: { message: 'No file provided' } } };
          }

          const fileExt = file.name.split('.').pop() || 'dat';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `uploads/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('invitation-media')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

          if (uploadError) {
            return { error: { status: 500, data: { message: uploadError.message } } };
          }

          const { data: urlData } = supabase.storage
            .from('invitation-media')
            .getPublicUrl(filePath);

          return { data: { url: urlData.publicUrl } };
        } catch (err: any) {
          return { error: { status: 500, data: { message: err?.message } } };
        }
      },
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
