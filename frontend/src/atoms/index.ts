import { atom } from 'jotai';
import type { WeddingContent, InvitationStatus } from '../types/wedding';

const getInitialUser = (): { username: string } | null => {
  try {
    const item = localStorage.getItem('admin_user');
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const currentUserAtom = atom<{ username: string } | null>(getInitialUser());

export const themeAtom = atom<'dark' | 'light'>('dark');

export const sidebarCollapsedAtom = atom<boolean>(false);

export const searchQueryAtom = atom<string>('');

export const statusFilterAtom = atom<InvitationStatus | undefined>(undefined);

export const dateFilterAtom = atom<[string | null, string | null]>([null, null]);

export const selectedInvitationAtom = atom<WeddingContent | null>(null);

export const previewModalAtom = atom<{ open: boolean; slug: string | null }>({
  open: false,
  slug: null,
});

export const paginationAtom = atom<{ page: number; limit: number; sortBy: string; sortOrder: 'asc' | 'desc' }>({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});
