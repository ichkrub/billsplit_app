import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { ParsedReceipt } from '../types/receipt';

interface Props {
  onOcrComplete?: (data: ParsedReceipt) => void;
  className?: string;
}

const ReceiptUploader: React.FC<Props> = ({ onOcrComplete, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Keep only the base64 data part after the comma
          const base64String = reader.result.split(',')[1];
          // Add padding if needed
          const paddedString = base64String.replace(/=/g, '').padEnd(base64String.length + (4 - base64String.length % 4) % 4, '=');
          resolve(paddedString);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setIsLoading(true);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Convert to base64
      const base64Image = await convertToBase64(file);

      // Send to OCR endpoint
      console.log('Sending image to OCR endpoint...');
      const response = await fetch('/.netlify/functions/ocr-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OCR request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          details: errorData.details,
        });
        throw new Error(errorData.details || errorData.error || 'Failed to process receipt');
      }

      const data = await response.json();
      if (data.error) {
        console.error('OCR data contains error:', data);
        throw new Error(data.error);
      }

      if (!data.text || typeof data.text !== 'string') {
        console.error('Invalid OCR response:', data);
        throw new Error('Invalid OCR response: no text found');
      }

      console.log('OCR successful, sending text to parser...', data.text);
      // Parse OCR text using GPT
      const parseResponse = await fetch('/.netlify/functions/parse-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: data.text }),
      });

      let responseData;
      try {
        if (!parseResponse.ok) {
          const errorData = await parseResponse.json();
          console.error('Parse request failed:', {
            status: parseResponse.status,
            error: errorData.error,
            details: errorData.details,
          });
          throw new Error(errorData.details || errorData.error || 'Failed to parse receipt');
        }
        responseData = await parseResponse.json();
        
        // Validate required fields
        if (!responseData || typeof responseData !== 'object') {
          throw new Error('Invalid response from parser');
        }
      } catch (e) {
        console.error('Failed to parse GPT response:', e);
        throw new Error('Invalid response from server');
      }

      if (!parseResponse.ok || responseData.error) {
        console.error('Parser request failed:', {
          status: parseResponse.status,
          statusText: parseResponse.statusText,
          data: responseData,
        });
        throw new Error(
          responseData.error || responseData.details || 'Failed to process receipt'
        );
      }
      
      // Call the callback with the parsed result
      onOcrComplete?.(responseData);
    } catch (err) {
      console.error('Receipt processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setPreviewUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isLoading}
        />
        <div className={`
          border-2 border-dashed rounded-lg p-6
          ${isLoading ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-primary-500'}
          transition-colors duration-200 text-center
        `}>
          {previewUrl ? (
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="max-h-48 mx-auto rounded-lg shadow-sm"
              />
              <p className="text-sm text-gray-600">
                Click or drag another image to replace
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <PhotoIcon className="h-10 w-10 mx-auto text-gray-400" />
              <div className="text-sm text-gray-600">
                <p className="font-medium">Click to upload or drag and drop</p>
                <p>Supports PNG, JPG, or JPEG</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-primary-600"
        >
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Processing receipt...</span>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-sm text-center bg-red-50 p-2 rounded"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default ReceiptUploader;
