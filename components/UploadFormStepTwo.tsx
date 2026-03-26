'use client';

import { useRef } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import {
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

const libraries: ('places')[] = ['places'];

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
  formData: {
    address_line_1: string;
    address_line_2: string;
    city: string;
    zip_code: string;
    lead_source: string;
    preferred_date: string;
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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const showAddress = fieldConfig.address.enabled;
  const showDate = fieldConfig.preferred_date.enabled;
  const showTime = fieldConfig.preferred_time.enabled;
  const showLeadSource = fieldConfig.lead_source.enabled;
  const showFileUpload = fieldConfig.file_upload.enabled;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoadAutocomplete = (ac: google.maps.places.Autocomplete) => {
    autocompleteRef.current = ac;
    ac.setComponentRestrictions({ country: 'us' });
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place.formatted_address) return;

    let city = '';
    let zip = '';
    if (place.address_components) {
      const locality = place.address_components.find(c => c.types.includes('locality'));
      const sublocality = place.address_components.find(c =>
        c.types.includes('sublocality') || c.types.includes('sublocality_level_1')
      );
      const adminArea3 = place.address_components.find(c =>
        c.types.includes('administrative_area_level_3')
      );
      const postal = place.address_components.find(c => c.types.includes('postal_code'));
      city = locality?.long_name || sublocality?.long_name || adminArea3?.long_name || '';
      zip = postal?.long_name || '';
    }
    onChange('address_line_1', place.formatted_address);
    onChange('city', city);
    onChange('zip_code', zip);
  };

  const disabled = submitting || compressing;

  return (
    <div
  className="fixed inset-0 z-50 px-4"
  style={{
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch', // iOS momentum scroll
  }}
>
  <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl mx-auto my-8">

        {/* Header */}
        <div className="rounded-t-2xl px-6 py-5 text-white"
          style={{
            background: brandColor1 && brandColor2
              ? `linear-gradient(to right, ${brandColor1}, ${brandColor2})`
              : 'linear-gradient(to right, #2563eb, #3b82f6)'
          }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold flex items-center justify-center">✓</div>
            <ChevronRight className="w-4 h-4 opacity-60" />
            <div className="w-8 h-8 rounded-full bg-white text-blue-600 text-sm font-bold flex items-center justify-center">2</div>
          </div>
          <h2 className="text-xl font-bold mt-2">Your request is saved! 🎉</h2>
          <p className="text-white/80 text-sm mt-1">
            Add a few more details to help us give you a better quote — all optional.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-sm">
              <p className="font-semibold">Error</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* Address */}
          {showAddress && isLoaded && !loadError && (
            <>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Address {fieldConfig.address.required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(optional)</span>}
                </label>
                <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                  <input
                    type="text"
                    value={formData.address_line_1}
                    onChange={e => onChange('address_line_1', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                    placeholder="Start typing your address..."
                    disabled={disabled}
                  />
                </Autocomplete>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={e => onChange('zip_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                    placeholder="12345"
                    maxLength={5}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    Unit / Apt
                  </label>
                  <input
                    type="text"
                    value={formData.address_line_2}
                    onChange={e => onChange('address_line_2', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                    placeholder="Apt 4B"
                    disabled={disabled}
                  />
                </div>
              </div>
            </>
          )}

          {/* Preferred Date + Time */}
{(showDate || showTime) && (
  <div className={`grid gap-4 ${showDate && showTime ? 'grid-cols-2' : 'grid-cols-1'}`}>
    {showDate && (
  <div className="min-w-0 overflow-hidden">
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
      <Calendar className="w-4 h-4 text-emerald-500" />
      Preferred Date
    </label>
    <input
      type="date"
      value={formData.preferred_date}
      onChange={e => onChange('preferred_date', e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
      style={{ colorScheme: 'light' }}
      disabled={disabled}
    />
  </div>
)}
    {showTime && (
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Preferred Time
        </label>
        <input
          type="text"
          value={formData.preferred_time}
          onChange={e => onChange('preferred_time', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
          placeholder="Morning, 2PM..."
          disabled={disabled}
        />
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
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    {q.label} {q.required && <span className="text-red-500">*</span>}
                  </label>
                  {q.type === 'text' && (
                    <input type="text" value={customAnswers[q.id] || ''}
                      onChange={e => onCustomAnswerChange(q.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                      placeholder="Your answer..." disabled={disabled} />
                  )}
                  {q.type === 'select' && (
                    <select value={customAnswers[q.id] || ''}
                      onChange={e => onCustomAnswerChange(q.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                      disabled={disabled}>
                      <option value="">Select one...</option>
                      {q.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  {q.type === 'checkbox' && (
                    <div className="flex gap-3">
                      {[true, false].map(val => (
                        <label key={String(val)} className="flex-1 flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                          <input type="radio" name={q.id} checked={customAnswers[q.id] === val}
                            onChange={() => onCustomAnswerChange(q.id, val)}
                            className="w-4 h-4 text-blue-600" disabled={disabled} />
                          <span className="font-medium text-gray-700">{val ? 'Yes' : 'No'}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Lead Source */}
          {showLeadSource && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <HelpCircle className="w-4 h-4 text-purple-500" />
                How did you hear about us?
              </label>
              <select
                value={formData.lead_source}
                onChange={e => onChange('lead_source', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                disabled={disabled}
              >
                <option value="">Select one...</option>
                <option value="website">Website / Google Search</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral from friend/family</option>
                <option value="yard_sign">Yard Sign</option>
                <option value="truck">Saw your truck</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* File Upload */}
          {showFileUpload && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                Photos or Videos <span className="text-gray-400 font-normal">(helps us quote faster)</span>
              </label>
              <div
                onDragEnter={onDragEnter} onDragOver={onDragOver}
                onDragLeave={onDragLeave} onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                }`}
              >
                <input type="file" id="step2-file-upload" multiple accept="image/*,video/*"
                  onChange={onFileChange} className="hidden" disabled={disabled} />
                <label htmlFor="step2-file-upload"
                  className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} block`}>
                  {compressing
                    ? <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
                    : <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                        <ImageIcon className="w-6 h-6 text-blue-600" />
                      </div>
                  }
                  <p className="font-semibold text-gray-700 text-sm">
                    {compressing ? 'Processing...' : 'Click or drag photos/videos here'}
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
                      ) : (
                        <div className="w-full h-28 bg-purple-100 flex items-center justify-center">
                          <Video className="w-8 h-8 text-purple-500" />
                        </div>
                      )}
                      <button type="button" onClick={() => onRemoveFile(i)} disabled={disabled}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
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
                background: brandColor1 && brandColor2
                  ? `linear-gradient(to right, ${brandColor1}, ${brandColor2})`
                  : '#3b82f6',
              }}
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" />{uploadProgress || 'Saving...'}</>
              ) : (
                <><Upload className="w-5 h-5" />Submit Details</>
              )}
            </button>
          </div>

          {/* Skip link */}
          <div className="text-center">
            <button
              type="button"
              onClick={onSkip}
              disabled={disabled}
              className="text-sm text-gray-400 hover:text-gray-600 transition underline underline-offset-2"
            >
              Skip for now
            </button>
          </div>

          {/* Company website */}
          {companyWebsite && (
            <div className="text-center pt-2 border-t border-gray-100">
              <a
                href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-gray-600 transition underline underline-offset-2"
              >
                {companyName ? `Visit ${companyName}'s website` : 'Visit our website'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}