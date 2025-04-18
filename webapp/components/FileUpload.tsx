'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUpload: (url: string) => void;
  imageUrl?: string;
  onRemove?: () => void;
}

export function FileUpload({ onUpload, imageUrl, onRemove }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload image');
      }

      const data = await response.json();
      onUpload(data.url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  if (imageUrl) {
    return (
      <div className="relative w-full h-64 group">
        <Image
          src={imageUrl}
          alt="Preview"
          fill
          className="object-contain rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
          <button
            type="button"
            onClick={onRemove}
            className="bg-red-500/80 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <label className={`w-full h-full flex flex-col items-center justify-center cursor-pointer border-2 border-dashed rounded-lg transition-all duration-300 ${
        isUploading ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500/50'
      }`}>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
              <p className="mt-2 text-sm text-purple-500">Uploading...</p>
            </>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </>
          )}
        </div>
      </label>
    </div>
  );
} 