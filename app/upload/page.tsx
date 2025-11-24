'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [error, setError] = useState('');
  const [showNoImageConfirm, setShowNoImageConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const categories = [
    'Roofing',
    'Kitchen Remodel',
    'Bathroom Remodel',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Flooring',
    'Painting',
    'Landscaping',
    'Foundation Repair',
    'Water Damage',
    'General Repair',
    'Auto Body',
    'Auto Mechanical',
    'Other',
  ];

  // Phone number formatting function
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
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

    // Validate phone number has 10 digits
    const rawPhone = formData.phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // If no images, show confirmation
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
      const uploadFormData = new FormData();
      uploadFormData.append('name', formData.name);
      uploadFormData.append('email', formData.email);
      uploadFormData.append('phone', rawPhone);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('description', formData.description);

      files.forEach((file) => {
        uploadFormData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      router.push('/success');
    } catch (err) {
      setError('Failed to submit. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Submit Your Project
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Upload photos and get a fast, accurate assessment
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="John Smith"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="john@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="(555) 123-4567"
                maxLength={14}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.phone.replace(/\D/g, '').length}/10 digits
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Project *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="Tell us about your project..."
              />
            </div>

            {/* File Upload - MATCHING EXACT STYLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photos or Videos (Optional - but recommended)
              </label>
              
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
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
                  <div className="text-5xl sm:text-6xl mb-4">
                    {isDragging ? '📥' : '📸'}
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                    {isDragging ? 'Drop your files here!' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Images or videos
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
                      <div key={index} className="relative rounded-lg overflow-hidden shadow-md group">
                        {/* Image or Video Preview */}
                        {file.type.startsWith('image/') ? (
                          <img
                            src={filePreviews[index]}
                            alt={file.name}
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-5xl mb-2">🎥</div>
                              <p className="text-xs font-medium text-gray-700">Video</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Overlay with filename */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <p className="text-white text-xs font-medium truncate">{file.name}</p>
                        </div>
                        
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition shadow-lg text-sm font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-3 text-xs text-gray-500 text-center">
                💡 Tip: Photos help us provide more accurate quotes faster
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Uploading...
                </span>
              ) : (
                '📸 Submit Project'
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600 px-4">
          <p>
            We'll review your submission and get back to you within 24 hours with an assessment.
          </p>
        </div>
      </div>
    </div>
  );
}