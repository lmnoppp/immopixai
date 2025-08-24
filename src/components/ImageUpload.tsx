import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  selectedImage: { file: File; preview: string } | null;
  onImageSelect: (image: { file: File; preview: string }) => void;
  onImageRemove: () => void;
}

export function ImageUpload({ selectedImage, onImageSelect, onImageRemove }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      onImageSelect({ file, preview });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    onImageRemove();
  };

  return (
    <div className="mb-3 sm:mb-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <AnimatePresence mode="wait">
        {selectedImage ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 shadow-lg"
            style={{
              background: 'rgba(0, 153, 255, 0.1)',
              border: '2px solid rgba(0, 153, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative shrink-0">
                <img
                  src={selectedImage.preview}
                  alt="Aperçu"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg sm:rounded-xl shadow-md border-2"
                  style={{ borderColor: 'rgba(0, 153, 255, 0.3)' }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary-blue shrink-0" />
                  <p className="text-xs sm:text-sm text-text-primary font-medium truncate">
                    {selectedImage.file.name}
                  </p>
                </div>
                <p className="text-xs text-primary-blue mt-1">
                  {(selectedImage.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-3"
          >
            <Button
              variant="outline"
              onClick={handleUploadClick}
              className="w-full h-12 sm:h-16 border-2 border-dashed rounded-xl sm:rounded-2xl transition-all duration-200"
              style={{
                borderColor: 'rgba(0, 153, 255, 0.3)',
                color: '#0099FF',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 153, 255, 0.5)';
                e.currentTarget.style.background = 'rgba(0, 153, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 153, 255, 0.3)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-medium text-sm sm:text-base">Ajouter une image</span>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
