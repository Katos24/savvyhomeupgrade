'use client';

import { useRef, useState, useEffect } from 'react';
import { getSchedulingConfig } from '@/lib/schedulingConfig';import {
  MapPin,
  Home,
  HelpCircle,
  Calendar,
  Clock,
  Image as ImageIcon,
  Video,
  Upload,
  X,
  Loader2,
  ChevronRight,
} from 'lucide-react';


type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

type FieldConfig = {
  address: { enabled: boolean; required: boolean };
  preferred_date: { enabled: boolean };
  preferred_time: { enabled: boolean };
  lead_source: { enabled: boolean };
  file_upload: { enabled: boolean };
};

interface StepTwoProps {
  companySlug?: string;
  businessType?: string;
  formData: {
    address_line_1: string;
    address_line_2: string;
    city: string;
    zip_code: string;
    lead_source: string;
    preferred_date: string;
    preferred_time: string;
    preferred_end_time: string;
  };
  customAnswers: Record<string, any>;
  customQuestions: CustomQuestion[];
  files: File[];
  filePreviews: string[];
  submitting: boolean;
  compressing: boolean;
  uploadProgress: string;
  error: string;
  addressConfig: { show: boolean; required: boolean };
  fieldConfig: FieldConfig;
  ctaButtonText: string;
  brandColor1?: string | null;
  brandColor2?: string | null;
  companyWebsite?: string | null;
  companyName?: string;
  isDragging: boolean;
  onChange: (field: string, value: string) => void;
  onCustomAnswerChange: (questionId: string, value: any) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onRemoveFile: (index: number) => void;
  onSubmit: () => void;
  onSkip: () => void;
}

const labelClass = 'text-xs font-black text-black uppercase tracking-[0.12em] ml-1';

const inputClass =
  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50';

export default function UploadFormStepTwo({
  companySlug,
  businessType,
  formData,
  customAnswers,
  customQuestions,
  files,
  filePreviews,
  submitting,
  compressing,
  uploadProgress,
  error,
  addressConfig,
  fieldConfig,
  ctaButtonText,
  brandColor1,
  brandColor2,
  companyWebsite,
  companyName,
  isDragging,
  onChange,
  onCustomAnswerChange,
  onFileChange,
  onDrop,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onRemoveFile,
  onSubmit,
  onSkip,
}: StepTwoProps) {
const inputRef = useRef<HTMLInputElement | null>(null);
  const showAddress = fieldConfig.address.enabled;
  const showDate = fieldConfig.preferred_date.enabled;
  const showTime = fieldConfig.preferred_time.enabled;

 const showEndTime = showTime && getSchedulingConfig(businessType).showEndTime;

  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [endSlots, setEndSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [endSlotsLoading, setEndSlotsLoading] = useState(false);

  useEffect(() => {
    if (!showTime || !formData.preferred_date || !companySlug) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    fetch(`/api/company/${companySlug}/availability?date=${formData.preferred_date}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.success ? data.slots : []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [formData.preferred_date, companySlug, showTime]);

  // Refetch end-time options whenever the chosen start changes. A previously
  // picked end time can become invalid if the start changes — clearing it
  // rather than leaving a stale, unvalidated value in the form.
  useEffect(() => {
    if (!showEndTime || !formData.preferred_date || !formData.preferred_time || !companySlug) {
      setEndSlots([]);
      return;
    }
    onChange('preferred_end_time', '');
    setEndSlotsLoading(true);
    fetch(`/api/company/${companySlug}/availability?date=${formData.preferred_date}&start=${formData.preferred_time}`)
      .then((r) => r.json())
      .then((data) => setEndSlots(data.success ? data.slots : []))
      .catch(() => setEndSlots([]))
      .finally(() => setEndSlotsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.preferred_time, formData.preferred_date, companySlug, showEndTime]);

  const formatSlotLabel = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };
  const showLeadSource = fieldConfig.lead_source.enabled;
  const showFileUpload = fieldConfig.file_upload.enabled;

 
  const disabled = submitting || compressing;
  const color1 = brandColor1 || '#2563eb';
  const color2 = brandColor2 || '#3b82f6';

  return (
<div className="w-full max-w-2xl mx-auto px-4 py-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="w-full bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">

        {/* Header */}
        <div
          className="rounded-t-2xl px-6 py-5 text-white"
          style={{
            background: `linear-gradient(to right, ${color1}, ${color2})`
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold flex items-center justify-center">
              <span className="text-base leading-none">✓</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
            <div className="w-8 h-8 rounded-full bg-white text-blue-600 text-sm font-bold flex items-center justify-center">2</div>
          </div>
          <h2 className="text-xl font-bold mt-2">Your request is saved!</h2>
          <p className="text-white/80 text-sm mt-1">
            Add a few more details to help us give you a better quote — all optional.
          </p>
        </div>

<form className="p-6 space-y-6" autoComplete="off" onSubmit={e => e.preventDefault()}>
          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-sm">
              <p className="font-semibold">Error</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* Address */}
{showAddress && (
  <>
    <div>
      <label className={labelClass}>Street Address</label>
      <input
        type="text"
        autoComplete="street-address"
        value={formData.address_line_1}
        onChange={e => onChange('address_line_1', e.target.value)}
        className={`${inputClass} mt-2`}
        placeholder="123 Main St"
        disabled={disabled}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>City</label>
        <input
          type="text"
          autoComplete="address-level2"
          value={formData.city}
          onChange={e => onChange('city', e.target.value)}
          className={`${inputClass} mt-2`}
          placeholder="New York"
          disabled={disabled}
        />
      </div>
      <div>
        <label className={labelClass}>Zip Code</label>
        <input
          type="text"
          autoComplete="postal-code"
          value={formData.zip_code}
          onChange={e => onChange('zip_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
          className={`${inputClass} mt-2`}
          placeholder="12345"
          maxLength={5}
          disabled={disabled}
        />
      </div>
    </div>
    <div>
      <label className={labelClass}>Unit / Apt</label>
      <input
        type="text"
        autoComplete="address-line2"
        value={formData.address_line_2}
        onChange={e => onChange('address_line_2', e.target.value)}
        className={`${inputClass} mt-2`}
        placeholder="Apt 4B"
        disabled={disabled}
      />
    </div>
  </>
)}
          {/* Date + Time */}
          {(showDate || showTime) && (
            <div className={`grid gap-4 ${showDate && showTime ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {showDate && (
                <div className="min-w-0 overflow-hidden">
                  <label className={labelClass}>Preferred Date</label>
                 <input
  type="date"
  autoComplete="off"
  value={formData.preferred_date}
  onChange={e => onChange('preferred_date', e.target.value)}
  className={`${inputClass} mt-2`}
  style={{ colorScheme: 'light' }}
  disabled={disabled}
/>
                </div>
              )}
             {showTime && (
                <div className={showDate && showTime ? 'col-span-2' : ''}>
                  <label className={labelClass}>Preferred Time</label>
                  {!formData.preferred_date ? (
                    <p className="mt-2 text-sm font-medium text-gray-400">Pick a date first to see open times.</p>
                  ) : slotsLoading ? (
                    <p className="mt-2 text-sm font-medium text-gray-400">Checking availability...</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {slots.map((slot) => {
                        const selected = formData.preferred_time === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={disabled || !slot.available}
                            onClick={() => onChange('preferred_time', slot.time)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                              !slot.available
                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                                : selected
                                ? 'text-white border-transparent shadow-sm bg-blue-600'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {formatSlotLabel(slot.time)}
                          </button>
                        );
                      })}
                   </div>
                  )}
                </div>
              )}

              {showEndTime && formData.preferred_time && (
                <div className={showDate && showTime ? 'col-span-2' : ''}>
                  <label className={labelClass}>Preferred End Time</label>
                  {endSlotsLoading ? (
                    <p className="mt-2 text-sm font-medium text-gray-400">Checking availability...</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {endSlots.map((slot) => {
                        const selected = formData.preferred_end_time === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={disabled || !slot.available}
                            onClick={() => onChange('preferred_end_time', slot.time)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                              !slot.available
                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                                : selected
                                ? 'text-white border-transparent shadow-sm bg-blue-600'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {formatSlotLabel(slot.time)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Custom Questions */}
          {customQuestions.length > 0 && (
            <div className="border-t pt-4 space-y-5">
              <h3 className="text-base font-bold text-gray-900">A few quick questions</h3>
              {customQuestions.map(q => (
                <div key={q.id}>
                  <label className={labelClass}>
                    {q.label}
                    {q.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <div className="mt-2">
                    {q.type === 'text' && (
                      <input
                        type="text"
                        value={customAnswers[q.id] || ''}
                        onChange={e => onCustomAnswerChange(q.id, e.target.value)}
                        className={inputClass}
                        placeholder="Your answer..."
                        disabled={disabled}
                      />
                    )}
                    {q.type === 'select' && (
                      <div className="flex flex-wrap gap-2">
                        {q.options?.map((opt, i) => {
                          const selected = customAnswers[q.id] === opt;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => onCustomAnswerChange(q.id, opt)}
                              disabled={disabled}
                              className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                                selected
                                  ? 'text-white border-transparent shadow-sm'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                              }`}
                              style={selected ? { background: `linear-gradient(135deg, ${color1}, ${color2})`, borderColor: 'transparent' } : {}}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {q.type === 'checkbox' && (
                      <div className="flex gap-3">
                        {[true, false].map(val => (
                          <label
                            key={String(val)}
                            className="flex-1 flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={customAnswers[q.id] === val}
                              onChange={() => onCustomAnswerChange(q.id, val)}
                              className="w-4 h-4 text-blue-600"
                              disabled={disabled}
                            />
                            <span className="font-medium text-gray-700">{val ? 'Yes' : 'No'}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lead Source — pills */}
          {showLeadSource && (
            <div className="space-y-2">
              <label className={labelClass}>How Did You Hear About Us?</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { value: 'website',    label: 'Google Search' },
                  { value: 'facebook',   label: 'Facebook' },
                  { value: 'instagram',  label: 'Instagram' },
                  { value: 'google_ads', label: 'Google Ads' },
                  { value: 'referral',   label: 'Referral' },
                  { value: 'yard_sign',  label: 'Yard Sign' },
                  { value: 'truck',      label: 'Saw Your Truck' },
                  { value: 'other',      label: 'Other' },
                ].map(source => {
                  const selected = formData.lead_source === source.value;
                  return (
                    <button
                      key={source.value}
                      type="button"
                      onClick={() => onChange('lead_source', source.value)}
                      disabled={disabled}
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                        selected
                          ? 'text-white border-transparent shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                      style={selected ? { background: `linear-gradient(135deg, ${color1}, ${color2})`, borderColor: 'transparent' } : {}}
                    >
                      {source.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* File Upload */}
          {showFileUpload && (
            <div>
              <label className={labelClass}>
            Photos, Short Videos, or Documents
                <span className="ml-2 text-[10px] font-bold text-gray-400 normal-case tracking-normal">
                  helps us quote faster
                </span>
              </label>
              <div
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all mt-2 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  id="step2-file-upload"
                  multiple
accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                  onChange={onFileChange}
                  className="hidden"
                  disabled={disabled}
                />
                <label
                  htmlFor="step2-file-upload"
                  className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} block`}
                >
                  {compressing ? (
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
                  ) : (
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                      <ImageIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <p className="font-semibold text-gray-700 text-sm">
                    {compressing ? 'Processing...' : 'Click or drag files here'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Max 50MB per file</p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {files.map((file, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden shadow group">
                     {file.type.startsWith('image/') ? (
  <img src={filePreviews[i]} alt={file.name} className="w-full h-28 object-cover" />
) : file.type.startsWith('video/') ? (
  <div className="w-full h-28 bg-purple-100 flex items-center justify-center">
    <Video className="w-8 h-8 text-purple-500" />
  </div>
) : (
  <div className="w-full h-28 bg-blue-50 flex flex-col items-center justify-center">
    <Upload className="w-6 h-6 text-blue-500 mb-1" />
    <p className="text-[10px] font-bold text-blue-500 uppercase">{file.name.split('.').pop()}</p>
  </div>
)}
                      <button
                        type="button"
                        onClick={() => onRemoveFile(i)}
                        disabled={disabled}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                        <p className="text-white text-xs truncate">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Submit */}
<div className="pt-2">
  <button
    type="button"
    onClick={onSubmit}
    disabled={disabled}
    className="w-full inline-flex items-center justify-center gap-3 text-white py-4 px-6 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:opacity-90"
   style={{
      background: `linear-gradient(to right, ${color1}, ${color2})`,
    }}
  >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" />{uploadProgress || 'Saving...'}</>
              ) : (
                <><Upload className="w-5 h-5" />Submit Details</>
              )}
            </button>

         
          </div>

     </form>
      </div>
    </div>
  );
}