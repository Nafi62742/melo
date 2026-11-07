'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Maximize2,
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
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F0D0B]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Key-reset inner content for zero-effect state reset */}
      <AdminImageZoomContent
        key={image.src}
        image={image}
        onClose={onClose}
      />
    </div>
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

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 0.75));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const toggleScale = () => {
    setScale((prev) => (prev === 1 ? 2 : 1));
  };

  return (
    <div className="relative z-50 flex flex-col w-full max-w-4xl max-h-[92vh] bg-[#181512] border border-[#3E3832] shadow-2xl overflow-hidden">
      {/* Top Control Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#2E2822] bg-[#14120F]">
        <div className="flex items-center gap-3 truncate pr-4">
          <Maximize2 className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
          <div className="truncate">
            <h3 className="font-serif-display text-base sm:text-lg font-medium text-white truncate">
              {image.title}
            </h3>
            {image.subtitle && (
              <p className="text-[11px] text-[#A8A29E] truncate">{image.subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Zoom Controls */}
          <div className="flex items-center bg-[#25201A] border border-[#3E3832] rounded-xs px-1 text-white">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.75}
              className="p-1.5 hover:text-[#C5A059] disabled:opacity-30 cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 text-[10px] font-mono hover:text-[#C5A059] cursor-pointer"
              title="Reset zoom to 100%"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 3.5}
              className="p-1.5 hover:text-[#C5A059] disabled:opacity-30 cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 border border-[#3E3832] bg-[#25201A] text-[#A8A29E] hover:text-white transition cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Open Original */}
          <a
            href={image.src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[#3E3832] bg-[#25201A] text-[#A8A29E] hover:text-[#C5A059] transition cursor-pointer"
            title="Open raw image file in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 border border-[#3E3832] bg-[#25201A] text-[#A8A29E] hover:text-white hover:bg-red-950/60 hover:border-red-800 transition cursor-pointer ml-1"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewport Area */}
      <div
        className="relative flex-1 min-h-[420px] sm:min-h-[520px] flex items-center justify-center p-4 sm:p-8 overflow-auto bg-[#0F0D0B] cursor-zoom-in"
        onClick={toggleScale}
      >
        <div
          className="relative transition-transform duration-200 ease-out flex items-center justify-center"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] shadow-2xl">
            <Image
              src={image.src}
              alt={image.title}
              fill
              sizes="(max-width: 768px) 90vw, 600px"
              className="object-contain select-none"
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom Status / Hint Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#2E2822] bg-[#14120F] text-[11px] text-[#A8A29E]">
        <span className="truncate max-w-md font-mono">{image.src}</span>
        <span className="hidden sm:inline italic">
          Click image to toggle 2x zoom &bull; Use zoom buttons for up to 3.5x
        </span>
      </div>
    </div>
  );
}
