
import React, { useCallback } from 'react';
import type { Lang } from '../types';
import { UploadIcon } from './icons/UploadIcon';

const UploadPlaceholder: React.FC<{lang: Lang}> = ({ lang }) => (
    <div className="text-center p-4 flex flex-col items-center justify-center">
      <UploadIcon />
      <p className="text-gray-500 dark:text-gray-400 font-light mt-2">
        {lang === 'zh' 
          ? '点击或拖拽图片到此处' 
          : 'Click or drag image here to upload'}
      </p>
    </div>
);

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  lang: Lang;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, lang }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageChange(e.target.files[0]);
    }
  };
  
  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onImageChange]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <label 
        htmlFor="image-upload" 
        className="relative flex flex-col items-center justify-center w-full h-full min-h-[300px] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-pink-accent dark:hover:border-pink-accent/80 cursor-pointer transition-colors"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <UploadPlaceholder lang={lang} />
        <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
      </label>
    </div>
  );
};