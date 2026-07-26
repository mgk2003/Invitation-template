import React from 'react';
import { Input, DatePicker, Select, Upload, Slider, InputNumber, Button, message } from 'antd';
import { UploadOutlined, DeleteOutlined, CustomerServiceOutlined, EyeOutlined } from '@ant-design/icons';
import { useUploadFileMutation } from '../../store/services/invitationApi';
import dayjs from 'dayjs';

const { TextArea } = Input;

// ==========================================
// 1. Date & DateTime Picker Component
// ==========================================
interface AppDatePickerProps {
  type?: 'date' | 'datetime';
  value?: any;
  onChange?: (val: any) => void;
  className?: string;
  disabled?: boolean;
}

export const AppDatePicker: React.FC<AppDatePickerProps> = ({
  type = 'datetime',
  value,
  onChange,
  className = '',
  disabled = false,
}) => {
  // Ensure the value is mapped to a Dayjs object or undefined
  const dayjsValue = value ? dayjs(value) : undefined;

  return (
    <DatePicker
      showTime={type === 'datetime'}
      format={type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
      value={dayjsValue}
      onChange={(date) => onChange?.(date || null)}
      disabled={disabled}
      className={`w-full bg-[#151824] border-gray-700 text-white min-h-[42px] flex items-center ${className}`}
    />
  );
};

// ==========================================
// 2. Select Component
// ==========================================
interface Option {
  label: string;
  value: any;
}

interface AppSelectProps {
  options: Option[];
  value?: any;
  onChange?: (val: any) => void;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
  disabled?: boolean;
}

export const AppSelect: React.FC<AppSelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  allowClear = false,
  className = '',
  disabled = false,
}) => {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      className={`w-full min-h-[42px] ${className}`}
      popupClassName="bg-zinc-900 border border-zinc-800"
    />
  );
};

// ==========================================
// 3. File Uploader Component
// ==========================================
interface AppFileUploaderProps {
  value?: string;
  onChange?: (val: string) => void;
  accept?: string;
  uploadType?: 'image' | 'audio';
  disabled?: boolean;
}

export const AppFileUploader: React.FC<AppFileUploaderProps> = ({
  value = '',
  onChange,
  accept = 'image/*',
  uploadType = 'image',
  disabled = false,
}) => {
  const [uploadFile, { isLoading }] = useUploadFileMutation();

  const handleBeforeUpload = async (file: File) => {
    if (uploadType === 'image') {
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif)$/i.test(file.name);
      if (!isImage) {
        message.error('Only image files (PNG, JPG, WEBP, SVG) are allowed for this field.');
        return false;
      }
    } else if (uploadType === 'audio') {
      const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name);
      if (!isAudio) {
        message.error('Only audio files (MP3, WAV, OGG) are allowed for background music.');
        return false;
      }
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadFile(formData).unwrap();
      onChange?.(res.url);
      message.success(`${uploadType === 'image' ? 'Image' : 'Audio'} uploaded successfully!`);
    } catch (err: any) {
      message.error(err?.data?.message || 'Error occurred while uploading the file.');
    }
    return false; // Prevent automatic upload by Ant Upload
  };

  return (
    <div className="w-full space-y-3">
      {value ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900 border border-zinc-850 rounded-xl p-3">
          {uploadType === 'image' ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 flex-shrink-0">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
              <CustomerServiceOutlined style={{ fontSize: '24px' }} />
            </div>
          )}

          <div className="flex-1 min-w-0 w-full text-center sm:text-left font-sans">
            <p className="text-sm font-medium text-white truncate">{value.split('/').pop() || 'Uploaded file'}</p>
            {uploadType === 'audio' && (
              <audio src={value} controls className="h-8 mt-1 w-full max-w-[240px] mx-auto sm:mx-0" />
            )}
            {uploadType === 'image' && (
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-violet-400 hover:text-violet-300 hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <EyeOutlined /> View Full Image
              </a>
            )}
          </div>

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onChange?.('')}
            disabled={disabled}
            className="hover:bg-red-500/10 flex items-center justify-center h-10 w-10 shrink-0"
          />
        </div>
      ) : (
        <Upload
          accept={accept}
          beforeUpload={handleBeforeUpload}
          showUploadList={false}
          disabled={disabled || isLoading}
          className="w-full block"
        >
          <Button
            icon={<UploadOutlined />}
            loading={isLoading}
            className="w-full h-12 flex items-center justify-center border-2 border-dashed border-zinc-850 hover:border-violet-500 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-xl text-zinc-300 transition-all font-sans"
          >
            Click to upload {uploadType === 'image' ? 'an image' : 'an audio file'}
          </Button>
        </Upload>
      )}
    </div>
  );
};

// ==========================================
// 4. Slider Component
// ==========================================
interface AppSliderProps {
  value?: number;
  onChange?: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const AppSlider: React.FC<AppSliderProps> = ({
  value = 0.5,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
  disabled = false,
}) => {
  return (
    <div className="w-full flex items-center gap-3">
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="flex-1"
      />
      <span className="text-xs font-mono text-zinc-400 w-8 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
};

// ==========================================
// 5. Main Dispatcher Component (AppInput)
// ==========================================
interface AppInputProps {
  type: 'text' | 'textarea' | 'password' | 'number' | 'date' | 'datetime' | 'select' | 'file' | 'slider';
  value?: any;
  onChange?: (val: any) => void;
  placeholder?: string;
  options?: { label: string; value: any }[];
  uploadType?: 'image' | 'audio';
  min?: number;
  max?: number;
  step?: number;
  addonBefore?: React.ReactNode;
  accept?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export const AppInput: React.FC<AppInputProps> = (props) => {
  const {
    type,
    value,
    onChange,
    placeholder,
    options = [],
    uploadType = 'image',
    min,
    max,
    step,
    addonBefore,
    accept,
    disabled = false,
    className = '',
    rows = 3,
  } = props;

  switch (type) {
    case 'textarea':
      return (
        <TextArea
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`w-full bg-[#151824] border-gray-700 text-white placeholder-gray-500 font-sans ${className}`}
        />
      );

    case 'password':
      return (
        <Input.Password
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-[#151824] border-gray-700 text-white font-sans ${className}`}
        />
      );

    case 'number':
      return (
        <InputNumber
          value={value}
          onChange={(val) => onChange?.(val)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`w-full bg-[#151824] border-gray-700 text-white font-sans ${className}`}
        />
      );

    case 'date':
      return (
        <AppDatePicker
          type="date"
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={className}
        />
      );

    case 'datetime':
      return (
        <AppDatePicker
          type="datetime"
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={className}
        />
      );

    case 'select':
      return (
        <AppSelect
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          allowClear
          className={className}
        />
      );

    case 'file':
      return (
        <AppFileUploader
          value={value}
          onChange={onChange}
          accept={accept}
          uploadType={uploadType}
          disabled={disabled}
        />
      );

    case 'slider':
      return (
        <AppSlider
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
      );

    case 'text':
    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          addonBefore={addonBefore}
          className={`w-full bg-[#151824] border-gray-700 text-white placeholder-gray-500 font-sans ${className}`}
        />
      );
  }
};

export default AppInput;
