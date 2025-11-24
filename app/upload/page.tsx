'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { compressImages } from '@/lib/compressImage';

export default function UploadPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    description: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [showNoImageConfirm, setShowNoImageConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const categories = [
    'Roofing', 'Kitchen Remodel', 'Bathroom Remodel', 'Plumbing', 
    'Electrical', 'HVAC', 'Flooring', 'Painting', 'Landscaping', 
    'Foundation Repair', 'Water Damage', 'General Repair', 
    'Auto Body', 'Auto Mechanical', 'Other',
  ];

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '');
    const limitedNumber = phoneNumber.slice(0, 10);
    
    if (limitedNumber.length === 0) return '';
    if (limitedNumber.length <= 3) return `(${limitedNumber}`;
    if (limitedNumber.length <= 6) return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
    return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
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
      setCompressing(true);
      const newFiles = Array.from(e.target.files);
      const compressed = await compressImages(newFiles);
      setFiles([...files, ...compressed]);
      setCompressing(false);
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
    
    if (imageAndVideoFiles.length > 0) {
      setCompressing(true);
      const compressed = await compressImages(imageAndVideoFiles);
      setFiles([...files, ...compressed]);
      setCompressing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    const rawPhone = formData.phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
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

    try {
      const rawPhone = formData.phone.replace(/\D/g, '');
      
      // STEP 1: Upload files directly to blob
      const uploadedFiles = [];
      
      if (files.length > 0) {
        setUploadProgress(`Uploading ${files.length} files...`);
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
          
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
        }
      }

      // STEP 2: Send form data + blob URLs to API (tiny payload!)
      setUploadProgress('Saving your submission...');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: rawPhone,
          category: formData.category,
          description: formData.description,
          file_urls: uploadedFiles,
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      router.push('/success');
      
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {showNoImageConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">📸</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No photos uploaded</h3>
              <p className="text-gray-600 mb-4">
                Adding photos helps us provide a more accurate assessment. Continue without photos?
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

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Submit Your Project
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Upload photos and get a fast, accurate assessment
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
                maxLength={14}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.phone.replace(/\D/g, '').length}/10 digits
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your project..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photos (Optional - recommended)
              </label>
              
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
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
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="text-6xl mb-4">
                    {compressing ? '⏳' : isDragging ? '📥' : '📸'}
                  </div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    {compressing ? 'Compressing...' : isDragging ? 'Drop files here!' : 'Click or drag to upload'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Images auto-compress • No size limits!
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {files.length} file{files.length > 1 ? 's' : ''} ready
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {files.map((file, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden shadow-md">
                        {file.type.startsWith('image/') ? (
                          <img src={filePreviews[index]} alt={file.name} className="w-full h-40 object-cover" />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                            <div className="text-5xl">🎥</div>
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <p className="text-white text-xs truncate">{file.name}</p>
                          <p className="text-white/80 text-xs">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
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
              disabled={uploading || compressing}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {uploadProgress || 'Uploading...'}
                </span>
              ) : compressing ? (
                'Compressing...'
              ) : (
                '📸 Submit Project'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
