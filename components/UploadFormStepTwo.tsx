'use client';

import type { CSSProperties, ReactNode } from 'react';
import { TIMELINE_OPTIONS, BEST_TIME_OPTIONS, bestTimesArray, toggleBestTime } from '@/lib/timing';
import { Image as ImageIcon, Video, Upload, X, Loader2 } from 'lucide-react';

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
    /** How soon: 'asap' | 'week' | 'month' | 'flexible' (lib/timing.ts) */
    preferred_date: string;
    /** Best times, comma list: 'weekday_mornings,evenings' (lib/timing.ts) */
    preferred_time: string;
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
  /** Marketing demo: nothing was saved, so don't say it was. */
  demo?: boolean;
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

const LEAD_SOURCES = [
  { value: 'website', label: 'Google Search' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'referral', label: 'Referral' },
  { value: 'yard_sign', label: 'Yard Sign' },
  { value: 'truck', label: 'Saw Your Truck' },
  { value: 'other', label: 'Other' },
];

// Readable labels: normal case, 14px, semibold.
const labelClass = 'block text-sm font-semibold text-gray-900';
const hintClass = 'ml-2 text-[13px] font-normal text-gray-500';

// text-base keeps iOS from zooming in on focus. Focus ring uses the brand color.
const inputClass =
  'mt-2 w-full px-4 py-3 text-base border border-gray-300 rounded-lg outline-none transition ' +
  'focus:border-transparent focus:ring-2 focus:ring-[color:var(--brand)] disabled:opacity-50';

/* One pill style for every choice on this step. Defined at module level so
   buttons keep focus when the parent re-renders. */
function Pill({
  selected,
  onClick,
  disabled,
  gradient,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
  gradient: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95 disabled:opacity-50 ${
        selected
          ? 'text-white border-transparent shadow-sm'
          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
      style={selected ? { background: gradient } : undefined}
    >
      {children}
    </button>
  );
}

export default function UploadFormStepTwo({
  formData,
  customAnswers,
  customQuestions,
  files,
  filePreviews,
  submitting,
  compressing,
  uploadProgress,
  error,
  fieldConfig,
  brandColor1,
  brandColor2,
  isDragging,
  demo = false,
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
  // Same two config keys as before, new meaning (lib/timing.ts):
  // preferred_date = "How soon?", preferred_time = "Best times".
  const showAddress = fieldConfig.address.enabled;
  const showTimeline = fieldConfig.preferred_date.enabled;
  const showBestTimes = fieldConfig.preferred_time.enabled;
  const showLeadSource = fieldConfig.lead_source.enabled;
  const showFileUpload = fieldConfig.file_upload.enabled;
  const selectedBestTimes = bestTimesArray(formData.preferred_time);

  // Did they add anything? If not, the button just finishes (no extra save).
  const hasDetails =
    files.length > 0 ||
    Object.values(formData).some((v) => typeof v === 'string' && v.trim() !== '') ||
    Object.values(customAnswers).some((v) => v !== undefined && v !== null && v !== '');

  const disabled = submitting || compressing;
  const color1 = brandColor1 || '#2563eb';
  const color2 = brandColor2 || '#3b82f6';
  const gradient = `linear-gradient(135deg, ${color1}, ${color2})`;

  // Shorthand so every pill gets the same disabled state and brand gradient.
  const pill = (key: string | number, selected: boolean, onClick: () => void, children: ReactNode) => (
    <Pill key={key} selected={selected} onClick={onClick} disabled={disabled} gradient={gradient}>
      {children}
    </Pill>
  );

  return (
    <div
      className="w-full max-w-2xl mx-auto px-4 py-6"
      style={{ fontFamily: "'Nunito', sans-serif", ['--brand' as string]: color1 } as CSSProperties}
    >
      <div className="w-full bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 text-white" style={{ background: `linear-gradient(to right, ${color1}, ${color2})` }}>
          <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">✓</span>
            <span className="h-px w-6 bg-white/50" />
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-bold"
              style={{ color: color1 }}
            >
              2
            </span>
            <span className="ml-1">Step 2 of 2</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-3">
            {demo ? 'Add a few details' : 'Your request is saved!'}
          </h2>
          <p className="text-white/90 text-[15px] mt-1">
            {demo
              ? 'Everything here is optional. This is a demo, so nothing is sent.'
              : 'Everything below is optional. Add what you can, or just tap Finish and we’ll be in touch.'}
                        </p>
        </div>

        <form className="p-6 space-y-7" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-[15px] text-red-700">
              {error}
            </div>
          )}

          {/* Address */}
          {showAddress && (
            <div className="space-y-4">
              <div>
                <label htmlFor="s2-address" className={labelClass}>Street address</label>
                <input
                  id="s2-address"
                  type="text"
                  autoComplete="street-address"
                  value={formData.address_line_1}
                  onChange={(e) => onChange('address_line_1', e.target.value)}
                  className={inputClass}
                  placeholder="123 Main St"
                  disabled={disabled}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="s2-city" className={labelClass}>City</label>
                  <input
                    id="s2-city"
                    type="text"
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={(e) => onChange('city', e.target.value)}
                    className={inputClass}
                    placeholder="City"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <label htmlFor="s2-zip" className={labelClass}>ZIP code</label>
                  <input
                    id="s2-zip"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={formData.zip_code}
                    onChange={(e) => onChange('zip_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className={inputClass}
                    placeholder="12345"
                    maxLength={5}
                    disabled={disabled}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="s2-unit" className={labelClass}>
                  Unit / Apt <span className={hintClass}>if any</span>
                </label>
                <input
                  id="s2-unit"
                  type="text"
                  autoComplete="address-line2"
                  value={formData.address_line_2}
                  onChange={(e) => onChange('address_line_2', e.target.value)}
                  className={inputClass}
                  placeholder="Apt 4B"
                  disabled={disabled}
                />
              </div>
            </div>
          )}

                   {/* Custom questions (all optional on this step) */}
          {customQuestions.length > 0 && (
            <div className="space-y-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900">A few quick questions</h3>
              {customQuestions.map((q) => (
                <div key={q.id}>
                  {q.type === 'text' ? (
                    <label htmlFor={`s2-q-${q.id}`} className={labelClass}>{q.label}</label>
                  ) : (
                    <p className={labelClass}>{q.label}</p>
                  )}

                  {q.type === 'text' && (
                    <input
                      id={`s2-q-${q.id}`}
                      type="text"
                      value={customAnswers[q.id] || ''}
                      onChange={(e) => onCustomAnswerChange(q.id, e.target.value)}
                      className={inputClass}
                      placeholder="Your answer"
                      disabled={disabled}
                    />
                  )}

                  {q.type === 'select' && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {q.options?.map((opt, i) => {
                        const selected = customAnswers[q.id] === opt;
                        return pill(i, selected, () => onCustomAnswerChange(q.id, selected ? '' : opt), opt);
                      })}
                    </div>
                  )}

                  {q.type === 'checkbox' && (
                    <div className="mt-2 flex gap-2">
                      {[true, false].map((val) => {
                        const selected = customAnswers[q.id] === val;
                        return pill(String(val), selected, () => onCustomAnswerChange(q.id, selected ? undefined : val), <span className="px-3">{val ? 'Yes' : 'No'}</span>);
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

                   {/* Timing: what the customer would like, not a booking.
              The contractor sets the real visit in the Schedule tab. */}
          {showTimeline && (
            <div>
              <p className={labelClass}>How soon do you need this?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TIMELINE_OPTIONS.map((opt) => {
                  const selected = formData.preferred_date === opt.value;
                  return pill(opt.value, selected, () => onChange('preferred_date', selected ? '' : opt.value), opt.label);
                })}
              </div>
            </div>
          )}

          {showBestTimes && (
            <div>
              <p className={labelClass}>
                Best time to reach you or come by <span className={hintClass}>pick any</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {BEST_TIME_OPTIONS.map((opt) =>
                  pill(
                    opt.value,
                    selectedBestTimes.includes(opt.value),
                    () => onChange('preferred_time', toggleBestTime(formData.preferred_time, opt.value)),
                    opt.label,
                  ),
                )}
              </div>
            </div>
          )}

          {/* Lead source */}
          {showLeadSource && (
            <div>
              <p className={labelClass}>How did you hear about us?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {LEAD_SOURCES.map((source) => {
                  const selected = formData.lead_source === source.value;
                  return pill(source.value, selected, () => onChange('lead_source', selected ? '' : source.value), source.label);
                })}
              </div>
            </div>
          )}

          {/* File upload */}
          {showFileUpload && (
            <div>
              <p className={labelClass}>
                Photos or videos <span className={hintClass}>helps with a faster quote</span>
              </p>
              <div
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`mt-2 rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                  isDragging ? 'bg-gray-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
                style={isDragging ? { borderColor: color1 } : undefined}
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
                    <Loader2 className="mx-auto mb-2 h-10 w-10 animate-spin" style={{ color: color1 }} />
                  ) : (
                    <span
                      className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full text-white"
                      style={{ background: gradient }}
                    >
                      <ImageIcon className="h-6 w-6" />
                    </span>
                  )}
                  <p className="text-[15px] font-semibold text-gray-800">
                    {compressing ? (
                      'Processing...'
                    ) : (
                      <>
                        <span className="sm:hidden">Tap to add photos or videos</span>
                        <span className="hidden sm:inline">Click or drag photos and videos here</span>
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-[13px] text-gray-500">Documents work too · Max 50MB per file</p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {files.map((file, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-lg shadow">
                      {file.type.startsWith('image/') ? (
                        <img src={filePreviews[i]} alt={file.name} className="h-28 w-full object-cover" />
                      ) : file.type.startsWith('video/') ? (
                        <div className="flex h-28 w-full items-center justify-center bg-gray-100">
                          <Video className="h-8 w-8 text-gray-500" />
                        </div>
                      ) : (
                        <div className="flex h-28 w-full flex-col items-center justify-center bg-gray-100">
                          <Upload className="mb-1 h-6 w-6 text-gray-500" />
                          <p className="text-[11px] font-bold uppercase text-gray-600">{file.name.split('.').pop()}</p>
                        </div>
                      )}
                      {/* Always visible on phones (no hover); hover-reveal on desktop. */}
                      <button
                        type="button"
                        onClick={() => onRemoveFile(i)}
                        disabled={disabled}
                        aria-label={`Remove ${file.name}`}
                        className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1.5 text-white transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                        <p className="truncate text-xs text-white">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

                   {/* One button: sends details if they added any, otherwise just finishes. */}
          <div className="pt-2">
            <button
              type="button"
              onClick={hasDetails ? onSubmit : onSkip}
              disabled={disabled}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: `linear-gradient(to right, ${color1}, ${color2})` }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {uploadProgress || 'Saving...'}
                </>
                         ) : hasDetails ? (
                'Send details'
              ) : (
                'Finish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}