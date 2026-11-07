'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface ProductLightboxProps {
  images: string[];
  initialIndex?: number;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductLightbox({
  images,
  initialIndex = 0,
  productName,
  isOpen,
  onClose,
}: ProductLightboxProps) {
  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (typeof document === 'undefined' || !isOpen || images.length === 0) return null;

  return createPortal(
    <ProductLightboxContent
      key={initialIndex}
      images={images}
      initialIndex={initialIndex}
      productName={productName}
      onClose={onClose}
    />,
    document.body
  );
}

interface ProductLightboxContentProps {
  images: string[];
  initialIndex: number;
  productName: string;
  onClose: () => void;
}

function ProductLightboxContent({
  images,
  initialIndex,
  productName,
  onClose,
}: ProductLightboxContentProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setIsLoading(true);
    setHasError(false);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setIsLoading(true);
    setHasError(false);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleSelectThumbnail = (idx: number) => {
    setIsZoomed(false);
    setIsLoading(true);
    setHasError(false);
    setCurrentIndex(idx);
  };

  // Keyboard navigation: Escape to close, Arrows to paginate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  const currentImage = images[currentIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isZoomed || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasError) return;
    setIsZoomed((prev) => !prev);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} image viewer`}
      className="fixed inset-0 flex flex-col text-[#FAF7F2] select-none animate-in fade-in duration-200"
      style={{ zIndex: 99999, backgroundColor: '#090807' }}
      onClick={onClose}
    >
      {/* Centered Floating Header Pill - Name, Zoom & Close grouped together */}
      <div
        className="sticky top-0 z-30 w-full pt-3 sm:pt-4 px-3 sm:px-4 flex justify-center pointer-events-none"
        style={{ zIndex: 100000 }}
      >
        <div
          className="pointer-events-auto flex items-center justify-between gap-3 sm:gap-5 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#181512] border border-[#3E3832] rounded-full shadow-2xl max-w-xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Product Name & Index */}
          <div className="flex items-center gap-2.5 truncate min-w-0 pr-1">
            <span className="font-serif-display text-sm sm:text-base font-semibold tracking-wide text-white truncate">
              {productName}
            </span>
            <span className="text-[11px] font-mono text-[#D4C3A3] bg-[#2E2822] border border-[#443C35] px-2 py-0.5 rounded-full flex-shrink-0">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Zoom In / Out Toggle Button */}
            {!hasError && (
              <button
                type="button"
                onClick={toggleZoom}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25201A] hover:bg-[#322B23] border border-[#4E4338] text-xs font-medium text-white transition rounded-full cursor-pointer shadow-sm"
                title={isZoomed ? 'Zoom out (1x)' : 'Zoom in (2.5x)'}
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="hidden sm:inline">1x Normal</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="hidden sm:inline">2.5x Zoom</span>
                  </>
                )}
              </button>
            )}

            {isZoomed && !hasError && (
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1.5 bg-[#25201A] hover:bg-[#322B23] border border-[#4E4338] text-xs text-[#FAF7F2] transition rounded-full cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Prominent High-Contrast Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-900/95 hover:bg-red-800 border border-red-500/80 text-white font-medium text-xs transition cursor-pointer rounded-full shadow-md"
              aria-label="Close image viewer"
              title="Close (Esc)"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Large Image Viewing Area */}
      <div
        className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden cursor-pointer"
        onClick={onClose}
      >
        {/* Floating "Exit Zoom" Pill when zoomed in */}
        {isZoomed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] hover:bg-[#2A241E] border border-[#C5A059] text-xs font-medium text-[#FAF7F2] rounded-full shadow-2xl transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Click to Exit Zoom (1x Normal)</span>
          </button>
        )}

        {/* Previous Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#181512] hover:bg-[#25201A] text-white transition border border-[#443C35] shadow-xl cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Loading Spinner */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-400 z-10 pointer-events-none">
            <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
            <span className="text-xs tracking-wider">Loading image...</span>
          </div>
        )}

        {/* Error Fallback */}
        {hasError ? (
          <div
            className="flex flex-col items-center justify-center p-8 text-center max-w-md z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
            <h4 className="font-serif-display text-lg text-white font-medium mb-1">
              Image Could Not Be Loaded
            </h4>
            <p className="text-xs text-[#A8A29E] mb-4 font-mono break-all">
              {currentImage}
            </p>
          </div>
        ) : (
          /* Scaled Image Frame */
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed((prev) => !prev);
            }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className={`relative transition-transform duration-200 ease-out flex items-center justify-center ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            style={{
              transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            }}
          >
            {/* Native <img> guarantees support for all local/remote formats and uncompressed raw display */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={(el) => {
                if (el && el.complete && el.naturalWidth > 0 && isLoading) {
                  setIsLoading(false);
                }
              }}
              src={currentImage}
              alt={`${productName} view ${currentIndex + 1}`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className="max-h-[82vh] sm:max-h-[86vh] max-w-[92vw] object-contain shadow-2xl transition-opacity duration-300 select-none rounded-xs"
              style={{ opacity: isLoading ? 0 : 1 }}
            />
          </div>
        )}

        {/* Next Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#181512] hover:bg-[#25201A] text-white transition border border-[#443C35] shadow-xl cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="border-t border-[#2E2822] bg-[#141210] p-3 sm:p-4 z-20 flex items-center justify-center gap-2 overflow-x-auto flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => handleSelectThumbnail(idx)}
              className={`relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden border-2 transition rounded-xs cursor-pointer ${
                currentIndex === idx
                  ? 'border-[#C5A059] ring-2 ring-[#C5A059]/40 opacity-100 scale-105'
                  : 'border-[#3E3832] opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
