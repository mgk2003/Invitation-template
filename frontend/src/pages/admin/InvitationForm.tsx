import React, { useEffect, useState } from 'react';
import { Form, notification } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  useGetInvitationQuery,
  useCreateDraftMutation,
  usePublishInvitationMutation,
  useUpdateDraftMutation,
  useUpdatePublishedMutation,
  useLazyCheckSlugQuery,
} from '../../store/services/invitationApi';
import LuxuryLoader from '../../components/loader/LuxuryLoader';
import { showApiErrorModal } from '../../utils/showApiErrorModal';
import AppInput from '../../components/common/AppInput';
import {
  FiArrowLeft,
  FiSave,
  FiSend,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';

const tabs = [
  { id: 'general', label: '1. Slug & URL' },
  { id: 'couple', label: '2. Couple Details' },
  { id: 'dates', label: '3. Wedding Dates' },
  { id: 'hero', label: '4. Hero & Card' },
  { id: 'events', label: '5. Events List' },
  { id: 'bio', label: '6. Story & Bio' },
  { id: 'tips', label: '7. Tips & Info' },
  { id: 'social', label: '8. Music & Footer' },
];

export const InvitationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('general');

  const { data: existingData, isLoading: isLoadingExisting } = useGetInvitationQuery(id!, {
    skip: !isEdit,
  });

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

  const tabMapping: Record<string, string> = {
    slug: 'general',
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
      ['couple', 'groomName'],
      ['couple', 'brideName'],
      ['couple', 'logoSrc'],
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
      general: [['slug']],
      couple: [['couple', 'groomName'], ['couple', 'brideName'], ['couple', 'logoSrc']],
      dates: [['dates', 'weddingDatetime'], ['dates', 'weddingDateDisplay'], ['dates', 'saveTheDateDisplay'], ['dates', 'weddingTimeDisplay']],
      hero: [['hero', 'introText'], ['inviteCard', 'loveMessage'], ['inviteCard', 'subtitle']],
      events: [],
      bio: [
        ['meetSection', 'labelTop'], ['meetSection', 'title'], ['meetSection', 'sectionHeading'], ['meetSection', 'bio'],
        ['messageSection', 'title'], ['messageSection', 'paragraph1'], ['messageSection', 'paragraph2'], ['messageSection', 'ctaBadge'],
        ['countdownSection', 'gettingMarriedText'], ['countdownSection', 'message']
      ],
      tips: [['thingsToKnow', 'labelTop'], ['thingsToKnow', 'title'], ['thingsToKnow', 'description'], ['thingsToKnow', 'surpriseMessage']],
      social: [['footer', 'credit']],
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

  const mapApiValidationErrorsToForm = (messages: string[]) => {
    const fieldsToSet: any[] = [];
    let firstErrorTab: string | null = null;

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
        }
      }
    });

    if (fieldsToSet.length > 0) {
      form.setFields(fieldsToSet);
      if (firstErrorTab) {
        setActiveTab(firstErrorTab);
      }
    }
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (existingData) {
      const formattedValues = {
        ...existingData,
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
    return {
      ...values,
      slug: values.slug?.toLowerCase().replace(/\s+/g, '-').trim(),
      dates: {
        ...values.dates,
        weddingDatetime: values.dates?.weddingDatetime
          ? dayjs(values.dates.weddingDatetime).toISOString()
          : '',
      },
    };
  };

  // Submit as Draft
  const onSaveDraft = async () => {
    try {
      const values = await form.validateFields([
        'slug',
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
        await createDraft(payload).unwrap();
        notification.success({ message: 'Draft saved successfully!' });
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      if (err?.status === 400 && err?.data && Array.isArray(err.data.message)) {
        mapApiValidationErrorsToForm(err.data.message);
        notification.error({
          message: 'Save Draft Failed',
          description: 'The server rejected draft data. Please fix the highlighted fields.',
        });
      } else if (err?.errorFields && Array.isArray(err.errorFields)) {
        // Form field error
        const firstErrorField = err.errorFields[0].name;
        const parentKey = firstErrorField[0];
        const targetTab = tabMapping[parentKey];
        if (targetTab) {
          setActiveTab(targetTab);
        }
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
      const payload = getPayload(values);

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
        mapApiValidationErrorsToForm(err.data.message);
        notification.error({
          message: 'Publish Failed',
          description: 'The server validation failed. Please check the highlighted fields.',
        });
      } else if (err?.errorFields && Array.isArray(err.errorFields)) {
        // Form field error
        const firstErrorField = err.errorFields[0].name;
        const parentKey = firstErrorField[0];
        const targetTab = tabMapping[parentKey];
        if (targetTab) {
          setActiveTab(targetTab);
        }
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

  if (isEdit && isLoadingExisting) {
    return <LuxuryLoader tip="Loading Invitation Data..." fullScreen={false} />;
  }

  return (
    <div className="w-full pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-zinc-900 border border-zinc-800/80 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Back to Dashboard"
          >
            <FiArrowLeft className="text-lg" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
              {isEdit ? 'Edit Wedding CMS' : 'Create New Wedding Invitation'}
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">Configure invitation page custom contents</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onSaveDraft}
            disabled={isDraftSaving || isDraftUpdating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <FiSave className="text-base" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={onPublish}
            disabled={isPublishing || isPublishUpdating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-55"
          >
            <FiSend className="text-base" />
            <span>{isEdit ? 'Update & Publish' : 'Publish Invitation'}</span>
          </button>
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                    activeTab === tab.id
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
              {activeTab === 'general' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-1.5 duration-200">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white mb-1">Unique URL Configuration</h3>
                    <p className="text-xs text-zinc-400">Define the unique URL path slug where your invitation will be published.</p>
                  </div>
                  <div className="h-px bg-zinc-850 w-full" />
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
                          className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                            slugStatus.available ? 'text-emerald-400' : 'text-red-400'
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
                </div>
              )}

              {/* Tab 2: Couple Info */}
              {activeTab === 'couple' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200">
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
                      rules={[{ required: true, message: 'Logo is required' }]}
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
              )}

              {/* Tab 3: Dates */}
              {activeTab === 'dates' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200">
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
              )}

              {/* Tab 4: Hero & Card */}
              {activeTab === 'hero' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200">
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
              )}


              {/* Tab 5: Events list */}
              {activeTab === 'events' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200">
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

                        {fields.map(({ key, name, ...restField }) => (
                          <div
                            key={key}
                            className="bg-zinc-950 border border-zinc-850 p-4.5 rounded-xl space-y-4 relative group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                                Event Function #{name + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => remove(name)}
                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                title="Remove Event"
                              >
                                <FiTrash2 />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Form.Item
                                {...restField}
                                name={[name, 'title']}
                                label={<span className="text-xs font-semibold text-zinc-500">Event Title</span>}
                                rules={[{ required: true, message: 'Title required' }]}
                              >
                                <AppInput type="text" placeholder="e.g. Reception, Holy Matrimony" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'date']}
                                label={<span className="text-xs font-semibold text-zinc-500">Event Date String</span>}
                                rules={[{ required: true, message: 'Date required' }]}
                              >
                                <AppInput type="text" placeholder="e.g. Sunday, July 5th 2026" />
                              </Form.Item>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Form.Item
                                {...restField}
                                name={[name, 'venue']}
                                label={<span className="text-xs font-semibold text-zinc-500">Venue Address</span>}
                                rules={[{ required: true, message: 'Venue required' }]}
                              >
                                <AppInput type="text" placeholder="Full venue street address" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'time']}
                                label={<span className="text-xs font-semibold text-zinc-500">Time Label</span>}
                                rules={[{ required: true, message: 'Time required' }]}
                              >
                                <AppInput type="text" placeholder="e.g. 6:00 PM Onwards" />
                              </Form.Item>
                            </div>

                            <Form.Item
                              {...restField}
                              name={[name, 'mapLink']}
                              label={<span className="text-xs font-semibold text-zinc-500">Google Maps URL Link</span>}
                            >
                              <AppInput type="text" placeholder="https://maps.app.goo.gl/..." />
                            </Form.Item>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => add()}
                          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-zinc-800 hover:border-violet-500/50 hover:bg-violet-500/5 text-zinc-400 hover:text-violet-400 font-semibold rounded-xl transition-all cursor-pointer"
                        >
                          <FiPlus /> Add Event Function
                        </button>
                      </div>
                    )}
                  </Form.List>
                </div>
              )}


              {/* Tab 6: Stories and Bio quotes */}
              {activeTab === 'bio' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200">
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
              )}

              {/* Tab 7: Tips & surprise messages */}
              {activeTab === 'tips' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200">
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

                          {fields.map(({ key, name, ...restField }) => (
                            <div
                              key={key}
                              className="bg-zinc-950 border border-zinc-850 p-4.5 rounded-xl space-y-4 relative group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                                  Tip Item #{name + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => remove(name)}
                                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                  title="Remove Tip"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Form.Item
                                  {...restField}
                                  name={[name, 'iconType']}
                                  label={<span className="text-xs font-semibold text-zinc-500">Icon Type</span>}
                                  rules={[{ required: true, message: 'Icon is required' }]}
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
                                  {...restField}
                                  name={[name, 'title']}
                                  label={<span className="text-xs font-semibold text-zinc-500">Tip Title</span>}
                                  rules={[{ required: true, message: 'Title is required' }]}
                                >
                                  <AppInput type="text" placeholder="e.g. Wedding Hashtag" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'text']}
                                  label={<span className="text-xs font-semibold text-zinc-500">Tip Description Content</span>}
                                  rules={[{ required: true, message: 'Content description is required' }]}
                                >
                                  <AppInput type="text" placeholder="e.g. #GroomWedsBride" />
                                </Form.Item>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => add({ iconType: 'hashtag', title: '', text: '' })}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-zinc-800 hover:border-violet-500/50 hover:bg-violet-500/5 text-zinc-400 hover:text-violet-400 font-semibold rounded-xl transition-all cursor-pointer"
                          >
                            <FiPlus /> Add Tip Card
                          </button>
                        </div>
                      )}
                    </Form.List>
                  </div>
                </div>
              )}
              {/* Tab 8: Music & socials */}
              {activeTab === 'social' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-1.5 duration-200">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white mb-1">Social Links, Music & Footer</h3>
                    <p className="text-xs text-zinc-400">Configure background audio files, volume defaults, instagram sharing, and page footer credits.</p>
                  </div>
                  <div className="h-px bg-zinc-850 w-full" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                      name={['social', 'instagramHandle']}
                      label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Instagram Handle</span>}
                      rules={[{ required: true, message: 'Instagram handle is required' }]}
                    >
                      <AppInput type="text" placeholder="@wedding_hashtag" />
                    </Form.Item>

                    <Form.Item
                      name={['social', 'instagramLink']}
                      label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Instagram Link URL</span>}
                      rules={[{ required: true, message: 'Instagram link URL is required' }]}
                    >
                      <AppInput type="text" placeholder="https://instagram.com/tags/..." />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                      name={['footer', 'credit']}
                      label={<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Footer Credits</span>}
                      rules={[{ required: true, message: 'Footer credits are required' }]}
                    >
                      <AppInput type="text" placeholder="e.g. WITH LOVE, THE FAMILIES" />
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
              )}
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
    </div>
  );
};

export default InvitationForm;

