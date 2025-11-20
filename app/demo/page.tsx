'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

type ToastType = {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
};

export default function DemoPage() {
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
    } else {
      showToast('Please drop image or video files only', 'error');
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    showToast('File removed', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      showToast('Please upload at least one photo or video', 'error');
      return;
    }

    setUploading(true);
    showToast('Uploading your request...', 'info');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('company_id', '1'); // Demo company ID
      
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error('Upload failed');
      }

      router.push('/demo/success');
      
    } catch (error) {
      console.error('Submission error:', error);
      showToast('Failed to submit. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen page-gradient">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <header className="header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
            SavvyHomeUpgrade
          </a>
          <a href="/" className="text-gray-600 hover:text-gray-900 font-medium">
            ← Back to Home
          </a>
        </div>
      </header>

      <div className="hero-gradient text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Get Your Free Quote</h1>
          <p className="text-xl opacity-90">
            Upload photos of your project and we'll analyze it with AI instantly
          </p>
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
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="form-input"
                placeholder="(631) 555-0123"
              />
            </div>

            <div>
              <label className="form-label">Project Type *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="form-input"
              >
                <option value="">Select project type...</option>
                <option value="roofing">🏠 Roofing</option>
                <option value="hvac">❄️ HVAC</option>
                <option value="plumbing">🔧 Plumbing</option>
                <option value="electrical">⚡ Electrical</option>
                <option value="construction">🏗️ Construction/Renovation</option>
                <option value="painting">🎨 Painting</option>
                <option value="flooring">🪵 Flooring</option>
                <option value="landscaping">🌳 Landscaping</option>
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
              placeholder="Tell us about your project... What needs to be done?"
            />
          </div>

          <div className="mb-8">
            <label className="form-label">Upload Photos or Videos</label>
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
                <div className="text-6xl mb-4">
                  {isDragging ? '📥' : '📸'}
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  {isDragging ? 'Drop your files here!' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  Images or videos • Up to 10MB each
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  {files.length} file{files.length > 1 ? 's' : ''} uploaded
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="file-preview">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={filePreviews[index]} 
                          alt={file.name}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '10rem',
                          background: 'linear-gradient(135deg, #ddd6fe 0%, #dbeafe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div className="text-center">
                            <div className="text-5xl mb-2">🎥</div>
                            <p className="text-xs text-gray-700 font-medium">Video File</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="file-preview-overlay">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="opacity-75">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="file-preview-remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="btn btn-primary w-full"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Analyzing with AI...
              </span>
            ) : (
              'Submit & Get AI Analysis →'
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            ✓ Free AI analysis • ✓ Instant insights • ✓ No obligations
          </p>
        </form>
      </div>
    </div>
  );
}
