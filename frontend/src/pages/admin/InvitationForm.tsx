import React, { useEffect, useState } from 'react';
import { Form, notification, Modal, Dropdown, Select } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import dayjs from 'dayjs';
import {
  useGetInvitationQuery,
  useCreateDraftMutation,
  usePublishInvitationMutation,
  useUpdateDraftMutation,
  useUpdatePublishedMutation,
  useLazyCheckSlugQuery,
  useGetAdminsQuery,
} from '../../store/services/invitationApi';
import { currentUserAtom } from '../../atoms';
import LuxuryLoader from '../../components/loader/LuxuryLoader';
import { showApiErrorModal } from '../../utils/showApiErrorModal';
import { brandName } from '../../config';
import AppInput from '../../components/common/AppInput';
import { BACKGROUND_OPTIONS, BackgroundOption } from '../../types/wedding';
import {
  FiArrowLeft,
  FiSave,
  FiSend,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiInfo,
  FiEdit2,
  FiMoreVertical,
  FiEye,
  FiExternalLink,
  FiHeart,
  FiCopy,
  FiClipboard,
} from 'react-icons/fi';

const tabs = [
  { id: 'general', label: '1. Slug & Theme' },
  { id: 'couple', label: '2. Couple Details' },
  { id: 'dates', label: '3. Wedding Dates' },
  { id: 'hero', label: '4. Hero & Card' },
  { id: 'events', label: '5. Events List' },
  { id: 'bio', label: '6. Story & Bio' },
  { id: 'tips', label: '7. Tips & Info' },
  { id: 'social', label: '8. Music & Footer' },
];

const BackgroundSelector: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
}> = ({ value = 'background_1', onChange }) => {
  const [previewOption, setPreviewOption] = useState<BackgroundOption | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BACKGROUND_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          return (
            <div
              key={option.id}
              onClick={() => onChange?.(option.id)}
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer flex flex-col ${isSelected
                ? 'border-violet-500 bg-violet-950/25 shadow-lg shadow-violet-500/25 ring-2 ring-violet-500/40'
                : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
            >
              {/* Visual Thumbnail Area - Centered Phone Frame focusing top Bride & Groom */}
              <div
                className="relative w-full py-4 px-3 bg-zinc-950 flex items-center justify-center cursor-pointer overflow-hidden border-b border-zinc-850"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewOption(option);
                }}
                title="Click to preview full design"
              >
                {/* Centered Phone Silhouette Preview */}
                <div className="relative w-36 sm:w-40 aspect-[426/1024] rounded-2xl overflow-hidden border-2 border-amber-400/35 shadow-xl bg-[#0a021e] group-hover:border-violet-500/70 transition-all duration-300">
                  <img
                    src={option.previewSrc}
                    alt={option.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Subtle bottom vignette */}
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                  {/* Tagline at bottom */}
                  <div className="absolute bottom-2 inset-x-1.5 text-center pointer-events-none">
                    <span className="text-[9px] text-zinc-300 font-serif tracking-wider uppercase bg-black/70 px-1.5 py-0.5 rounded border border-white/10 block truncate">
                      {option.tagline}
                    </span>
                  </div>
                </div>

                {/* Top-left Quick Preview Pill */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewOption(option);
                  }}
                  className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 hover:bg-violet-600 text-zinc-300 hover:text-white border border-white/10 text-[10px] font-semibold flex items-center gap-1 transition-all shadow-md z-10 backdrop-blur-sm cursor-pointer"
                >
                  <FiEye className="text-xs" /> Preview
                </button>

                {/* Status Badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  {isSelected ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-violet-600 text-white text-[11px] font-bold rounded-full shadow-md shadow-violet-600/50">
                      <FiCheckCircle className="text-xs" /> Selected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-black/80 text-zinc-400 text-[10px] font-medium rounded-full border border-white/10 group-hover:text-white transition-colors backdrop-blur-sm">
                      Select
                    </span>
                  )}
                </div>
              </div>

              {/* Card Content Footer */}
              <div className="p-3.5 flex flex-col justify-between flex-1 bg-zinc-950/80 border-t border-zinc-850/80">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <h4 className={`text-sm font-serif font-bold truncate ${isSelected ? 'text-violet-300' : 'text-zinc-200 group-hover:text-white'}`}>
                      {option.name}
                    </h4>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-violet-500 bg-violet-600' : 'border-zinc-600 bg-transparent'
                      }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-850/50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewOption(option);
                    }}
                    className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <FiEye className="text-xs" /> View Full Preview
                  </button>

                  <span className={`text-[10px] font-mono ${isSelected ? 'text-violet-400 font-bold' : 'text-zinc-500'}`}>
                    {isSelected ? 'ACTIVE' : 'CHOOSE'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Background Preview Modal */}
      <Modal
        open={Boolean(previewOption)}
        onCancel={() => setPreviewOption(null)}
        footer={null}
        centered
        width={780}
        destroyOnClose
        title={
          <div className="flex items-center gap-2 text-white font-serif text-lg">
            <FiEye className="text-violet-400" />
            <span>{previewOption?.name}</span>
          </div>
        }
      >
        {previewOption && (
          <div className="py-2">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Phone Mockup Frame with Hand-Cropped Preview */}
              <div className="w-full max-w-[280px] shrink-0 mx-auto">
                <div className="relative rounded-[28px] overflow-hidden border-4 border-amber-400/50 shadow-2xl bg-[#0a021e] aspect-[426/1024]">
                  <img
                    src={previewOption.previewSrc}
                    alt={previewOption.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 text-center mt-2 font-mono">
                  Curated Mobile Frame View
                </p>
              </div>

              {/* Details & Selection Controls on Right */}
              <div className="flex-1 flex flex-col justify-between self-stretch space-y-5">
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-violet-400 font-bold font-mono">
                      Theme Details
                    </span>
                    <h3 className="text-xl font-serif font-bold text-white mt-0.5">
                      {previewOption.name}
                    </h3>
                    <p className="text-xs text-amber-300/90 font-medium mt-1">
                      {previewOption.tagline}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                    <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Design & Cultural Atmosphere
                    </h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {previewOption.description}
                    </p>
                  </div>

                  <div className="text-xs text-zinc-500 space-y-1 font-mono">
                    <div>Asset Path: <span className="text-zinc-400">{previewOption.src}</span></div>
                    <div>Applied On: <span className="text-emerald-400">Mobile Mockup + Desktop Ambient Blur</span></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-800">
                  {value === previewOption.id ? (
                    <div className="flex-1 w-full py-2.5 px-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                      <FiCheckCircle className="text-sm" /> Currently Selected Theme
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onChange?.(previewOption.id);
                        setPreviewOption(null);
                        notification.success({
                          message: 'Theme Selected',
                          description: `${previewOption.name} is now selected for this invitation.`,
                        });
                      }}
                      className="flex-1 w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-500/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle className="text-sm" /> Select This Theme
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => window.open(previewOption.src, '_blank')}
                    className="w-full sm:w-auto py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FiExternalLink className="text-sm" /> View High-Res
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export const InvitationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [eventForm] = Form.useForm();
  const [tipForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState('general');

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null);

  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [editingTipIndex, setEditingTipIndex] = useState<number | null>(null);

  const { data: existingData, isLoading: isLoadingExisting } = useGetInvitationQuery(id!, {
    skip: !isEdit,
  });

  const [currentUser] = useAtom(currentUserAtom);
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const { data: adminList = [] } = useGetAdminsQuery(undefined, { skip: !isSuperAdmin });

  const [createDraft, { isLoading: isDraftSaving }] = useCreateDraftMutation();
  const [publishInvitation, { isLoading: isPublishing }] = usePublishInvitationMutation();
  const [updateDraft, { isLoading: isDraftUpdating }] = useUpdateDraftMutation();
  const [updatePublished, { isLoading: isPublishUpdating }] = useUpdatePublishedMutation();

  const [checkSlugTrigger] = useLazyCheckSlugQuery();

  const [slugStatus, setSlugStatus] = useState<{
    validating: boolean;
    available?: boolean;
    message?: string;
  }>({ validating: false });

  const [progress, setProgress] = useState(0);
  const [tabStatuses, setTabStatuses] = useState<Record<string, 'complete' | 'incomplete' | 'error'>>({});
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState('');

  const tabMapping: Record<string, string> = {
    slug: 'general',
    backgroundImage: 'general',
    couple: 'couple',
    dates: 'dates',
    hero: 'hero',
    inviteCard: 'hero',
    events: 'events',
    meetSection: 'bio',
    messageSection: 'bio',
    countdownSection: 'bio',
    thingsToKnow: 'tips',
    social: 'social',
    footer: 'social',
    music: 'social',
  };

  // Dynamic progress and status calculator
  const calculateProgressAndStatuses = (values: any) => {
    if (!values) return;

    const requiredPaths = [
      ['slug'],
      ['backgroundImage'],
      ['couple', 'groomName'],
      ['couple', 'brideName'],
      ['dates', 'weddingDatetime'],
      ['dates', 'weddingDateDisplay'],
      ['dates', 'saveTheDateDisplay'],
      ['dates', 'weddingTimeDisplay'],
      ['hero', 'introText'],
      ['inviteCard', 'loveMessage'],
      ['inviteCard', 'subtitle'],
      ['meetSection', 'labelTop'],
      ['meetSection', 'title'],
      ['meetSection', 'sectionHeading'],
      ['meetSection', 'bio'],
      ['messageSection', 'title'],
      ['messageSection', 'paragraph1'],
      ['messageSection', 'paragraph2'],
      ['messageSection', 'ctaBadge'],
      ['countdownSection', 'gettingMarriedText'],
      ['countdownSection', 'message'],
      ['thingsToKnow', 'labelTop'],
      ['thingsToKnow', 'title'],
      ['thingsToKnow', 'description'],
      ['thingsToKnow', 'surpriseMessage'],
      ['social', 'instagramHandle'],
      ['social', 'instagramLink'],
      ['footer', 'credit'],
    ];

    let filledCount = 0;
    requiredPaths.forEach((path) => {
      let val = values;
      for (const key of path) {
        val = val?.[key];
      }
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        filledCount++;
      }
    });

    const events = values.events;
    const hasEvents = Array.isArray(events) && events.length >= 1;
    if (hasEvents) filledCount++;

    const tips = values.thingsToKnow?.tips;
    const hasTips = Array.isArray(tips) && tips.length >= 1;
    if (hasTips) filledCount++;

    const totalRequired = requiredPaths.length + 2; // 29 fields total
    const percent = Math.round((filledCount / totalRequired) * 100);
    setProgress(percent);

    const newStatuses: Record<string, 'complete' | 'incomplete' | 'error'> = {};

    const tabFields: Record<string, any[][]> = {
      general: [['slug'], ['backgroundImage']],
      couple: [['couple', 'groomName'], ['couple', 'brideName']],
      dates: [['dates', 'weddingDatetime'], ['dates', 'weddingDateDisplay'], ['dates', 'saveTheDateDisplay'], ['dates', 'weddingTimeDisplay']],
      hero: [['hero', 'introText'], ['inviteCard', 'loveMessage'], ['inviteCard', 'subtitle']],
      events: [],
      bio: [
        ['meetSection', 'labelTop'], ['meetSection', 'title'], ['meetSection', 'sectionHeading'], ['meetSection', 'bio'],
        ['messageSection', 'title'], ['messageSection', 'paragraph1'], ['messageSection', 'paragraph2'], ['messageSection', 'ctaBadge'],
        ['countdownSection', 'gettingMarriedText'], ['countdownSection', 'message']
      ],
      tips: [['thingsToKnow', 'labelTop'], ['thingsToKnow', 'title'], ['thingsToKnow', 'description'], ['thingsToKnow', 'surpriseMessage']],
      social: [
        ['social', 'instagramHandle'],
        ['social', 'instagramLink'],
        ['footer', 'credit'],
      ],
    };

    tabs.forEach((tab) => {
      let isTabComplete = true;
      if (tab.id === 'events') {
        isTabComplete = hasEvents;
      } else if (tab.id === 'tips') {
        let scalarOk = true;
        tabFields.tips.forEach((path) => {
          let val = values;
          for (const key of path) {
            val = val?.[key];
          }
          if (val === undefined || val === null || String(val).trim() === '') {
            scalarOk = false;
          }
        });
        isTabComplete = scalarOk && hasTips;
      } else {
        tabFields[tab.id]?.forEach((path) => {
          let val = values;
          for (const key of path) {
            val = val?.[key];
          }
          if (val === undefined || val === null || String(val).trim() === '') {
            isTabComplete = false;
          }
        });
      }

      newStatuses[tab.id] = isTabComplete ? 'complete' : 'incomplete';
    });

    // Check validation errors in fields
    form.getFieldsError().forEach((errField) => {
      if (errField.errors.length > 0) {
        const parentKey = errField.name[0];
        const tabId = tabMapping[parentKey];
        if (tabId) {
          newStatuses[tabId] = 'error';
        }
      }
    });

    setTabStatuses(newStatuses);
  };

  const mapApiValidationErrorsToForm = (messages: string[], shouldScroll = true) => {
    const fieldsToSet: any[] = [];
    let firstErrorTab: string | null = null;
    let firstErrorField: any = null;

    messages.forEach((msg: string) => {
      const spaceIndex = msg.indexOf(' ');
      if (spaceIndex === -1) return;

      const pathStr = msg.substring(0, spaceIndex);
      const errorText = msg.substring(spaceIndex + 1);

      const namePath = pathStr.split('.').map(part => {
        return /^\d+$/.test(part) ? parseInt(part, 10) : part;
      });

      fieldsToSet.push({
        name: namePath,
        errors: [errorText],
      });

      if (!firstErrorTab) {
        const parentKey = namePath[0];
        if (typeof parentKey === 'string' && tabMapping[parentKey]) {
          firstErrorTab = tabMapping[parentKey];
          firstErrorField = namePath;
        }
      }
    });

    if (fieldsToSet.length > 0) {
      form.setFields(fieldsToSet);
      if (firstErrorTab) {
        setActiveTab(firstErrorTab);
        if (firstErrorField && shouldScroll) {
          setTimeout(() => {
            form.scrollToField(firstErrorField, { block: 'center' });
          }, 150);
        }
      }
      calculateProgressAndStatuses(form.getFieldsValue(true));
    }

    return firstErrorField;
  };

  const handleValidationError = (err: any) => {
    if (err?.errorFields && Array.isArray(err.errorFields) && err.errorFields.length > 0) {
      const firstErrorField = err.errorFields[0].name;
      const parentKey = firstErrorField[0];
      const targetTab = tabMapping[parentKey];
      if (targetTab) {
        setActiveTab(targetTab);
        setTimeout(() => {
          form.scrollToField(firstErrorField, { block: 'center' });
        }, 150);
      }
    }
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (existingData) {
      const formattedValues = {
        ...existingData,
        backgroundImage: existingData.backgroundImage || 'background_1',
        footer: {
          ...existingData.footer,
          credit: existingData.footer?.credit || brandName,
        },
        dates: {
          ...existingData.dates,
          weddingDatetime: existingData.dates?.weddingDatetime
            ? dayjs(existingData.dates.weddingDatetime)
            : null,
        },
      };
      form.setFieldsValue(formattedValues);
      calculateProgressAndStatuses(formattedValues);
    } else if (!isEdit) {
      form.resetFields();
      form.setFieldsValue({
        backgroundImage: 'background_1',
        footer: {
          credit: brandName,
        },
      });
      calculateProgressAndStatuses(form.getFieldsValue(true));
    }
  }, [existingData, isEdit, form]);

  // Handle Slug Change and Uniqueness Verification
  const handleSlugCheck = async (slugVal: string) => {
    if (!slugVal || slugVal.trim().length === 0) {
      setSlugStatus({ validating: false, message: 'Slug is required' });
      return;
    }
    const formatted = slugVal.toLowerCase().replace(/\s+/g, '-');
    setSlugStatus({ validating: true });
    try {
      const res = await checkSlugTrigger({ slug: formatted, excludeId: id }).unwrap();
      setSlugStatus({
        validating: false,
        available: res.available,
        message: res.available ? 'Slug is available!' : 'Slug is already taken!',
      });
    } catch {
      setSlugStatus({ validating: false, message: 'Error checking slug availability' });
    }
  };

  // Auto-generate Display Dates when Wedding Datetime changes
  const handleDatetimeChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const weddingDateDisplay = date.format('D MMMM YYYY').toUpperCase();
      const saveTheDateDisplay = `${date.format('MMMM DD - YYYY').toUpperCase()}`;
      const weddingTimeDisplay = `${date.format('h:mm A')} Onwards`;

      const nextDates = {
        ...form.getFieldValue('dates'),
        weddingDatetime: date,
        weddingDateDisplay,
        saveTheDateDisplay,
        weddingTimeDisplay,
      };

      form.setFieldsValue({ dates: nextDates });
      calculateProgressAndStatuses({ ...form.getFieldsValue(true), dates: nextDates });
    }
  };

  // Build Payload from Form Values
  const getPayload = (values: any) => {
    let targetAdminId = existingData?.adminId;
    if (isSuperAdmin) {
      targetAdminId = values.adminId !== undefined ? values.adminId : (existingData?.adminId || currentUser?.id);
    } else {
      targetAdminId = existingData?.adminId || currentUser?.id;
    }

    return {
      ...values,
      backgroundImage: values.backgroundImage || 'background_1',
      adminId: targetAdminId,
      slug: values.slug?.toLowerCase().replace(/\s+/g, '-').trim(),
      dates: {
        ...values.dates,
        weddingDatetime: values.dates?.weddingDatetime
          ? dayjs(values.dates.weddingDatetime).toISOString()
          : '',
      },
    };
  };

  // ==========================================
  // Event Modal Handlers
  // ==========================================
  const handleOpenAddEvent = () => {
    setEditingEventIndex(null);
    eventForm.resetFields();
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (index: number) => {
    setEditingEventIndex(index);
    const eventData = form.getFieldValue(['events', index]);
    eventForm.setFieldsValue(eventData || {});
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async () => {
    try {
      const values = await eventForm.validateFields();
      const currentEvents = [...(form.getFieldValue('events') || [])];

      if (editingEventIndex !== null) {
        currentEvents[editingEventIndex] = values;
      } else {
        currentEvents.push(values);
      }

      form.setFieldsValue({ events: currentEvents });
      setIsEventModalOpen(false);
      calculateProgressAndStatuses(form.getFieldsValue(true));
    } catch (error) {
      // Form fields display validation error internally
    }
  };

  const handleRemoveEvent = (index: number) => {
    const currentEvents = [...(form.getFieldValue('events') || [])];
    currentEvents.splice(index, 1);
    form.setFieldsValue({ events: currentEvents });
    calculateProgressAndStatuses(form.getFieldsValue(true));
  };

  // ==========================================
  // Tip Modal Handlers
  // ==========================================
  const handleOpenAddTip = () => {
    setEditingTipIndex(null);
    tipForm.resetFields();
    setIsTipModalOpen(true);
  };

  const handleOpenEditTip = (index: number) => {
    setEditingTipIndex(index);
    const tipData = form.getFieldValue(['thingsToKnow', 'tips', index]);
    tipForm.setFieldsValue(tipData || {});
    setIsTipModalOpen(true);
  };

  const handleSaveTip = async () => {
    try {
      const values = await tipForm.validateFields();
      const currentTips = [...(form.getFieldValue(['thingsToKnow', 'tips']) || [])];

      if (editingTipIndex !== null) {
        currentTips[editingTipIndex] = values;
      } else {
        currentTips.push(values);
      }

      const thingsToKnow = form.getFieldValue('thingsToKnow') || {};
      form.setFieldsValue({
        thingsToKnow: {
          ...thingsToKnow,
          tips: currentTips,
        },
      });
      setIsTipModalOpen(false);
      calculateProgressAndStatuses(form.getFieldsValue(true));
    } catch (error) {
      // Form fields display validation error internally
    }
  };

  const handleRemoveTip = (index: number) => {
    const currentTips = [...(form.getFieldValue(['thingsToKnow', 'tips']) || [])];
    currentTips.splice(index, 1);
    const thingsToKnow = form.getFieldValue('thingsToKnow') || {};
    form.setFieldsValue({
      thingsToKnow: {
        ...thingsToKnow,
        tips: currentTips,
      },
    });
    calculateProgressAndStatuses(form.getFieldsValue(true));
  };

  // ==========================================
  // JSON Copy & Paste Handlers
  // ==========================================
  const handleCopyJson = async () => {
    try {
      const values = form.getFieldsValue(true);
      const payload = getPayload(values);

      const logoSrc = payload.couple?.logoSrc || values.couple?.logoSrc || existingData?.couple?.logoSrc || '';
      const photoSrc = payload.couple?.photoSrc || values.couple?.photoSrc || existingData?.couple?.photoSrc || '';
      const musicSrc = payload.music?.src || values.music?.src || existingData?.music?.src || '';

      const necessaryPayload = {
        slug: payload.slug || '',
        backgroundImage: payload.backgroundImage || 'background_1',
        couple: {
          groomName: payload.couple?.groomName || '',
          brideName: payload.couple?.brideName || '',
          logoSrc: logoSrc,
          logoAlt: payload.couple?.logoAlt || '',
          photoSrc: photoSrc,
          photoAlt: payload.couple?.photoAlt || '',
        },
        dates: {
          weddingDatetime: payload.dates?.weddingDatetime || '',
          weddingDateDisplay: payload.dates?.weddingDateDisplay || '',
          saveTheDateDisplay: payload.dates?.saveTheDateDisplay || '',
          weddingTimeDisplay: payload.dates?.weddingTimeDisplay || '',
        },
        hero: {
          introText: payload.hero?.introText || '',
        },
        inviteCard: {
          loveMessage: payload.inviteCard?.loveMessage || '',
          subtitle: payload.inviteCard?.subtitle || '',
        },
        events: (payload.events || []).map((e: any) => ({
          title: e.title || '',
          date: e.date || '',
          venue: e.venue || '',
          time: e.time || '',
          mapLink: e.mapLink || '',
        })),
        meetSection: {
          labelTop: payload.meetSection?.labelTop || '',
          title: payload.meetSection?.title || '',
          sectionHeading: payload.meetSection?.sectionHeading || '',
          bio: payload.meetSection?.bio || '',
        },
        messageSection: {
          title: payload.messageSection?.title || '',
          paragraph1: payload.messageSection?.paragraph1 || '',
          paragraph2: payload.messageSection?.paragraph2 || '',
          ctaBadge: payload.messageSection?.ctaBadge || '',
        },
        countdownSection: {
          gettingMarriedText: payload.countdownSection?.gettingMarriedText || '',
          message: payload.countdownSection?.message || '',
        },
        thingsToKnow: {
          labelTop: payload.thingsToKnow?.labelTop || '',
          title: payload.thingsToKnow?.title || '',
          description: payload.thingsToKnow?.description || '',
          surpriseMessage: payload.thingsToKnow?.surpriseMessage || '',
          tips: (payload.thingsToKnow?.tips || []).map((t: any) => ({
            iconType: t.iconType || 'hashtag',
            title: t.title || '',
            text: t.text || '',
          })),
        },
        social: {
          instagramHandle: payload.social?.instagramHandle || '',
          instagramLink: payload.social?.instagramLink || '',
          instagramHandle2: payload.social?.instagramHandle2 || '',
          instagramLink2: payload.social?.instagramLink2 || '',
        },
        footer: {
          credit: payload.footer?.credit || '',
        },
        music: {
          src: musicSrc,
          volume: payload.music?.volume ?? existingData?.music?.volume ?? 0.7,
        },
      };

      const jsonString = JSON.stringify(necessaryPayload, null, 2);
      await navigator.clipboard.writeText(jsonString);

      notification.success({
        message: 'JSON Copied to Clipboard',
        description: 'The invitation configuration has been copied successfully.',
      });
    } catch {
      notification.error({
        message: 'Copy Failed',
        description: 'An error occurred while copying JSON to clipboard.',
      });
    }
  };

  const handleApplyPastedJson = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) {
      notification.warning({
        message: 'Empty JSON',
        description: 'Please paste valid JSON content before applying.',
      });
      return;
    }

    try {
      const jsonContent = JSON.parse(trimmed);

      if (typeof jsonContent !== 'object' || jsonContent === null) {
        notification.error({
          message: 'Invalid JSON',
          description: 'The pasted content is not a valid JSON object.',
        });
        return;
      }

      if (!jsonContent.couple && !jsonContent.dates && !jsonContent.slug) {
        notification.error({
          message: 'Invalid Format',
          description: 'The JSON must contain at least wedding couple, dates, or slug details.',
        });
        return;
      }

      if (!jsonContent.backgroundImage) {
        jsonContent.backgroundImage = 'background_1';
      }

      // Dynamic slug generation if slug is missing from the pasted JSON
      if (!jsonContent.slug && jsonContent.couple?.groomName && jsonContent.couple?.brideName) {
        const groomClean = String(jsonContent.couple.groomName)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const brideClean = String(jsonContent.couple.brideName)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        let generatedSlug = '';
        if (groomClean && brideClean) {
          generatedSlug = `${groomClean}-weds-${brideClean}`;
        } else if (groomClean) {
          generatedSlug = groomClean;
        } else if (brideClean) {
          generatedSlug = brideClean;
        }

        if (generatedSlug) {
          jsonContent.slug = generatedSlug.replace(/-+/g, '-').replace(/^-|-$/g, '');
        }
      }

      // Normalize couple photo and logo sources if present under alternative keys
      if (jsonContent.couple) {
        if (!jsonContent.couple.photoSrc && jsonContent.meetSection?.imageSrc) {
          jsonContent.couple.photoSrc = jsonContent.meetSection.imageSrc;
        }
        if (!jsonContent.couple.photoSrc && jsonContent.couple.imageSrc) {
          jsonContent.couple.photoSrc = jsonContent.couple.imageSrc;
        }
        if (!jsonContent.couple.logoSrc && jsonContent.logoSrc) {
          jsonContent.couple.logoSrc = jsonContent.logoSrc;
        }
      }

      // Format weddingDatetime as a dayjs object for the Ant Design DatePicker
      if (jsonContent.dates && jsonContent.dates.weddingDatetime) {
        jsonContent.dates.weddingDatetime = dayjs(jsonContent.dates.weddingDatetime);
      }

      form.setFieldsValue(jsonContent);
      calculateProgressAndStatuses(form.getFieldsValue(true));

      setIsPasteModalOpen(false);
      setPastedJsonText('');

      notification.success({
        message: 'Configuration Applied',
        description: 'The fields have been populated with the pasted JSON successfully.',
      });
    } catch (err: any) {
      notification.error({
        message: 'JSON Parse Error',
        description: err?.message || 'Invalid JSON syntax. Please check for missing quotes or brackets.',
      });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPastedJsonText(text);
        notification.info({
          message: 'Clipboard Content Loaded',
          description: 'Review or edit the JSON, then click "Apply & Populate Fields".',
        });
      }
    } catch {
      notification.warning({
        message: 'Clipboard Access Restricted',
        description: 'Please paste your JSON directly into the box using Ctrl+V / Cmd+V.',
      });
    }
  };

  // Submit as Draft
  const onSaveDraft = async () => {
    try {
      const values = await form.validateFields([
        'slug',
        'backgroundImage',
        ['couple', 'groomName'],
        ['couple', 'brideName'],
        ['dates', 'weddingDatetime'],
      ]);
      const fullValues = form.getFieldsValue(true);
      const payload = getPayload({ ...fullValues, ...values });

      if (isEdit) {
        await updateDraft({ id: id!, data: payload }).unwrap();
        notification.success({ message: 'Draft updated successfully!' });
      } else {
        const res = await createDraft(payload).unwrap();
        notification.success({ message: 'Draft saved successfully!' });
        const newId = res?.id || res?._id;
        if (newId) {
          navigate(`/admin/invitations/${newId}/edit`, { replace: true });
        }
      }
    } catch (err: any) {
      if (err?.status === 400 && err?.data && Array.isArray(err.data.message)) {
        const firstField = mapApiValidationErrorsToForm(err.data.message, false);
        showApiErrorModal('Save Draft Failed', err, () => {
          if (firstField) {
            setTimeout(() => {
              form.scrollToField(firstField, { block: 'center' });
            }, 100);
          }
        });
      } else if (err?.errorFields && Array.isArray(err.errorFields)) {
        handleValidationError(err);
        notification.error({
          message: 'Validation Failed',
          description: 'Please correct the highlighted fields in the form.',
        });
      } else {
        showApiErrorModal('Save Draft Failed', err);
      }
    }
  };

  // Submit as Publish
  const onPublish = async () => {
    try {
      const values = await form.validateFields();
      const fullValues = form.getFieldsValue(true);
      const payload = getPayload({ ...fullValues, ...values });

      if (isEdit) {
        await updatePublished({ id: id!, data: payload }).unwrap();
        notification.success({ message: 'Invitation published/updated successfully!' });
      } else {
        await publishInvitation(payload).unwrap();
        notification.success({ message: 'Invitation published successfully!' });
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      if (err?.status === 400 && err?.data && Array.isArray(err.data.message)) {
        const firstField = mapApiValidationErrorsToForm(err.data.message, false);
        showApiErrorModal('Publish Failed', err, () => {
          if (firstField) {
            setTimeout(() => {
              form.scrollToField(firstField, { block: 'center' });
            }, 100);
          }
        });
      } else if (err?.errorFields && Array.isArray(err.errorFields)) {
        handleValidationError(err);
        notification.error({
          message: 'Validation Failed',
          description: 'Please complete all required fields correctly before publishing.',
        });
      } else {
        showApiErrorModal('Publish Invitation Failed', err);
      }
    }
  };

  const nextTab = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const prevTab = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'save_draft',
      label: 'Save Draft',
      icon: <FiSave className="text-sm" />,
      onClick: onSaveDraft,
      disabled: isDraftSaving || isDraftUpdating,
    },
    {
      key: 'paste_json',
      label: 'Paste JSON',
      icon: <FiClipboard className="text-sm" />,
      onClick: () => setIsPasteModalOpen(true),
    },
    {
      key: 'copy_json',
      label: 'Copy JSON',
      icon: <FiCopy className="text-sm" />,
      onClick: handleCopyJson,
    },
  ];

  if (isEdit && isLoadingExisting) {
    return <LuxuryLoader tip="Loading Invitation Data..." fullScreen={false} />;
  }

  return (
    <div className="w-full pb-12">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 bg-zinc-900 border border-zinc-800/80 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Back to Dashboard"
          >
            <FiArrowLeft className="text-lg" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-serif font-bold text-white tracking-wide bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                {isEdit ? 'Edit Wedding Invitation' : 'Create New Wedding Invitation'}
              </h1>
              {isEdit && existingData && (
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1.5" title="Total Views">
                    <FiEye className="text-zinc-400" /> {existingData.views || 0} views
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5" title="Total Wishes & Du'a Received">
                    <FiHeart className="text-rose-400" /> {existingData.wishesCount || 0} wishes
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">Configure invitation page custom contents</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap sm:flex-nowrap">
          {/* Direct Paste JSON Button */}
          <button
            type="button"
            onClick={() => setIsPasteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950 border border-zinc-800 hover:border-violet-500/60 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer h-10 shrink-0"
            title="Paste JSON to populate form"
          >
            <FiClipboard className="text-sm text-violet-400" />
            <span>Paste JSON</span>
          </button>

          {/* Direct Copy JSON Button */}
          <button
            type="button"
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950 border border-zinc-800 hover:border-violet-500/60 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer h-10 shrink-0"
            title="Copy current invitation configuration as JSON"
          >
            <FiCopy className="text-sm text-violet-400" />
            <span>Copy JSON</span>
          </button>

          <button
            onClick={onPublish}
            disabled={isPublishing || isPublishUpdating}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl border border-transparent shadow-lg shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-55 h-10 whitespace-nowrap text-xs sm:text-sm"
          >
            <FiSend className="text-base" />
            <span>{isEdit ? 'Update & Publish' : 'Publish Invitation'}</span>
          </button>

          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button
              type="button"
              className="flex items-center justify-center p-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer h-10 w-10 shrink-0"
              title="More Actions"
            >
              <FiMoreVertical className="text-lg" />
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Form Completion Progress Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-zinc-300">Required Info Form Completion</div>
          <div className="text-sm font-bold text-violet-400 font-mono">{progress}%</div>
        </div>
        <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
          <div
            className="h-full progress-bar-glow rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        preserve={true}
        initialValues={{
          backgroundImage: 'background_1',
          footer: { credit: brandName },
        }}
        onValuesChange={(_, allValues) => calculateProgressAndStatuses(allValues)}
        onFieldsChange={() => {
          calculateProgressAndStatuses(form.getFieldsValue(true));
        }}
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Tab Navigation on Left */}
          <div className="hidden md:flex flex-col gap-1.5 w-64 shrink-0 bg-zinc-900 border border-zinc-800/80 p-3 rounded-2xl">
            {tabs.map((tab) => {
              const status = tabStatuses[tab.id] || 'incomplete';
              let badgeColor = 'bg-zinc-800 text-zinc-500';
              let badgeText = '•';
              if (status === 'complete') {
                badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
                badgeText = '✓';
              } else if (status === 'error') {
                badgeColor = 'bg-red-500/15 text-red-400 border border-red-500/25 animate-pulse';
                badgeText = '!';
              }

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${activeTab === tab.id
                    ? 'bg-violet-600/10 text-violet-400 border-violet-500/20 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50 border-transparent'
                    }`}
                >
                  <span className="truncate">{tab.label}</span>
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-extrabold shrink-0 ml-2 ${badgeColor}`}>
                    {badgeText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Tab Dropdown */}
          <div className="w-full md:hidden">
            <AppInput
              type="select"
              value={activeTab}
              onChange={(val) => setActiveTab(val)}
              options={tabs.map((t) => ({ label: t.label, value: t.id }))}
            />
          </div>

          {/* Tab Content Panel on Right */}
          <div className="flex-1 w-full bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-xl min-h-[450px] flex flex-col justify-between">
            <div>
              {/* Tab 1: General Info */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200 ${activeTab === 'general' ? '' : 'hidden'}`}>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">Background Theme & URL</h3>
                  <p className="text-xs text-zinc-400">Choose your template background image and define the unique URL path slug for your invitation.</p>
                </div>
                <div className="h-px bg-zinc-850 w-full" />

                {/* 3 Background Image Options Selector */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                        Select Template Background
                      </span>
                      <span className="text-xs text-zinc-400">
                        Choose 1 of the 3 templates below. The selected design will be displayed in the template.
                      </span>
                    </div>
                  </div>

                  <Form.Item
                    name="backgroundImage"
                    initialValue="background_1"
                    rules={[{ required: true, message: 'Please select a background theme' }]}
                    className="mb-0"
                  >
                    <BackgroundSelector />
                  </Form.Item>
                </div>

                <div className="h-px bg-zinc-850/60 w-full" />

                <Form.Item
                  name="slug"
                  label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Unique URL Slug</span>}
                  rules={[
                    { required: true, message: 'Slug is required' },
                    {
                      pattern: /^[a-z0-9-]+$/,
                      message: 'Only lowercase letters, numbers, and hyphens allowed',
                    },
                  ]}
                  extra={
                    slugStatus.message && (
                      <div
                        className={`text-xs font-semibold mt-2 flex items-center gap-1 ${slugStatus.available ? 'text-emerald-400' : 'text-red-400'
                          }`}
                      >
                        <FiInfo /> {slugStatus.message}
                      </div>
                    )
                  }
                >
                  <AppInput
                    type="text"
                    placeholder="e.g. groom-weds-bride"
                    onChange={(val) => handleSlugCheck(val)}
                    addonBefore={`${window.location.origin}/`}
                  />
                </Form.Item>

                {isSuperAdmin && (
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider block">
                          👑 Assign Invitation to Admin
                        </span>
                        <span className="text-xs text-zinc-400">
                          Choose which administrator owns and manages this invitation in their CMS dashboard.
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Super Admin
                      </span>
                    </div>

                    <Form.Item name="adminId" className="mb-0">
                      <Select
                        className="w-full h-10"
                        placeholder="Select an admin to assign (or keep as yourself)..."
                        allowClear
                        options={adminList
                          .filter((admin) => admin.role !== 'super_admin')
                          .map((admin) => ({
                            value: admin.id,
                            label: `${admin.name || admin.email} (⚡ Admin)`,
                          }))}
                      />
                    </Form.Item>
                  </div>
                )}
              </div>

              {/* Tab 2: Couple Info */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200 ${activeTab === 'couple' ? '' : 'hidden'}`}>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">Groom & Bride Details</h3>
                  <p className="text-xs text-zinc-400">Enter names and logo iconography for the couple.</p>
                </div>
                <div className="h-px bg-zinc-850 w-full" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name={['couple', 'groomName']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Groom Name</span>}
                    rules={[{ required: true, message: 'Groom Name is required' }]}
                  >
                    <AppInput type="text" placeholder="Groom's Full Name" />
                  </Form.Item>

                  <Form.Item
                    name={['couple', 'brideName']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Bride Name</span>}
                    rules={[{ required: true, message: 'Bride Name is required' }]}
                  >
                    <AppInput type="text" placeholder="Bride's Full Name" />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name={['couple', 'logoSrc']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Logo Image</span>}
                  >
                    <AppInput type="file" uploadType="image" accept="image/*" />
                  </Form.Item>

                  <Form.Item
                    name={['couple', 'logoAlt']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Logo Alt Text</span>}
                  >
                    <AppInput type="text" placeholder="e.g. Groom & Bride Initials Logo" />
                  </Form.Item>
                </div>
              </div>

              {/* Tab 3: Dates */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200 ${activeTab === 'dates' ? '' : 'hidden'}`}>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">Wedding Dates & Display</h3>
                  <p className="text-xs text-zinc-400">Set the target countdown timestamp and customized formats to display on the page.</p>
                </div>
                <div className="h-px bg-zinc-850 w-full" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name={['dates', 'weddingDatetime']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Wedding Datetime (Countdown target)</span>}
                    rules={[{ required: true, message: 'Wedding Datetime is required' }]}
                  >
                    <AppInput type="datetime" onChange={handleDatetimeChange} />
                  </Form.Item>

                  <Form.Item
                    name={['dates', 'weddingDateDisplay']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hero Date Display</span>}
                    rules={[{ required: true, message: 'Hero Date Display is required' }]}
                  >
                    <AppInput type="text" placeholder="e.g. 6 JULY 2026" />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name={['dates', 'saveTheDateDisplay']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Save The Date Display</span>}
                    rules={[{ required: true, message: 'Save The Date Display is required' }]}
                  >
                    <AppInput type="text" placeholder="e.g. JULY 06 - 2026" />
                  </Form.Item>

                  <Form.Item
                    name={['dates', 'weddingTimeDisplay']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Wedding Time Display</span>}
                    rules={[{ required: true, message: 'Wedding Time Display is required' }]}
                  >
                    <AppInput type="text" placeholder="e.g. 6:15 AM - 7:15 AM" />
                  </Form.Item>
                </div>
              </div>

              {/* Tab 4: Hero & Card */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200 ${activeTab === 'hero' ? '' : 'hidden'}`}>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">Hero Intro & Invitation Card</h3>
                  <p className="text-xs text-zinc-400">Configure welcome greetings, captions, and quotes for the main screen layout.</p>
                </div>
                <div className="h-px bg-zinc-850 w-full" />

                <Form.Item
                  name={['hero', 'introText']}
                  label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Introductory Text</span>}
                  rules={[{ required: true, message: 'Introductory text is required' }]}
                >
                  <AppInput type="textarea" placeholder="Welcome greetings or intro text..." rows={3} />
                </Form.Item>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name={['inviteCard', 'subtitle']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Invitation Card Subtitle</span>}
                    rules={[{ required: true, message: 'Card subtitle is required' }]}
                  >
                    <AppInput type="text" placeholder="e.g. We invite you to join us" />
                  </Form.Item>

                  <Form.Item
                    name={['inviteCard', 'loveMessage']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Love Message Quote</span>}
                    rules={[{ required: true, message: 'Love quote message is required' }]}
                  >
                    <AppInput type="text" placeholder="e.g. Love is patient, love is kind..." />
                  </Form.Item>
                </div>
              </div>


              {/* Tab 5: Events list */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200 ${activeTab === 'events' ? '' : 'hidden'}`}>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">Wedding Events Schedule</h3>
                  <p className="text-xs text-zinc-400">Add detailed schedules, addresses, and maps navigation URL for each separate function.</p>
                </div>
                <div className="h-px bg-zinc-850 w-full" />


                <Form.List
                  name="events"
                  rules={[
                    {
                      validator: async (_, value) => {
                        if (!value || value.length < 1) {
                          return Promise.reject(new Error('At least one wedding event is required'));
                        }
                      },
                    },
                  ]}
                >
                  {(fields, { add, remove }, { errors }) => (
                    <div className="space-y-4">
                      {errors && errors.length > 0 && (
                        <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs font-semibold text-red-400">
                          {errors[0]}
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4">
                        {fields.map(({ key, name }) => {
                          const eventData = form.getFieldValue(['events', name]) || {};
                          return (
                            <div
                              key={key}
                              className="bg-zinc-950/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner hover:border-zinc-700/80 transition-all duration-300"
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-violet-400 font-serif tracking-wider truncate mb-1.5">
                                  {eventData.title || 'Untitled Event'}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-400 font-mono">
                                  <div className="truncate"><span className="text-zinc-500">Date:</span> {eventData.date || 'N/A'}</div>
                                  <div className="truncate"><span className="text-zinc-500">Time:</span> {eventData.time || 'N/A'}</div>
                                  <div className="truncate sm:col-span-2"><span className="text-zinc-500">Venue:</span> {eventData.venue || 'N/A'}</div>
                                  {eventData.mapLink && (
                                    <div className="truncate sm:col-span-2 text-violet-400 hover:underline">
                                      <span className="text-zinc-500">Map:</span> <a href={eventData.mapLink} target="_blank" rel="noreferrer">{eventData.mapLink}</a>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditEvent(name)}
                                  className="p-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-center"
                                  title="Edit Event"
                                >
                                  <FiEdit2 className="text-sm" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEvent(name)}
                                  className="p-2.5 bg-red-950/15 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded-xl border border-red-950/20 hover:border-red-900/30 transition-all cursor-pointer flex items-center justify-center"
                                  title="Remove Event"
                                >
                                  <FiTrash2 className="text-sm" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenAddEvent}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-zinc-800 hover:border-violet-500/50 hover:bg-violet-500/5 text-zinc-400 hover:text-violet-400 font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        <FiPlus /> Add Event Function
                      </button>
                    </div>
                  )}
                </Form.List>
              </div>


              {/* Tab 6: Stories and Bio quotes */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200 ${activeTab === 'bio' ? '' : 'hidden'}`}>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">Meet Couple Story & Message Section</h3>
                  <p className="text-xs text-zinc-400">Configure headings, descriptions, and photo illustrations for the personal quote section.</p>
                </div>
                <div className="h-px bg-zinc-850 w-full" />

                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest">A. Meet Section (Story Bio)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Form.Item
                      name={['meetSection', 'labelTop']}
                      label={<span className="text-xs font-semibold text-zinc-500">Top Label</span>}
                      rules={[{ required: true, message: 'Top label is required' }]}
                    >
                      <AppInput type="text" placeholder="e.g. WELCOME TO OUR DAY" />
                    </Form.Item>
                    <Form.Item
                      name={['meetSection', 'title']}
                      label={<span className="text-xs font-semibold text-zinc-500">Section Title</span>}
                      rules={[{ required: true, message: 'Section title is required' }]}
                    >
                      <AppInput type="text" placeholder="e.g. The Couple" />
                    </Form.Item>
                    <Form.Item
                      name={['meetSection', 'sectionHeading']}
                      label={<span className="text-xs font-semibold text-zinc-500">Section Heading</span>}
                      rules={[{ required: true, message: 'Section heading is required' }]}
                    >
                      <AppInput type="text" placeholder="e.g. Groom & Bride" />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name={['meetSection', 'bio']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Couple Bio Quote Message</span>}
                    rules={[{ required: true, message: 'Bio message is required' }]}
                  >
                    <AppInput type="textarea" placeholder="Enter couple bio or description quote..." rows={3} />
                  </Form.Item>

                  <Form.Item
                    name={['couple', 'photoSrc']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Couple Photo / Illustration</span>}
                  >
                    <AppInput type="file" uploadType="image" accept="image/*" />
                  </Form.Item>
                </div>

                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest">B. Message CTA Section</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                      name={['messageSection', 'title']}
                      label={<span className="text-xs font-semibold text-zinc-500">Section Title</span>}
                      rules={[{ required: true, message: 'Section title is required' }]}
                    >
                      <AppInput type="text" placeholder="e.g. Be Part of Our Story" />
                    </Form.Item>
                    <Form.Item
                      name={['messageSection', 'ctaBadge']}
                      label={<span className="text-xs font-semibold text-zinc-500">CTA Badge Text</span>}
                      rules={[{ required: true, message: 'CTA badge is required' }]}
                    >
                      <AppInput type="text" placeholder="e.g. POST WISHES" />
                    </Form.Item>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                      name={['messageSection', 'paragraph1']}
                      label={<span className="text-xs font-semibold text-zinc-500">Paragraph 1</span>}
                      rules={[{ required: true, message: 'Paragraph 1 is required' }]}
                    >
                      <AppInput type="text" placeholder="Wishes paragraph column 1 text" />
                    </Form.Item>
                    <Form.Item
                      name={['messageSection', 'paragraph2']}
                      label={<span className="text-xs font-semibold text-zinc-500">Paragraph 2</span>}
                      rules={[{ required: true, message: 'Paragraph 2 is required' }]}
                    >
                      <AppInput type="text" placeholder="Wishes paragraph column 2 text" />
                    </Form.Item>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest">C. Bottom Countdown Text</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                      name={['countdownSection', 'gettingMarriedText']}
                      label={<span className="text-xs font-semibold text-zinc-500">Header Text</span>}
                      rules={[{ required: true, message: 'Getting married header text is required' }]}
                    >
                      <AppInput type="text" placeholder="e.g. COUNTING DOWN" />
                    </Form.Item>
                    <Form.Item
                      name={['countdownSection', 'message']}
                      label={<span className="text-xs font-semibold text-zinc-500">Countdown Message Quote</span>}
                      rules={[{ required: true, message: 'Countdown quote message is required' }]}
                    >
                      <AppInput type="text" placeholder="e.g. To the day we say I Do" />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Tab 7: Tips & surprise messages */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200 ${activeTab === 'tips' ? '' : 'hidden'}`}>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">Things to Know & Tips</h3>
                  <p className="text-xs text-zinc-400">Configure guidelines, tips, hashtags, dress codes, or general info items for the wedding.</p>
                </div>
                <div className="h-px bg-zinc-850 w-full" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name={['thingsToKnow', 'labelTop']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Top Label</span>}
                    rules={[{ required: true, message: 'Top label is required' }]}
                  >
                    <AppInput type="text" placeholder="e.g. INFORMATION" />
                  </Form.Item>
                  <Form.Item
                    name={['thingsToKnow', 'title']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Section Title</span>}
                    rules={[{ required: true, message: 'Title is required' }]}
                  >
                    <AppInput type="text" placeholder="e.g. Things to Know" />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name={['thingsToKnow', 'description']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</span>}
                    rules={[{ required: true, message: 'Description is required' }]}
                  >
                    <AppInput type="text" placeholder="Brief general info description..." />
                  </Form.Item>
                  <Form.Item
                    name={['thingsToKnow', 'surpriseMessage']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Surprise Message</span>}
                    rules={[{ required: true, message: 'Surprise message is required' }]}
                  >
                    <AppInput type="text" placeholder="e.g. Dress Code, Gift Info, Hashtags" />
                  </Form.Item>
                </div>

                <div className="border-t border-zinc-850 pt-4">
                  <h4 className="text-sm font-serif font-bold text-white mb-3">Dynamic Tips Cards</h4>
                  <Form.List
                    name={['thingsToKnow', 'tips']}
                    rules={[
                      {
                        validator: async (_, value) => {
                          if (!value || value.length < 1) {
                            return Promise.reject(new Error('At least one tip card is required'));
                          }
                        },
                      },
                    ]}
                  >
                    {(fields, { add, remove }, { errors }) => (
                      <div className="space-y-4">
                        {errors && errors.length > 0 && (
                          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs font-semibold text-red-400">
                            {errors[0]}
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                          {fields.map(({ key, name }) => {
                            const tipData = form.getFieldValue(['thingsToKnow', 'tips', name]) || {};
                            return (
                              <div
                                key={key}
                                className="bg-zinc-950/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner hover:border-zinc-700/80 transition-all duration-300"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2.5 mb-1.5">
                                    <span className="text-sm">
                                      {tipData.iconType === 'map' ? '📍' : '#️⃣'}
                                    </span>
                                    <h4 className="text-sm font-bold text-violet-400 font-serif tracking-wider truncate">
                                      {tipData.title || 'Untitled Tip'}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                                    {tipData.text || 'No description content provided'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditTip(name)}
                                    className="p-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-center"
                                    title="Edit Tip"
                                  >
                                    <FiEdit2 className="text-sm" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTip(name)}
                                    className="p-2.5 bg-red-950/15 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded-xl border border-red-950/20 hover:border-red-900/30 transition-all cursor-pointer flex items-center justify-center"
                                    title="Remove Tip"
                                  >
                                    <FiTrash2 className="text-sm" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={handleOpenAddTip}
                          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-zinc-800 hover:border-violet-500/50 hover:bg-violet-500/5 text-zinc-400 hover:text-violet-400 font-semibold rounded-xl transition-all cursor-pointer"
                        >
                          <FiPlus /> Add Tip Card
                        </button>
                      </div>
                    )}
                  </Form.List>
                </div>
              </div>
              {/* Tab 8: Music & socials */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200 ${activeTab === 'social' ? '' : 'hidden'}`}>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">Social Links, Music & Footer</h3>
                  <p className="text-xs text-zinc-400">Configure background audio files, volume defaults, instagram sharing, and page footer credits.</p>
                </div>
                <div className="h-px bg-zinc-850 w-full" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name={['social', 'instagramHandle']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Instagram Handle 1</span>}
                    rules={[{ required: true, message: 'Instagram handle 1 is required' }]}
                  >
                    <AppInput type="text" placeholder="@wedding_hashtag" />
                  </Form.Item>

                  <Form.Item
                    name={['social', 'instagramLink']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Instagram Link URL 1</span>}
                    rules={[{ required: true, message: 'Instagram link URL 1 is required' }]}
                  >
                    <AppInput type="text" placeholder="https://instagram.com/tags/..." />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name={['social', 'instagramHandle2']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Instagram Handle 2 (Optional)</span>}
                  >
                    <AppInput type="text" placeholder="@another_handle" />
                  </Form.Item>

                  <Form.Item
                    name={['social', 'instagramLink2']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Instagram Link URL 2 (Optional)</span>}
                  >
                    <AppInput type="text" placeholder="https://instagram.com/another..." />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name={['footer', 'credit']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Footer Credits</span>}
                    rules={[{ required: true, message: 'Footer credits are required' }]}
                    initialValue={brandName}
                  >
                    <AppInput type="text" placeholder={`e.g. ${brandName}`} />
                  </Form.Item>

                  <Form.Item
                    name={['music', 'src']}
                    label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Background Music MP3 (Optional)</span>}
                  >
                    <AppInput type="file" uploadType="audio" accept="audio/*" />
                  </Form.Item>
                </div>

                <Form.Item
                  name={['music', 'volume']}
                  label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Default Audio Volume</span>}
                  rules={[{ required: true, message: 'Volume is required' }]}
                  initialValue={0.7}
                >
                  <AppInput type="slider" min={0} max={1} step={0.1} />
                </Form.Item>
              </div>
            </div>

            {/* Bottom Stepper Buttons inside panel wrapper */}
            <div className="border-t border-zinc-850/80 pt-6 mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={prevTab}
                disabled={tabs.findIndex((t) => t.id === activeTab) === 0}
                className="px-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous Step
              </button>

              <button
                type="button"
                onClick={nextTab}
                disabled={tabs.findIndex((t) => t.id === activeTab) === tabs.length - 1}
                className="px-5 py-2.5 rounded-xl border border-transparent bg-violet-600/15 hover:bg-violet-600/25 text-violet-400 hover:text-violet-300 text-sm font-semibold disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </Form>

      {/* Event Entry Modal */}
      <Modal
        title={
          <span className="font-serif font-bold text-lg text-white">
            {editingEventIndex !== null ? '✏️ Edit Wedding Event' : '✨ Add Wedding Event'}
          </span>
        }
        open={isEventModalOpen}
        onOk={handleSaveEvent}
        onCancel={() => setIsEventModalOpen(false)}
        okText={editingEventIndex !== null ? 'Save Changes' : 'Add Event'}
        cancelText="Cancel"
        centered
        width={520}
        destroyOnClose
        okButtonProps={{
          className: 'bg-violet-600 hover:bg-violet-500 text-white border-none font-semibold shadow-lg shadow-violet-500/20 px-5 rounded-xl h-10 cursor-pointer',
        }}
        cancelButtonProps={{
          className: 'border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-white rounded-xl h-10 cursor-pointer',
        }}
      >
        <Form
          form={eventForm}
          layout="vertical"
          className="mt-4 space-y-4"
        >
          <Form.Item
            name="title"
            label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Event Title</span>}
            rules={[{ required: true, message: 'Event Title is required' }]}
          >
            <AppInput type="text" placeholder="e.g. Reception, Holy Matrimony" />
          </Form.Item>

          <Form.Item
            name="date"
            label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Event Date String</span>}
            rules={[{ required: true, message: 'Event Date is required' }]}
          >
            <AppInput type="text" placeholder="e.g. Sunday, July 5th 2026" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="venue"
              label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Venue Address</span>}
              rules={[{ required: true, message: 'Venue address is required' }]}
            >
              <AppInput type="text" placeholder="Full venue address" />
            </Form.Item>

            <Form.Item
              name="time"
              label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Time Label</span>}
              rules={[{ required: true, message: 'Time label is required' }]}
            >
              <AppInput type="text" placeholder="e.g. 6:00 PM Onwards" />
            </Form.Item>
          </div>

          <Form.Item
            name="mapLink"
            label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Google Maps URL Link (Optional)</span>}
          >
            <AppInput type="text" placeholder="https://maps.app.goo.gl/..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Tip Entry Modal */}
      <Modal
        title={
          <span className="font-serif font-bold text-lg text-white">
            {editingTipIndex !== null ? '✏️ Edit Tip Item' : '✨ Add Tip Item'}
          </span>
        }
        open={isTipModalOpen}
        onOk={handleSaveTip}
        onCancel={() => setIsTipModalOpen(false)}
        okText={editingTipIndex !== null ? 'Save Changes' : 'Add Tip'}
        cancelText="Cancel"
        centered
        width={520}
        destroyOnClose
        okButtonProps={{
          className: 'bg-violet-600 hover:bg-violet-500 text-white border-none font-semibold shadow-lg shadow-violet-500/20 px-5 rounded-xl h-10 cursor-pointer',
        }}
        cancelButtonProps={{
          className: 'border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-white rounded-xl h-10 cursor-pointer',
        }}
      >
        <Form
          form={tipForm}
          layout="vertical"
          className="mt-4 space-y-4"
        >
          <Form.Item
            name="iconType"
            label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Icon Type</span>}
            rules={[{ required: true, message: 'Icon is required' }]}
            initialValue="hashtag"
          >
            <AppInput
              type="select"
              options={[
                { label: 'Hashtag (#)', value: 'hashtag' },
                { label: 'Map Pin (📍)', value: 'map' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="title"
            label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tip Title</span>}
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <AppInput type="text" placeholder="e.g. Wedding Hashtag" />
          </Form.Item>

          <Form.Item
            name="text"
            label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tip Description Content</span>}
            rules={[{ required: true, message: 'Content description is required' }]}
          >
            <AppInput type="text" placeholder="e.g. #GroomWedsBride" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Paste JSON Modal */}
      <Modal
        open={isPasteModalOpen}
        onCancel={() => {
          setIsPasteModalOpen(false);
          setPastedJsonText('');
        }}
        footer={null}
        centered
        width={680}
        destroyOnClose
        title={
          <div className="flex items-center gap-2 text-white font-serif text-lg">
            <FiClipboard className="text-violet-400" />
            <span>Paste Invitation JSON</span>
          </div>
        }
      >
        <div className="py-2 space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Paste your wedding invitation JSON configuration below to automatically populate all form fields.
          </p>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">JSON Content</span>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FiClipboard className="text-xs" /> Paste from Clipboard
            </button>
          </div>

          <textarea
            value={pastedJsonText}
            onChange={(e) => setPastedJsonText(e.target.value)}
            rows={12}
            placeholder={`{\n  "couple": {\n    "groomName": "Naveen",\n    "brideName": "Nandhini"\n  },\n  "dates": {\n    "weddingDatetime": "2026-07-06T06:15:00"\n  }\n}`}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 font-mono text-xs focus:outline-none focus:border-violet-500 resize-y leading-relaxed"
          />

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-850">
            <button
              type="button"
              onClick={() => {
                setIsPasteModalOpen(false);
                setPastedJsonText('');
              }}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleApplyPastedJson(pastedJsonText)}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-500/20 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <FiCheckCircle className="text-sm" />
              <span>Apply & Populate Fields</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvitationForm;

