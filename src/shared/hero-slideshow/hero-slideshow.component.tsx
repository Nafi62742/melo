'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface Slide {
  id: string;
  image: string;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    image: '/slideshow/IMG_8741.webp',
    badge: 'Real Studio Shot',
    title: 'Dainty Charm',
    highlight: 'Bracelets',
    subtitle: 'Shimmering adjustable wristwear crafted for everyday elegance and festive looks.',
    ctaText: 'Shop Bracelets',
    ctaLink: '/shop?category=bracelets',
  },
  {
    id: 'slide-2',
    image: '/slideshow/IMG_8749.webp',
    badge: 'Curated Rings',
    title: 'Minimalist Band',
    highlight: 'Rings',
    subtitle: 'Polished, tarnish-resistant stainless steel bands crafted for accessible everyday luxury.',
    ctaText: 'Shop Rings',
    ctaLink: '/shop?category=rings',
  },
  {
    id: 'slide-3',
    image: '/slideshow/IMG_8745.webp',
    badge: 'Light Luxury Collection',
    title: 'Where Little Wonders',
    highlight: 'Light Up',
    subtitle: 'French-style light luxury earrings, hypoallergenic ear clips & comfortable silicone cushions.',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
  },
  {
    id: 'slide-4',
    image: '/slideshow/IMG_8753.webp',
    badge: 'Everyday Stacking',
    title: 'Vintage & Modern',
    highlight: 'Stackables',
    subtitle: 'Mix, match, and stack delicate bands designed to elevate any outfit.',
    ctaText: 'Browse Rings',
    ctaLink: '/shop?category=rings',
  },
  {
    id: 'slide-5',
    image: '/slideshow/IMG_8748.webp',
    badge: 'Gift Ready',
    title: 'A Little Something For',
    highlight: 'Everyone',
    subtitle: 'Cash on delivery nationwide across Bangladesh. Dhaka delivery in 24–48 hours.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
  },
];

export function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 45;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Autoplay timer (5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Touch Swipe Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-900 text-white shadow-xl touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container (Optimized height for mobile: min 420px; desktop: aspect 21/9) */}
      <div className="relative h-[420px] sm:h-[460px] md:h-auto md:aspect-[21/9] w-full max-h-[580px] overflow-hidden">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                priority={index === 0}
                className={`object-cover object-center transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />

              {/* Mobile-first Gradient: darker at the bottom for crystal-clear readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25 md:bg-gradient-to-r md:from-black/85 md:via-black/50 md:to-transparent" />

              {/* Slide Content */}
              <div className="absolute inset-0 flex items-end sm:items-center pb-12 sm:pb-0">
                <div className="mx-auto max-w-7xl px-5 sm:px-12 lg:px-16 w-full">
                  <div className="max-w-xl space-y-2.5 sm:space-y-4">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-900/60 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-amber-200 border border-amber-300/30 shadow-xs">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{slide.badge}</span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight leading-tight">
                      {slide.title}{' '}
                      <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-amber-100 bg-clip-text text-transparent">
                        {slide.highlight}
                      </span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-md leading-relaxed">
                      {slide.subtitle}
                    </p>

                    {/* Action Button */}
                    <div className="pt-1 sm:pt-2">
                      <Link
                        href={slide.ctaLink}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-200 to-amber-100 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-stone-950 shadow-lg shadow-black/40 hover:from-white hover:to-amber-50 hover:text-stone-900 active:scale-95 transition-all"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-950" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Navigation Chevrons (Hidden on mobile to keep screen uncluttered; swipe enabled) */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 hover:bg-black/70 hover:scale-105 active:scale-95 transition"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 hover:bg-black/70 hover:scale-105 active:scale-95 transition"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Slide Indicator Dots (Enlarged tap targets for mobile thumbs) */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 p-1 sm:p-0 ${
              index === currentIndex
                ? 'w-6 sm:w-8 bg-white shadow-sm'
                : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
