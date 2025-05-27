import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from './Dialog';
import { CheckCircleIcon, ClipboardIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface SaveAndShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (password?: string) => Promise<string>;
  vendorName?: string;
}

export const SaveAndShareDialog = ({ isOpen, onClose, onSave, vendorName }: SaveAndShareDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [password, setPassword] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const savedUrl = await onSave(password || undefined);
      setShareLink(savedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save split');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareLink) return;

    // Try native share on mobile devices
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobileDevice && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'SplitFair - Shared Bill Split',
          text: `${vendorName ? `Check out the bill split for ${vendorName}` : 'Check out this bill split'} on SplitFair!`,
          url: shareLink
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.log('Share failed, trying clipboard:', err);
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareLink);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Unable to copy automatically. Please copy the link manually.');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Save & Share">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-gray-600">Saving your split...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              <p className="font-medium">Failed to save split</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={handleSave}
              className="btn-primary w-full"
            >
              Try Again
            </button>
          </motion.div>
        ) : shareLink ? (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">Split saved</span>
                <span className="text-sm text-gray-600 ml-auto">Expires in 5 days</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="input-field flex-1 text-sm"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={handleShare}
                  className="btn-primary px-4 flex items-center gap-2 min-w-[120px]"
                  disabled={showCopySuccess}
                >
                  {showCopySuccess ? (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-5 w-5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-secondary w-full"
            >
              Done
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <LockClosedIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Password Protection</span>
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full"
                  placeholder="Leave blank for no password"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Add a password to restrict who can view and edit this split
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="btn-primary w-full"
            >
              Generate Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
