import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { ParsedReceipt } from '../types/receipt';
import { uploadTemporaryReceipt } from '../utils/supabaseClient';

interface Props {
  onOcrComplete?: (data: ParsedReceipt) => void;
  className?: string;
}

const ReceiptUploader: React.FC<Props> = ({ onOcrComplete, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      
      console.log('Uploading receipt to temporary storage...');
      const publicUrl = await uploadTemporaryReceipt(file);
      console.log('Receipt uploaded, public URL:', publicUrl);
      
      const response = await fetch('/.netlify/functions/ocr-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: publicUrl, type: 'url' })
      });

      let receiptData;
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process receipt');
      }
      
      receiptData = await response.json();
      console.log('OCR processing complete:', receiptData);

      if (onOcrComplete) {
        onOcrComplete(receiptData);
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      setError(error instanceof Error ? error.message : 'Failed to process receipt');
      cleanupUpload();
    } finally {
      setIsLoading(false);
    }
  }, [cleanupUpload, onOcrComplete]);

  React.useEffect(() => {
    return () => cleanupUpload();
  }, [cleanupUpload]);

  return (
    <div className={`flex flex-col items-center justify-center w-full ${className}`}>
      <label
        htmlFor="receipt-upload"
        className={`
          relative cursor-pointer bg-white rounded-lg border-2 border-dashed
          border-gray-300 p-6 w-full transition-all duration-200 ease-in-out
          hover:border-indigo-500 focus-within:border-indigo-500
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        <input
          id="receipt-upload"
          name="receipt-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="max-h-48 object-contain rounded-lg"
            />
          ) : (
            <PhotoIcon className="h-12 w-12 text-gray-400" />
          )}
          
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-medium text-gray-600">
              {isLoading ? 'Processing...' : 'Upload a receipt'}
            </p>
            <p className="text-xs text-gray-500">
              PNG or JPG up to 10MB
            </p>
          </div>
        </div>
      </label>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default ReceiptUploader;
