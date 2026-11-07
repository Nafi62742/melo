'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Maximize2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export interface AdminZoomImage {
  src: string;
  title: string;
  subtitle?: string;
}

interface AdminImageZoomModalProps {
  image: AdminZoomImage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminImageZoomModal({
  image,
  isOpen,
  onClose,
}: AdminImageZoomModalProps) {
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

  if (typeof document === 'undefined' || !isOpen || !image) return null;

  return createPortal(
    <AdminImageZoomContent
      key={image.src}
      image={image}
      onClose={onClose}
    />,
    document.body
  );
}

function AdminImageZoomContent({
  image,
  onClose,
}: {
  image: AdminZoomImage;
  onClose: () => void;
}) {
  const [scale, setScale] = useState<number>(1);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setScale(1);
    setZoomOrigin({ x: 50, y: 50 });
  };

  const toggleScale = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (hasError) return;
    if (scale > 1) {
      handleResetZoom();
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomOrigin({ x, y });
      setScale(2);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (scale <= 1 || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${image.title} image viewer`}
      className="fixed inset-0 flex flex-col text-[#FAF7F2] select-none animate-in fade-in duration-200"
      style={{ zIndex: 99999, backgroundColor: '#090807' }}
      onClick={onClose}
    >
      {/* Centered Floating Header Pill - Title, Zoom & Close neatly grouped */}
      <div
        className="sticky top-0 z-30 w-full pt-3 sm:pt-4 px-3 sm:px-4 flex justify-center pointer-events-none"
        style={{ zIndex: 100000 }}
      >
        <div
          className="pointer-events-auto flex items-center justify-between gap-3 sm:gap-5 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#181512] border border-[#3E3832] rounded-full shadow-2xl max-w-xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title & Subtitle */}
          <div className="flex items-center gap-2.5 truncate min-w-0 pr-1">
            <Maximize2 className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
            <div className="truncate">
              <h3 className="font-serif-display text-sm sm:text-base font-semibold text-white truncate leading-tight">
                {image.title}
              </h3>
              {image.subtitle && (
                <p className="text-[10px] text-[#D4C3A3] truncate leading-tight">{image.subtitle}</p>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Zoom Controls */}
            {!hasError && (
              <div className="flex items-center bg-[#25201A] border border-[#4E4338] rounded-full px-1.5 py-0.5 text-white">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={scale <= 1}
                  className="p-1 hover:text-[#C5A059] disabled:opacity-30 cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-1.5 py-0.5 text-[10px] font-mono hover:text-[#C5A059] cursor-pointer"
                  title="Reset zoom to 100%"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={scale >= 3.5}
                  className="p-1 hover:text-[#C5A059] disabled:opacity-30 cursor-pointer"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            )}

            {!hasError && scale > 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 bg-[#25201A] hover:bg-[#322B23] border border-[#4E4338] text-[#FAF7F2] transition cursor-pointer rounded-full"
                title="Reset Zoom (1x)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}

            <a
              href={image.src}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-[#25201A] hover:bg-[#322B23] border border-[#4E4338] text-[#D4C3A3] hover:text-white transition cursor-pointer rounded-full"
              title="Open raw image in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Prominent High-Contrast Red Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-900/95 hover:bg-red-800 border border-red-500/80 text-white font-medium text-xs transition cursor-pointer rounded-full shadow-md ml-0.5"
              title="Close Zoom (Esc)"
              aria-label="Close image zoom"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Viewport Viewing Canvas */}
      <div
        className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden cursor-pointer"
        onClick={onClose}
      >
        {/* Floating Zoom Indicator Pill */}
        {scale > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleResetZoom();
            }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] hover:bg-[#2A241E] border border-[#C5A059] text-xs font-medium text-[#FAF7F2] rounded-full shadow-2xl transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Click to Reset Zoom ({Math.round(scale * 100)}%)</span>
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
              {image.src}
            </p>
            <a
              href={image.src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25201A] border border-[#3E3832] text-xs text-[#C5A059] hover:text-white transition rounded-full"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Try Opening Direct Link</span>
            </a>
          </div>
        ) : (
          <div
            onClick={toggleScale}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className={`relative transition-transform duration-200 ease-out flex items-center justify-center ${
              scale > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            }}
          >
            {/* Native <img> for raw quality and fast loading */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={(el) => {
                if (el && el.complete && el.naturalWidth > 0 && isLoading) {
                  setIsLoading(false);
                }
              }}
              src={image.src}
              alt={image.title}
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
      </div>

      {/* Subtle Bottom Status Bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t border-[#2E2822] bg-[#14120F] text-[11px] text-[#A8A29E] flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="truncate max-w-[320px] sm:max-w-md font-mono">{image.src}</span>
        <span className="hidden sm:inline italic">
          Click image to toggle 2x &bull; Move mouse to pan &bull; Esc to close
        </span>
      </div>
    </div>
  );
}
