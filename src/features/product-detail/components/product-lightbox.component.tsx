'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
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

  if (!isOpen || images.length === 0) return null;

  return (
    <ProductLightboxContent
      key={initialIndex}
      images={images}
      initialIndex={initialIndex}
      productName={productName}
      onClose={onClose}
    />
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

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

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
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed((prev) => !prev);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} image viewer`}
      className="fixed inset-0 z-50 flex flex-col bg-[#141210]/95 backdrop-blur-md text-[#FAF7F2] select-none"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="font-serif-display text-sm tracking-wide text-[#FAF7F2]">
            {productName}
          </span>
          <span className="text-xs text-[#A8A29E] font-sans">
            ({currentIndex + 1} / {images.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom In / Out Toggle Button */}
          <button
            type="button"
            onClick={toggleZoom}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 bg-white/10 hover:bg-white/20 text-xs text-[#FAF7F2] transition rounded-xs cursor-pointer"
            title={isZoomed ? 'Zoom out' : 'Zoom in for fine details'}
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

          {isZoomed && (
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="p-1.5 border border-white/20 bg-white/10 hover:bg-white/20 text-xs text-[#FAF7F2] transition rounded-xs cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-white/20 bg-white/10 hover:bg-red-900/60 text-[#FAF7F2] transition rounded-xs cursor-pointer ml-2"
            aria-label="Close image viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Large Image Viewing Area */}
      <div
        className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden cursor-pointer"
        onClick={onClose}
      >
        {/* Previous Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white transition border border-white/20 shadow-lg cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Scaled Image Frame */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed((prev) => !prev);
          }}
          onMouseMove={handleMouseMove}
          className={`relative max-h-[75vh] max-w-[85vw] aspect-[4/5] overflow-hidden transition-transform duration-200 ${
            isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          style={{
            transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
          }}
        >
          <Image
            src={currentImage}
            alt={`${productName} view ${currentIndex + 1}`}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Next Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white transition border border-white/20 shadow-lg cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="border-t border-white/10 bg-[#141210]/80 p-3 sm:p-4 z-20 flex items-center justify-center gap-2 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => {
                setIsZoomed(false);
                setCurrentIndex(idx);
              }}
              className={`relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden border-2 transition rounded-xs cursor-pointer ${
                currentIndex === idx
                  ? 'border-[#C5A059] ring-2 ring-[#C5A059]/40 opacity-100 scale-105'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
