'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

type Company = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
};

type ToastType = {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
};

export default function CompanyContactForm({ company }: { company: Company }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [showNoImageConfirm, setShowNoImageConfirm] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
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

  // Phone number formatting function
  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '');
    const limitedNumber = phoneNumber.slice(0, 10);
    
    if (limitedNumber.length === 0) return '';
    if (limitedNumber.length <= 3) return `(${limitedNumber}`;
    if (limitedNumber.length <= 6) return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
    return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
      showToast(`${newFiles.length} file(s) added`, 'success');
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageAndVideoFiles = droppedFiles.filter(
      file => file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    if (imageAndVideoFiles.length > 0) {
      setFiles([...files, ...imageAndVideoFiles]);
      showToast(`${imageAndVideoFiles.length} file(s) added`, 'success');
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    showToast('File removed', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number has 10 digits
    const rawPhone = formData.phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    // If no images, show confirmation dialog
    if (files.length === 0) {
      setShowNoImageConfirm(true);
      return;
    }

    // Proceed with submission
    await submitForm();
  };

  const submitForm = async () => {
    setUploading(true);
    setShowNoImageConfirm(false);

    try {
      const rawPhone = formData.phone.replace(/\D/g, '');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', rawPhone);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('company_slug', company.slug);

      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      if (result.success) {
        router.push(`/${company.slug}/success`);
      } else {
        showToast('Upload failed', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to submit', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen page-gradient">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      {/* No Image Confirmation Modal */}
      {showNoImageConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">📸</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No photos uploaded</h3>
              <p className="text-gray-600 mb-4">
                Adding photos helps us provide a more accurate assessment. Are you sure you want to continue without photos?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNoImageConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                ← Add Photos
              </button>
              <button
                onClick={submitForm}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Continue Without →
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">{company.name}</h1>
            <p className="text-sm text-gray-600">Get your free quote</p>
          </div>
          <a href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            Powered by SavvyHomeUpgrade
          </a>
        </div>
      </header>

      <div className="hero-gradient text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Get Your Free Quote</h1>
          <p className="text-xl opacity-90">Upload photos and we'll get back to you within 24 hours</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-5 mb-8">
            <div>
              <label className="form-label">Name *</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="form-input" 
                placeholder="John Smith" 
              />
            </div>

            <div>
              <label className="form-label">Email *</label>
              <input 
                type="email" 
                required 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                className="form-input" 
                placeholder="john@example.com" 
              />
            </div>

            <div>
              <label className="form-label">Phone *</label>
              <input 
                type="tel" 
                required 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})} 
                className="form-input" 
                placeholder="(631) 555-0123"
                maxLength={14}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.phone.replace(/\D/g, '').length}/10 digits
              </p>
            </div>

            <div>
              <label className="form-label">Project Type *</label>
              <select 
                required 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className="form-input"
              >
                <option value="">Select...</option>
                <option value="roofing">🏠 Roofing</option>
                <option value="hvac">❄️ HVAC</option>
                <option value="plumbing">🔧 Plumbing</option>
                <option value="electrical">⚡ Electrical</option>
                <option value="construction">🏗️ Construction</option>
                <option value="other">📋 Other</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="form-label">Describe your project *</label>
            <textarea 
              required 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              rows={4} 
              className="form-input" 
              placeholder="Tell us about your project..." 
            />
          </div>

          <div className="mb-8">
            <label className="form-label">Upload Photos (Optional - but recommended for better quotes)</label>
            <div 
              onDragEnter={handleDragEnter} 
              onDragOver={handleDragOver} 
              onDragLeave={handleDragLeave} 
              onDrop={handleDrop} 
              className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
            >
              <input 
                type="file" 
                id="file-upload" 
                multiple 
                accept="image/*,video/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="text-6xl mb-4">{isDragging ? '📥' : '📸'}</div>
                <p className="text-xl font-semibold text-gray-700 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">Images or videos (optional)</p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold mb-3">{files.length} file(s) uploaded</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="file-preview">
                      {file.type.startsWith('image/') ? (
                        <img src={filePreviews[index]} alt={file.name} />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                          <div className="text-center"><div className="text-5xl mb-2">🎥</div><p className="text-xs font-medium">Video</p></div>
                        </div>
                      )}
                      <div className="file-preview-overlay"><p className="font-medium truncate">{file.name}</p></div>
                      <button type="button" onClick={() => removeFile(index)} className="file-preview-remove">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={uploading} className="btn btn-primary w-full">
            {uploading ? '⏳ Uploading...' : 'Submit Request →'}
          </button>

          <p className="text-center text-xs text-gray-500 mt-3">
            💡 Tip: Photos help us provide more accurate quotes faster
          </p>
        </form>
      </div>
    </div>
  );
}