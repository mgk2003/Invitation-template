import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import dayjs from 'dayjs';
import {
  useGetInvitationsQuery,
  useChangeStatusMutation,
  useDeleteInvitationMutation,
} from '../../store/services/invitationApi';
import {
  searchQueryAtom,
  statusFilterAtom,
  dateFilterAtom,
  paginationAtom,
} from '../../atoms';
import LuxuryLoader from '../../components/loader/LuxuryLoader';
import { showApiErrorModal } from '../../utils/showApiErrorModal';
import type { WeddingContent, InvitationStatus } from '../../types/wedding';
import AppInput from '../../components/common/AppInput';
import { notification, Switch } from 'antd';
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiEye,
  FiShare2,
  FiCopy,
  FiRefreshCw,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiX,
  FiCheck,
  FiExternalLink,
  FiLayers,
  FiEdit3,
  FiCheckCircle,
  FiAlertCircle,
  FiCheckSquare,
} from 'react-icons/fi';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useAtom(searchQueryAtom);
  const [statusFilter, setStatusFilter] = useAtom(statusFilterAtom);
  const [dateFilter, setDateFilter] = useAtom(dateFilterAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);

  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<{ id: string; slug: string } | null>(null);

  // Query parameters for RTK Query
  const queryParams = {
    search: search || undefined,
    status: statusFilter || undefined,
    startDate: dateFilter[0] || undefined,
    endDate: dateFilter[1] || undefined,
    page: pagination.page,
    limit: pagination.limit,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
  };

  const { data, isLoading, isFetching, refetch } = useGetInvitationsQuery(queryParams);
  const [changeStatus, { isLoading: isStatusChanging }] = useChangeStatusMutation();
  const [deleteInvitation, { isLoading: isDeleting }] = useDeleteInvitationMutation();

  const counts = data?.counts || { total: 0, draft: 0, active: 0, inactive: 0, completed: 0 };

  const handleStatusToggle = async (record: WeddingContent) => {
    const nextStatus: 'Active' | 'Inactive' = record.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await changeStatus({ id: record._id!, status: nextStatus }).unwrap();
      notification.success({
        message: 'Status Updated',
        description: `Invitation '${record.slug}' status changed to ${nextStatus}.`,
      });
    } catch (err: any) {
      showApiErrorModal('Status Update Failed', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmRecord) return;
    try {
      await deleteInvitation(deleteConfirmRecord.id).unwrap();
      notification.success({
        message: 'Deleted Successfully',
        description: `Invitation '${deleteConfirmRecord.slug}' has been deleted.`,
      });
      setDeleteConfirmRecord(null);
    } catch (err: any) {
      showApiErrorModal('Delete Failed', err);
    }
  };

  const handleSort = (field: string) => {
    const isAsc = pagination.sortBy === field && pagination.sortOrder === 'asc';
    setPagination((prev) => ({
      ...prev,
      page: 1,
      sortBy: field,
      sortOrder: isAsc ? 'desc' : 'asc',
    }));
  };

  const renderSortIndicator = (field: string) => {
    if (pagination.sortBy !== field) return null;
    return pagination.sortOrder === 'asc' ? (
      <FiChevronUp className="inline ml-1 text-violet-400" />
    ) : (
      <FiChevronDown className="inline ml-1 text-violet-400" />
    );
  };

  const getStatusBadgeClass = (status: InvitationStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Inactive':
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
      case 'Completed':
        return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
    }
  };

  const totalPages = Math.ceil((data?.meta.total || 0) / (data?.meta.limit || 10));

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif bg-gradient-to-r from-violet-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent mb-1">
            Invitation Dashboard
          </h1>
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold font-mono">
            Manage all wedding invitations and content
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <FiRefreshCw className={`text-base ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/admin/invitations/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
          >
            <FiPlus className="text-lg" />
            <span>Create Invitation</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl hover:border-violet-500/20 transition-all flex items-center justify-between glow-border-violet">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Total Cards
            </div>
            <div className="text-3xl font-bold text-white mt-1">{counts.total}</div>
          </div>
          <div className="w-12 h-12 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-400 text-xl shrink-0">
            <FiLayers />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl hover:border-amber-500/20 transition-all flex items-center justify-between glow-border-amber">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Draft
            </div>
            <div className="text-3xl font-bold text-amber-400 mt-1">{counts.draft}</div>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 text-xl shrink-0">
            <FiEdit3 />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl hover:border-emerald-500/20 transition-all flex items-center justify-between glow-border-emerald">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Active
            </div>
            <div className="text-3xl font-bold text-emerald-400 mt-1">{counts.active}</div>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 text-xl shrink-0">
            <FiCheckCircle />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl hover:border-zinc-700 transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Inactive
            </div>
            <div className="text-3xl font-bold text-zinc-400 mt-1">{counts.inactive}</div>
          </div>
          <div className="w-12 h-12 bg-zinc-800/40 rounded-xl flex items-center justify-center text-zinc-400 text-xl shrink-0">
            <FiAlertCircle />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl hover:border-violet-500/40 transition-all flex items-center justify-between glow-border-violet">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Completed
            </div>
            <div className="text-3xl font-bold text-violet-400 mt-1">{counts.completed}</div>
          </div>
          <div className="w-12 h-12 bg-violet-600/15 rounded-xl flex items-center justify-center text-violet-300 text-xl shrink-0">
            <FiCheckSquare />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <AppInput
              type="text"
              placeholder="Search Bride, Groom, Slug..."
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              addonBefore={<FiSearch className="text-zinc-500" />}
            />
          </div>

          <div>
            <AppInput
              type="select"
              placeholder="Filter by Status"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              options={[
                { label: 'Draft', value: 'Draft' },
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
                { label: 'Completed', value: 'Completed' },
              ]}
            />
          </div>

          <div>
            <AppInput
              type="date"
              placeholder="Start Date"
              value={dateFilter[0]}
              onChange={(date) => {
                setDateFilter([date ? date.toISOString() : null, dateFilter[1]]);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>

          <div>
            <AppInput
              type="date"
              placeholder="End Date"
              value={dateFilter[1]}
              onChange={(date) => {
                setDateFilter([dateFilter[0], date ? date.toISOString() : null]);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
        </div>

        {(search || statusFilter || dateFilter[0] || dateFilter[1]) && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter(undefined);
                setDateFilter([null, null]);
                setPagination({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
              }}
              className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Responsive Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <LuxuryLoader tip="Fetching Invitations..." fullScreen={false} />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <th
                    className="py-4 px-6 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('couple')}
                  >
                    Bride & Groom {renderSortIndicator('couple')}
                  </th>
                  <th className="py-4 px-6">Slug</th>
                  <th
                    className="py-4 px-6 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('weddingDate')}
                  >
                    Wedding Date {renderSortIndicator('weddingDate')}
                  </th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Public Link</th>
                  <th
                    className="py-4 px-6 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    Created Date {renderSortIndicator('createdAt')}
                  </th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {(!data?.items || data.items.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-zinc-500 text-sm">
                      No invitations found.
                    </td>
                  </tr>
                ) : (
                  data.items.map((record: WeddingContent) => {
                    const publicUrl = `${window.location.origin}/${record.slug}`;
                    return (
                      <tr key={record._id} className="hover:bg-zinc-950/40 transition-colors group">
                        {/* Bride & Groom */}
                        <td className="py-4.5 px-6">
                          <div className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                            {record.couple?.groomName || 'Groom'} & {record.couple?.brideName || 'Bride'}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">{record.couple?.logoAlt || 'No Alt Text'}</div>
                        </td>

                        {/* Slug */}
                        <td className="py-4.5 px-6">
                          <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded-lg font-mono text-xs">
                            /{record.slug}
                          </span>
                        </td>

                        {/* Wedding Date */}
                        <td className="py-4.5 px-6 text-sm">
                          <div className="text-zinc-200">{record.dates?.weddingDateDisplay || '-'}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {record.dates?.weddingDatetime
                              ? dayjs(record.dates.weddingDatetime).format('YYYY-MM-DD HH:mm')
                              : ''}
                          </div>
                        </td>

                        {/* Status Switch Toggle */}
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(record.status)}`}>
                              {record.status}
                            </span>
                            {(record.status === 'Active' || record.status === 'Inactive') && (
                              <Switch
                                checked={record.status === 'Active'}
                                loading={isStatusChanging}
                                onChange={() => handleStatusToggle(record)}
                              />
                            )}
                          </div>
                        </td>

                        {/* Public Link */}
                        <td className="py-4.5 px-6 text-sm">
                          <div className="flex items-center gap-2">
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-violet-400 hover:text-violet-300 hover:underline truncate max-w-[160px] font-mono text-xs flex items-center gap-1"
                            >
                              <span>{record.slug}</span>
                              <FiExternalLink className="text-[10px]" />
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(publicUrl);
                                notification.success({ message: 'Copied Link', description: 'URL copied to clipboard' });
                              }}
                              className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              title="Copy URL"
                            >
                              <FiCopy className="text-xs" />
                            </button>
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="py-4.5 px-6 text-sm text-zinc-300">
                          {record.createdAt ? dayjs(record.createdAt).format('DD MMM YYYY') : '-'}
                        </td>

                        {/* Actions */}
                        <td className="py-4.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit */}
                            {(record.status === 'Draft' || record.status === 'Inactive' || record.status === 'Completed') && (
                              <button
                                onClick={() => navigate(`/admin/invitations/${record._id}/edit`)}
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-violet-500/10 text-zinc-400 hover:text-violet-400 transition-all cursor-pointer"
                                title="Edit Invitation"
                              >
                                <FiEdit className="text-sm" />
                              </button>
                            )}

                            {/* Preview */}
                            <button
                              onClick={() => setPreviewSlug(record.slug)}
                              className="p-2 rounded-lg bg-zinc-800 hover:bg-violet-500/10 text-zinc-400 hover:text-violet-400 transition-all cursor-pointer"
                              title="Live Preview"
                            >
                              <FiEye className="text-sm" />
                            </button>

                            {/* Share */}
                            <button
                              onClick={() => setShareSlug(record.slug)}
                              className="p-2 rounded-lg bg-zinc-800 hover:bg-violet-500/10 text-zinc-400 hover:text-violet-400 transition-all cursor-pointer"
                              title="Share Invitation"
                            >
                              <FiShare2 className="text-sm" />
                            </button>

                            {/* Delete */}
                            {(record.status === 'Draft' || record.status === 'Inactive' || record.status === 'Completed') && (
                              <button
                                onClick={() => setDeleteConfirmRecord({ id: record._id!, slug: record.slug })}
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                                title="Delete Invitation"
                              >
                                <FiTrash2 className="text-sm" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Custom Pagination */}
        {data?.meta && data.meta.total > 0 && (
          <div className="bg-zinc-950 border-t border-zinc-800 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400">
              Showing page <span className="font-semibold text-white">{data.meta.page}</span> of{' '}
              <span className="font-semibold text-white">{totalPages}</span> ({data.meta.total} total items)
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={data.meta.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={data.meta.page >= totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>

              <select
                value={pagination.limit}
                onChange={(e) => setPagination((prev) => ({ ...prev, page: 1, limit: parseInt(e.target.value) }))}
                className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-1.5 px-2 text-zinc-300 focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 1. Share Invitation Modal */}
      {shareSlug && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShareSlug(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
            <h3 className="text-xl font-bold tracking-tight text-white font-serif bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent mb-2">
              Share Invitation
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Share this link with guests to view the live wedding invitation:
            </p>
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-3">
              <span className="text-sm font-mono text-violet-400 flex-1 truncate select-all">
                {`${window.location.origin}/${shareSlug}`}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${shareSlug}`);
                  notification.success({ message: 'URL copied to clipboard' });
                }}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer transition-colors shrink-0"
              >
                <FiCopy /> Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Live Preview Modal/Drawer Overlay */}
      {previewSlug && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex flex-col justify-end md:justify-center p-0 md:p-6">
          <div className="bg-zinc-900 border-t md:border border-zinc-800 rounded-t-2xl md:rounded-2xl w-full h-[92vh] md:h-[90vh] shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-300 md:animate-in md:zoom-in-95 md:duration-200">
            <div className="h-14 px-6 border-b border-zinc-800/80 flex items-center justify-between shrink-0 bg-zinc-950/50">
              <h3 className="text-base font-bold text-white truncate">
                Live Preview: /{previewSlug}
              </h3>
              <button
                onClick={() => setPreviewSlug(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>
            <div className="flex-1 bg-zinc-950 overflow-hidden">
              <iframe
                src={`/${previewSlug}`}
                className="w-full h-full border-none"
                title="Invitation Live Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Dialog Modal */}
      {deleteConfirmRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <span className="text-red-500 text-2xl">⚠️</span> Delete Invitation
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Are you sure you want to permanently delete the invitation <span className="font-semibold text-white font-mono">/{deleteConfirmRecord.slug}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmRecord(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                ) : <FiTrash2 />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

