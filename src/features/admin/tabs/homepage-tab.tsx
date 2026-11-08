'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/core/models/product.model';
import { HeroContent, StoreContent } from '@/core/models/store-content.model';
import { storeContentService } from '@/core/services/store-content.service';
import { useI18n } from '@/core/i18n/i18n.context';
import {
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Layers,
  Type,
  Link2,
  CheckCircle2,
  ShieldCheck,
  Star,
} from 'lucide-react';

interface AdminHomepageTabProps {
  products: Product[];
  onNotify: (msg: string) => void;
}

export function AdminHomepageTab({ products, onNotify }: AdminHomepageTabProps) {
  const { t } = useI18n();
  const [storeContent, setStoreContent] = useState<StoreContent>(() =>
    storeContentService.getStoreContent()
  );
  const [heroForm, setHeroForm] = useState<HeroContent>(() => storeContent.hero);
  const [isSaved, setIsSaved] = useState(false);

  // Lookup the currently selected hero products for live preview
  const primarySelectedProduct = useMemo(
    () =>
      products.find((p) => p.slug === heroForm.primaryProductSlug) ||
      products[0] ||
      null,
    [products, heroForm.primaryProductSlug]
  );

  const secondarySelectedProduct = useMemo(
    () =>
      products.find((p) => p.slug === heroForm.secondaryProductSlug) ||
      products[1] ||
      null,
    [products, heroForm.secondaryProductSlug]
  );

  const handleSave = () => {
    const updated = storeContentService.updateHeroContent(heroForm);
    setStoreContent(updated);
    setIsSaved(true);
    onNotify('Homepage & Hero content updated successfully!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (
      !window.confirm(
        'Are you sure you want to reset all Hero & Homepage texts to defaults?'
      )
    ) {
      return;
    }
    const reset = storeContentService.resetToDefaults();
    setStoreContent(reset);
    setHeroForm(reset.hero);
    onNotify('Homepage content reset to defaults.');
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#E7E0D6] bg-white p-6 shadow-xs rounded-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.admin.homepageTab.badge}</span>
          </div>
          <h2 className="font-serif-display text-2xl font-semibold text-[#1C1917]">
            {t.admin.homepageTab.title}
          </h2>
          <p className="text-xs text-[#78716C] mt-1">
            {t.admin.homepageTab.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-[#E7E0D6] bg-[#FAF7F2] px-3.5 py-2 text-xs font-semibold text-[#1C1917] hover:border-[#1C1917] transition rounded-lg shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.admin.homepageTab.viewStorefront}</span>
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 border border-[#E7E0D6] bg-white px-3.5 py-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] hover:border-[#1C1917] transition cursor-pointer rounded-lg shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.admin.homepageTab.reset}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider transition shadow-2xs cursor-pointer rounded-lg ${
              isSaved
                ? 'bg-emerald-700 text-white'
                : 'bg-[#1C1917] text-[#FAF7F2] hover:bg-[#9A7B3E]'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.admin.homepageTab.saved}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t.admin.homepageTab.saveChanges}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: HERO FEATURED PRODUCTS SHOWCASE */}
      <div className="border border-[#E7E0D6] bg-white p-6 shadow-xs rounded-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-[#E7E0D6] pb-3">
          <Star className="w-4 h-4 text-[#9A7B3E]" />
          <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
            {t.admin.homepageTab.sec1Title}
          </h3>
        </div>
        <p className="text-xs text-[#78716C]">
          {t.admin.homepageTab.sec1Sub}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Primary Showcase (Arch Frame) */}
          <div className="border border-[#E7E0D6] bg-[#FAF7F2] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                {t.admin.homepageTab.primaryArch}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#9A7B3E] font-semibold">
                Large Arch Frame
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                {t.admin.homepageTab.selectProduct}
              </label>
              <select
                value={heroForm.primaryProductSlug}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, primaryProductSlug: e.target.value })
                }
                className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.slug}>
                    [{p.category.toUpperCase()}] {p.name} — ৳{p.priceBDT} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                {t.admin.homepageTab.badgeLabel}
              </label>
              <input
                type="text"
                value={heroForm.primaryProductBadge}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, primaryProductBadge: e.target.value })
                }
                placeholder="Signature Piece"
                className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Live Preview Card */}
            {primarySelectedProduct && (
              <div className="pt-3 border-t border-[#E7E0D6] flex items-center gap-3">
                <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden bg-white border border-[#E7E0D6]">
                  <Image
                    src={primarySelectedProduct.imageUrl}
                    alt={primarySelectedProduct.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="text-xs">
                  <span className="inline-block bg-[#1C1917] text-[#FAF7F2] px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold mb-1">
                    {heroForm.primaryProductBadge || 'Signature Piece'}
                  </span>
                  <div className="font-serif-display font-semibold text-[#1C1917]">
                    {primarySelectedProduct.name}
                  </div>
                  <div className="text-[11px] text-[#78716C]">
                    {t.admin.homepageTab.currentPrice} <strong className="text-[#1C1917]">৳{primarySelectedProduct.priceBDT}</strong>
                    {primarySelectedProduct.originalPriceBDT &&
                      primarySelectedProduct.originalPriceBDT > primarySelectedProduct.priceBDT && (
                        <span className="line-through ml-1 text-[10px]">
                          ৳{primarySelectedProduct.originalPriceBDT}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card B: Secondary Floating Piece */}
          <div className="border border-[#E7E0D6] bg-[#FAF7F2] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                {t.admin.homepageTab.secondaryCard}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#9A7B3E] font-semibold">
                Bottom-Left Overlap
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                {t.admin.homepageTab.selectProduct}
              </label>
              <select
                value={heroForm.secondaryProductSlug}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, secondaryProductSlug: e.target.value })
                }
                className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.slug}>
                    [{p.category.toUpperCase()}] {p.name} — ৳{p.priceBDT} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                {t.admin.homepageTab.badgeLabel}
              </label>
              <input
                type="text"
                value={heroForm.secondaryProductBadge}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, secondaryProductBadge: e.target.value })
                }
                placeholder="316L Steel"
                className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Live Preview Card */}
            {secondarySelectedProduct && (
              <div className="pt-3 border-t border-[#E7E0D6] flex items-center gap-3">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden bg-white border border-[#E7E0D6]">
                  <Image
                    src={secondarySelectedProduct.imageUrl}
                    alt={secondarySelectedProduct.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="text-xs">
                  <span className="inline-block bg-[#C5A059] text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold mb-1">
                    {heroForm.secondaryProductBadge || '316L Steel'}
                  </span>
                  <div className="font-serif-display font-semibold text-[#1C1917]">
                    {secondarySelectedProduct.name}
                  </div>
                  <div className="text-[11px] text-[#78716C]">
                    {t.admin.homepageTab.currentPrice} <strong className="text-[#1C1917]">৳{secondarySelectedProduct.priceBDT}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: HERO TYPOGRAPHY & HEADLINE COPY */}
      <div className="border border-[#E7E0D6] bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E7E0D6] pb-3">
          <Type className="w-4 h-4 text-[#9A7B3E]" />
          <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
            {t.admin.homepageTab.sec2Title}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
              {t.admin.homepageTab.topBadge}
            </label>
            <input
              type="text"
              value={heroForm.badge}
              onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
              className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              placeholder="Curated Accessories for Bangladesh"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
              {t.admin.homepageTab.headline1}
            </label>
            <input
              type="text"
              value={heroForm.titleLine1}
              onChange={(e) => setHeroForm({ ...heroForm, titleLine1: e.target.value })}
              className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              placeholder="Where Little Wonders"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
              {t.admin.homepageTab.headlineHighlight}
            </label>
            <input
              type="text"
              value={heroForm.titleHighlight}
              onChange={(e) => setHeroForm({ ...heroForm, titleHighlight: e.target.value })}
              className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs font-semibold text-[#9A7B3E] focus:outline-none focus:border-[#C5A059]"
              placeholder="Light Up."
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
              {t.admin.homepageTab.subheading}
            </label>
            <textarea
              rows={3}
              value={heroForm.subtitle}
              onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
              className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059] leading-relaxed"
              placeholder="Where little wonders light up. Handpicked, hypoallergenic, French-style light luxury earrings..."
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: CALL TO ACTION BUTTONS */}
      <div className="border border-[#E7E0D6] bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E7E0D6] pb-3">
          <Link2 className="w-4 h-4 text-[#9A7B3E]" />
          <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
            {t.admin.homepageTab.sec3Title}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Primary CTA */}
          <div className="border border-[#E7E0D6] p-4 bg-[#FAF7F2] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] block">
              {t.admin.homepageTab.primaryDarkBtn}
            </span>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                {t.admin.homepageTab.btnLabel}
              </label>
              <input
                type="text"
                value={heroForm.primaryCtaText}
                onChange={(e) => setHeroForm({ ...heroForm, primaryCtaText: e.target.value })}
                className="w-full border border-[#D6CFC5] bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1917]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                {t.admin.homepageTab.destUrl}
              </label>
              <input
                type="text"
                value={heroForm.primaryCtaLink}
                onChange={(e) => setHeroForm({ ...heroForm, primaryCtaLink: e.target.value })}
                className="w-full border border-[#D6CFC5] bg-white px-3 py-1.5 text-xs font-mono text-[#1C1917]"
              />
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="border border-[#E7E0D6] p-4 bg-[#FAF7F2] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] block">
              {t.admin.homepageTab.secondaryOutlineBtn}
            </span>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                {t.admin.homepageTab.btnLabel}
              </label>
              <input
                type="text"
                value={heroForm.secondaryCtaText}
                onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })}
                className="w-full border border-[#D6CFC5] bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1917]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                {t.admin.homepageTab.destUrl}
              </label>
              <input
                type="text"
                value={heroForm.secondaryCtaLink}
                onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaLink: e.target.value })}
                className="w-full border border-[#D6CFC5] bg-white px-3 py-1.5 text-xs font-mono text-[#1C1917]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: TRUST METRICS & BADGES */}
      <div className="border border-[#E7E0D6] bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E7E0D6] pb-3">
          <ShieldCheck className="w-4 h-4 text-[#9A7B3E]" />
          <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
            {t.admin.homepageTab.sec4Title}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {heroForm.trustMetrics.map((metric, idx) => (
            <div key={idx} className="border border-[#E7E0D6] bg-[#FAF7F2] p-4 space-y-3">
              <span className="text-[10px] uppercase tracking-wider text-[#78716C] font-semibold block">
                Metric #{idx + 1}
              </span>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                  {t.admin.homepageTab.valueDisplay}
                </label>
                <input
                  type="text"
                  value={metric.value}
                  onChange={(e) => {
                    const next = [...heroForm.trustMetrics] as [
                      typeof metric,
                      typeof metric,
                      typeof metric
                    ];
                    next[idx] = { ...next[idx], value: e.target.value };
                    setHeroForm({ ...heroForm, trustMetrics: next });
                  }}
                  className="w-full border border-[#D6CFC5] bg-white px-3 py-1.5 text-sm font-serif-display font-bold text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                  {t.admin.homepageTab.labelDesc}
                </label>
                <input
                  type="text"
                  value={metric.label}
                  onChange={(e) => {
                    const next = [...heroForm.trustMetrics] as [
                      typeof metric,
                      typeof metric,
                      typeof metric
                    ];
                    next[idx] = { ...next[idx], label: e.target.value };
                    setHeroForm({ ...heroForm, trustMetrics: next });
                  }}
                  className="w-full border border-[#D6CFC5] bg-white px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#78716C]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: ANNOUNCEMENT & VALUE TICKERS */}
      <div className="border border-[#E7E0D6] bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E7E0D6] pb-3">
          <Layers className="w-4 h-4 text-[#9A7B3E]" />
          <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
            {t.admin.homepageTab.sec5Title}
          </h3>
        </div>

        <div className="space-y-3">
          {heroForm.tickerItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-[#C5A059] font-bold">✦</span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const next = [...heroForm.tickerItems];
                  next[idx] = e.target.value;
                  setHeroForm({ ...heroForm, tickerItems: next });
                }}
                className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#78716C] focus:text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E0D6]">
        <button
          type="button"
          onClick={handleReset}
          className="border border-[#E7E0D6] bg-white px-5 py-2.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition cursor-pointer rounded-lg shadow-2xs"
        >
          {t.admin.homepageTab.resetDefaults}
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="bg-[#1C1917] text-[#FAF7F2] hover:bg-[#9A7B3E] px-8 py-2.5 text-xs font-semibold uppercase tracking-wider transition shadow-2xs cursor-pointer rounded-lg"
        >
          {t.admin.homepageTab.saveAllChanges}
        </button>
      </div>
    </div>
  );
}

