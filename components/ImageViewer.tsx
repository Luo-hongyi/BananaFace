import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CompareIcon } from './icons/CompareIcon';
import { ImageComparator } from './ImageComparator';
import type { Lang, Mode } from '../types';

interface ImageViewerProps {
  generatedImageUrl: string | null;
  originalImageUrl?: string | null;
  imageDimensions?: { w: number, h: number } | null;
  isLoading: boolean;
  mode: Mode;
  lang: Lang;
  onCloseImage?: () => void;
}

const EmptyPlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="w-full h-full rounded-md bg-gray-200/50 dark:bg-gray-800/50"></div>
  </div>
);

const labels = {
  generating: { en: 'Generating masterpiece...', zh: '正在生成杰作...' },
  original: { en: 'Original', zh: '原图' },
  generated: { en: 'Generated', zh: '生成图' },
  download: { en: 'Download Image', zh: '下载图片' },
  close: { en: 'Remove Image', zh: '移除图片' },
  toggleView: { en: 'Toggle Comparison View', zh: '切换对比视图' },
};

const ImageContainer: React.FC<{
    imageUrl: string;
    alt: string;
    label: string;
    aspectRatioStyle: React.CSSProperties;
    children?: React.ReactNode;
}> = ({ imageUrl, alt, label, aspectRatioStyle, children }) => (
    <div className="relative w-full flex flex-col items-center">
        <div className="relative w-full rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden" style={aspectRatioStyle}>
            <img src={imageUrl} alt={alt} className="w-full h-auto object-contain" />
            {children}
        </div>
        <p className="mt-2 text-sm font-light text-gray-500 dark:text-gray-400">{label}</p>
    </div>
);

export const ImageViewer: React.FC<ImageViewerProps> = ({
  generatedImageUrl,
  originalImageUrl,
  imageDimensions,
  isLoading,
  mode,
  lang,
  onCloseImage
}) => {
  const [generatedImageDims, setGeneratedImageDims] = useState<{w: number, h: number} | null>(null);
  const [mobileView, setMobileView] = useState<'slider' | 'stacked'>('slider');

  useEffect(() => {
    if (generatedImageUrl) {
      const img = new Image();
      img.onload = () => {
        setGeneratedImageDims({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.src = generatedImageUrl;
    } else {
      setGeneratedImageDims(null);
    }
  }, [generatedImageUrl]);

  const originalAspectRatioStyle = imageDimensions ? { aspectRatio: `${imageDimensions.w} / ${imageDimensions.h}` } : { aspectRatio: '3 / 4' };

  const generatedAspectRatioStyle = generatedImageDims
    ? { aspectRatio: `${generatedImageDims.w} / ${generatedImageDims.h}` }
    : originalAspectRatioStyle;

  const comparatorAspectRatio = imageDimensions ? `${imageDimensions.w} / ${imageDimensions.h}` : '3 / 4';

  const showTwoUp = mode === 'image-to-image' && originalImageUrl && generatedImageUrl;

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `qwenface-portrait-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CloseButton = () => onCloseImage ? (
    <button
        onClick={onCloseImage}
        title={labels.close[lang]}
        className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        aria-label={labels.close[lang]}
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
  ) : null;

  const DownloadButton = () => (
    <button
        onClick={handleDownload}
        title={labels.download[lang]}
        className="absolute top-3 right-3 p-2 bg-pink-accent/80 text-white rounded-full hover:bg-pink-accent transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        aria-label={labels.download[lang]}
    >
        <DownloadIcon />
    </button>
  );

  const renderSingleView = () => {
    if (isLoading) {
      return (
        <div
          className="relative w-full rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden mx-auto"
          style={generatedAspectRatioStyle}
        >
          <div className="flex flex-col items-center text-gray-600 dark:text-gray-400">
            <SpinnerIcon />
            <p className="mt-2 font-light">{labels.generating[lang]}</p>
          </div>
        </div>
      );
    }
    if (generatedImageUrl) {
      return (
        <div
          className="relative w-full rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden mx-auto"
          style={generatedAspectRatioStyle}
        >
          <img src={generatedImageUrl} alt="Generated Portrait" className="w-full h-full object-contain" />
          <DownloadButton />
        </div>
      );
    }
    if (mode === 'text-to-image' || !originalImageUrl) {
      return <EmptyPlaceholder />;
    }
    // Fallback for image-to-image before generation
    return (
       <div
          className="relative w-full rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden mx-auto"
          style={originalAspectRatioStyle}
        >
        <img src={originalImageUrl} alt="Original" className="w-full h-full object-contain" />
        <CloseButton />
      </div>
    );
  };

  if (!showTwoUp) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        {renderSingleView()}
      </div>
    );
  }

  // Two-up display logic
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
        {/* Mobile: Slider or Stacked View */}
        <div className="w-full md:hidden">
            {mobileView === 'slider' ? (
                <div className="relative">
                    <ImageComparator
                        originalImage={originalImageUrl!}
                        generatedImage={generatedImageUrl!}
                        aspectRatio={comparatorAspectRatio}
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                        <DownloadButton />
                        <CloseButton />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <ImageContainer imageUrl={originalImageUrl!} alt="Original" label={labels.original[lang]} aspectRatioStyle={originalAspectRatioStyle}>
                        <CloseButton />
                    </ImageContainer>
                    <ImageContainer imageUrl={generatedImageUrl!} alt="Generated" label={labels.generated[lang]} aspectRatioStyle={generatedAspectRatioStyle}>
                        <DownloadButton />
                    </ImageContainer>
                </div>
            )}
            <div className="flex justify-end mt-2">
                <button
                    onClick={() => setMobileView(v => v === 'slider' ? 'stacked' : 'slider')}
                    title={labels.toggleView[lang]}
                    aria-label={labels.toggleView[lang]}
                    className="p-2 bg-gray-200 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                >
                    <CompareIcon />
                </button>
            </div>
        </div>

        {/* Desktop: Side-by-side View */}
        <div className="hidden md:grid w-full grid-cols-2 gap-4 items-center justify-center">
            <ImageContainer imageUrl={originalImageUrl!} alt="Original" label={labels.original[lang]} aspectRatioStyle={originalAspectRatioStyle}>
                <CloseButton />
            </ImageContainer>
            <ImageContainer imageUrl={generatedImageUrl!} alt="Generated" label={labels.generated[lang]} aspectRatioStyle={generatedAspectRatioStyle}>
                <DownloadButton />
            </ImageContainer>
        </div>
    </div>
  );
};