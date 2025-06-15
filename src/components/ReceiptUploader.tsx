import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { ParsedReceipt } from '../types/receipt';
import { uploadTemporaryReceipt } from '../utils/supabaseClient';

interface Props {
  onOcrComplete?: (data: ParsedReceipt) => void;
  className?: string;
}

const ReceiptUploader = ({ onOcrComplete, className = '' }: Props): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup function for uploaded resources
  const cleanupUpload = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);
    cleanupUpload();

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      
      // Upload to Supabase first
      console.log('Uploading receipt to Supabase...');
      const imageUrl = await uploadTemporaryReceipt(file);
      console.log('Receipt uploaded, URL:', imageUrl);

      // Send URL to OCR endpoint
      console.log('Sending to OCR endpoint:', imageUrl);
      const response = await fetch('/.netlify/functions/ocr-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageUrl,
          type: 'url',
          config: {
            expected_currency: 'SGD',
            vendor_type: 'restaurant',
            region: 'SG'
          }
        })
      });

      // Log raw response for debugging
      const responseText = await response.text();
      console.log('Raw OCR response:', responseText);

      // Parse the response text
      let ocrData;
      try {
        ocrData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse OCR response:', parseError);
        throw new Error('Invalid response from OCR service');
      }

      if (!response.ok) {
        console.error('OCR error response:', ocrData);
        throw new Error(ocrData.details || ocrData.error || 'Failed to process receipt');
      }

      if (ocrData.error) {
        console.error('OCR processing error:', ocrData.error);
        throw new Error(ocrData.error);
      }

      console.log('OCR processing complete:', ocrData);

      // Handle OCR results
      if (onOcrComplete) {
        onOcrComplete(ocrData);
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      setError(error instanceof Error ? error.message : 'Failed to process receipt');
      cleanupUpload();
    } finally {
      setIsLoading(false);
    }
  }, [onOcrComplete]);

  // Component cleanup
  React.useEffect(() => {
    return () => {
      cleanupUpload();
    };
  }, [cleanupUpload]);

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
