'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { compressImages } from '@/lib/compressImage';
import Toast from '@/components/Toast';
import { CATEGORY_MAP, ADDRESS_CONFIG, type Category } from '@/lib/formCategories';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  FileText,
  Image as ImageIcon,
  Video,
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building,
  HelpCircle
} from 'lucide-react';

const libraries: ("places")[] = ["places"];

type ToastType = {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
};

type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

type Company = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  business_type?: string;
  logo_url?: string | null;
  form_categories?: Category[];
  address_enabled?: boolean | null;
  address_required?: boolean;
  cta_heading?: string | null;
  cta_button_text?: string | null;
  cta_success_message?: string | null;
  custom_questions?: CustomQuestion[];
  email_brand_color_1?: string | null;
  email_brand_color_2?: string | null;
};

interface UploadFormProps {
  company?: Company;
  companySlug?: string;
  companyId?: number;
  successRoute: string;
  showHeader?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
}

export default function UploadForm({ 
  company,
  companySlug, 
  companyId, 
  successRoute, 
  showHeader = true,
  headerTitle = "Submit Your Project",
  headerSubtitle = "Upload photos or videos and get a fast, accurate assessment"
}: UploadFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    category: '',
    description: '',
    lead_source: 'upload_form',
  });
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [showNoImageConfirm, setShowNoImageConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Google Places Autocomplete
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Get dynamic categories
  const businessType = company?.business_type || 'general';
  const categories: Category[] = 
    company?.form_categories && company.form_categories.length > 0
      ? company.form_categories
      : CATEGORY_MAP[businessType] || CATEGORY_MAP.general;

  const finalCompanySlug = company?.slug || companySlug;
  const finalCompanyId = company?.id || companyId;

  // Get custom questions
  const customQuestions = company?.custom_questions || [];

  // Get address configuration
  const getAddressConfig = () => {
    if (company?.address_enabled !== null && company?.address_enabled !== undefined) {
      return {
        show: company.address_enabled,
        required: company.address_required || false
      };
    }
    const defaultConfig = ADDRESS_CONFIG[businessType] || { show: false, required: false };
    return defaultConfig;
  };

  const addressConfig = getAddressConfig();

  const getCtaHeading = () => {
    if (company?.cta_heading) return company.cta_heading;
    
    switch (businessType) {
      case 'restaurant':
        return 'Order Your Custom Meal';
      case 'salon':
        return 'Book Your Appointment';
      case 'photography':
        return 'Request a Photo Session';
      default:
        return headerTitle;
    }
  };

  const getCtaButtonText = () => {
    if (company?.cta_button_text) return company.cta_button_text;
    
    switch (businessType) {
      case 'restaurant':
        return 'Place Order';
      case 'salon':
        return 'Book Appointment';
      case 'photography':
        return 'Request Session';
      default:
        return 'Submit Project';
    }
  };

  const ctaHeading = getCtaHeading();
  const ctaButtonText = getCtaButtonText();

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '');
    const limitedNumber = phoneNumber.slice(0, 10);
    
    if (limitedNumber.length === 0) return '';
    if (limitedNumber.length <= 3) return `(${limitedNumber}`;
    if (limitedNumber.length <= 6) return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
    return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (file.size > maxSize) {
      return { valid: false, error: `${file.name} is too large (max 50MB)` };
    }
    
    if (file.type.startsWith('video/') && file.size > 30 * 1024 * 1024) {
      return { valid: false, error: `${file.name} video is too large - keep videos under 10 seconds` };
    }
    
    return { valid: true };
  };

  // Google Places Autocomplete handlers
  const onLoadAutocomplete = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    autocomplete.setComponentRestrictions({ country: 'us' });
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.formatted_address) {
        let city = '';
        
        if (place.address_components) {
          const localityComponent = place.address_components.find(
            (component) => component.types.includes('locality')
          );
          const sublocalityComponent = place.address_components.find(
            (component) => component.types.includes('sublocality') || component.types.includes('sublocality_level_1')
          );
          const adminArea3Component = place.address_components.find(
            (component) => component.types.includes('administrative_area_level_3')
          );
          
          city = localityComponent?.long_name || 
                 sublocalityComponent?.long_name || 
                 adminArea3Component?.long_name || 
                 '';
        }
        
        setFormData({ 
          ...formData, 
          address_line_1: place.formatted_address,
          city: city 
        });
        
        showToast(city ? `Address selected in ${city}!` : 'Address selected!', 'success');
      }
    }
  };

  useEffect(() => {
    const newPreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    setFilePreviews(newPreviews);
    return () => {
      newPreviews.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      
      newFiles.forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          showToast(validation.error!, 'error');
        }
      });

      if (validFiles.length > 0) {
        setCompressing(true);
        try {
          const compressed = await compressImages(validFiles);
          setFiles([...files, ...compressed]);
          showToast(`${compressed.length} file(s) added`, 'success');
        } catch (error) {
          console.error('Compression error:', error);
          showToast('Failed to process files. Please try again.', 'error');
        } finally {
          setCompressing(false);
        }
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageAndVideoFiles = droppedFiles.filter(
      file => file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    const validFiles: File[] = [];
    imageAndVideoFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        showToast(validation.error!, 'error');
      }
    });
    
    if (validFiles.length > 0) {
      setCompressing(true);
      try {
        const compressed = await compressImages(validFiles);
        setFiles([...files, ...compressed]);
        showToast(`${compressed.length} file(s) added`, 'success');
      } catch (error) {
        console.error('Compression error:', error);
        showToast('Failed to process files. Please try again.', 'error');
      } finally {
        setCompressing(false);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    showToast('File removed', 'info');
  };

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    setCustomAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.category) {
      setError('Please fill in all required fields');
      showToast('Please fill in all required fields', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate address if required
    if (addressConfig.show && addressConfig.required && !formData.address_line_1.trim()) {
      setError('Address is required');
      showToast('Address is required', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate custom questions
    for (const question of customQuestions) {
      if (question.required && !customAnswers[question.id]) {
        setError(`Please answer: ${question.label}`);
        showToast(`Please answer: ${question.label}`, 'error');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    const rawPhone = formData.phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      showToast('Please enter a valid 10-digit phone number', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (files.length === 0) {
      setShowNoImageConfirm(true);
      return;
    }

    await submitForm();
  };

  const submitForm = async () => {
    setUploading(true);
    setShowNoImageConfirm(false);
    setError('');

    try {
      const rawPhone = formData.phone.replace(/\D/g, '');
      
      // Upload files
      const uploadedFiles = [];
      
      if (files.length > 0) {
        setUploadProgress(`Uploading ${files.length} files...`);
        showToast('Uploading files...', 'info');
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
          
          try {
            const timestamp = Date.now();
            const uniqueFilename = `${timestamp}-${file.name}`;
            
            const blob = await upload(uniqueFilename, file, {
              access: 'public',
              handleUploadUrl: '/api/blob-upload',
            });
            
            uploadedFiles.push({
              url: blob.url,
              name: file.name,
              type: file.type,
              size: file.size,
            });
          } catch (uploadError) {
            console.error(`Failed to upload ${file.name}:`, uploadError);
            throw new Error(`Failed to upload ${file.name}. Please try again.`);
          }
        }
        
        showToast('Files uploaded successfully!', 'success');
      }

      // Validate company info
      if (!finalCompanySlug || !finalCompanyId) {
        throw new Error('Company information is missing. Please refresh the page and try again.');
      }

      // Submit to API
      setUploadProgress('Saving your project...');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: rawPhone,
          address_line_1: formData.address_line_1 || null,
          address_line_2: formData.address_line_2 || null,
          city: formData.city || null,
          category: formData.category,
          description: formData.description,
          file_urls: uploadedFiles,
          company_slug: finalCompanySlug,
          company_id: finalCompanyId,
          lead_source: formData.lead_source || null,
          custom_answers: customAnswers, // Send custom answers
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid submission. Please check your information and try again.');
        } else if (response.status === 404) {
          throw new Error('Company not found. Please check the URL and try again.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again in a few moments.');
        } else {
          throw new Error(`Upload failed (Error ${response.status}). Please try again.`);
        }
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed. Please try again.');
      }

      showToast('Submission successful! Redirecting...', 'success');
      
      setTimeout(() => {
        router.push(successRoute);
      }, 800);
      
    } catch (err) {
      console.error('Submit error:', err);
      
      let errorMessage = 'Failed to submit. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      if (errorMessage.toLowerCase().includes('fetch') || 
          errorMessage.toLowerCase().includes('network') ||
          errorMessage.toLowerCase().includes('failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  // Loading/error states for Google Maps
  if (addressConfig.show && !isLoaded) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (addressConfig.show && loadError) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">Failed to load address autocomplete</p>
            <p className="text-sm text-gray-500 mt-2">Please refresh the page and try again</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {showNoImageConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <ImageIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No photos or videos uploaded</h3>
              <p className="text-gray-600">
                Adding photos or videos helps us provide a more accurate assessment. Continue without any media?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNoImageConfirm(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                <Upload className="w-4 h-4" />
                Add Media
              </button>
              <button
                onClick={submitForm}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4">
        {showHeader && (
          <div className="text-center mb-8">
            {company?.logo_url && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={company.logo_url} 
                  alt={company.name}
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {ctaHeading}
            </h1>
            <p className="text-lg text-gray-600">
              {headerSubtitle}
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4" style={{ color: '#3b82f6' }} />
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="John Smith"
                disabled={uploading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4" style={{ color: '#3b82f6' }} />
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="john@example.com"
                disabled={uploading}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4" style={{ color: '#22c55e' }} />
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="(555) 123-4567"
                maxLength={14}
                disabled={uploading}
              />
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {formData.phone.replace(/\D/g, '').length}/10 digits
              </p>
            </div>

            {/* Lead Source */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <HelpCircle className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                How did you hear about us? (Optional)
              </label>
              <select
                value={formData.lead_source}
                onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={uploading}
              >
                <option value="">Select one...</option>
                <option value="website">Website/Google Search</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral from friend/family</option>
                <option value="yard_sign">Yard Sign</option>
                <option value="truck">Saw your truck</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Address */}
            {addressConfig.show && isLoaded && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" style={{ color: '#ef4444' }} />
                    Address {addressConfig.required ? '*' : '(Optional)'}
                  </label>
                  <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <input
                      type="text"
                      required={addressConfig.required}
                      value={formData.address_line_1}
                      onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Start typing your address..."
                      disabled={uploading}
                    />
                  </Autocomplete>
                  <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Address autocomplete enabled - start typing to see suggestions
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Home className="w-4 h-4" style={{ color: '#6b7280' }} />
                    Unit / Apt / Suite (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.address_line_2}
                    onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="e.g., Apt 4B, Suite 200, Unit 5"
                    disabled={uploading}
                  />
                </div>
              </>
            )}

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Building className="w-4 h-4" style={{ color: '#f59e0b' }} />
                Service Type *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={uploading}
              >
                <option value="">Select a service...</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Describe your project in detail..."
                disabled={uploading}
              />
            </div>

            {/* CUSTOM QUESTIONS */}
            {customQuestions.length > 0 && (
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-6">
                  {customQuestions.map((question) => (
                    <div key={question.id}>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <HelpCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                        {question.label} {question.required && '*'}
                      </label>

                      {question.type === 'text' && (
                        <input
                          type="text"
                          required={question.required}
                          value={customAnswers[question.id] || ''}
                          onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Your answer..."
                          disabled={uploading}
                        />
                      )}

                      {question.type === 'select' && (
                        <select
                          required={question.required}
                          value={customAnswers[question.id] || ''}
                          onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          disabled={uploading}
                        >
                          <option value="">Select one...</option>
                          {question.options?.map((option, idx) => (
                            <option key={idx} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                  {question.type === 'checkbox' && (
  <div className="space-y-2">
    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
      <input
        type="radio"
        name={question.id}
        value="true"
        checked={customAnswers[question.id] === true}
        onChange={() => handleCustomAnswerChange(question.id, true)}
        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
        disabled={uploading}
      />
      <span className="text-gray-700 font-medium">Yes</span>
    </label>
    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
      <input
        type="radio"
        name={question.id}
        value="false"
        checked={customAnswers[question.id] === false}
        onChange={() => handleCustomAnswerChange(question.id, false)}
        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
        disabled={uploading}
      />
      <span className="text-gray-700 font-medium">No</span>
    </label>
  </div>

                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <ImageIcon className="w-4 h-4" style={{ color: '#ec4899' }} />
                Upload Photos or Videos (Optional - recommended)
              </label>
              
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50 scale-105' 
                    : 'border-gray-300 hover:border-blue-400 bg-gradient-to-br from-gray-50 to-blue-50'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={compressing || uploading}
                />
                <label 
                  htmlFor="file-upload" 
                  className={`${compressing || uploading ? 'cursor-not-allowed' : 'cursor-pointer'} block`}
                >
                  <div className="mb-4">
                    {compressing ? (
                      <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                    ) : isDragging ? (
                      <Upload className="w-16 h-16 text-blue-600 mx-auto" />
                    ) : (
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                        <ImageIcon className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <p className="text-xl font-bold text-gray-700 mb-2">
                    {compressing ? 'Compressing files...' : isDragging ? 'Drop files here!' : 'Click or drag to upload'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Photos or short videos (max 10 seconds, 50MB per file)
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {files.length} file{files.length > 1 ? 's' : ''} ready to upload
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {files.map((file, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden shadow-lg group">
                        {file.type.startsWith('image/') ? (
                          <img src={filePreviews[index]} alt={file.name} className="w-full h-48 object-cover" />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                            <Video className="w-12 h-12 text-purple-600" />
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-white text-xs truncate font-medium">{file.name}</p>
                          <p className="text-white/80 text-xs">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || compressing}
              className="w-full inline-flex items-center justify-center gap-3 text-white py-4 px-6 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              style={{
                background: company?.email_brand_color_1 && company?.email_brand_color_2
                  ? `linear-gradient(to right, ${company.email_brand_color_1}, ${company.email_brand_color_2})`
                  : '#3b82f6',
                opacity: (uploading || compressing) ? 0.5 : 1
              }}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadProgress || 'Uploading...'}
                </>
              ) : compressing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Compressing files...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  {ctaButtonText}
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Photos and videos help us provide more accurate quotes
            </p>
          </form>
        </div>
      </div>
    </>
  );
}