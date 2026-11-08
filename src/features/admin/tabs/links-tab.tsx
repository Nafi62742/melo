'use client';

import React from 'react';
import { StoreLink, StoreLinkCategory } from '@/core/models/store-link.model';
import { Link2, Trash2 } from 'lucide-react';
import { useI18n } from '@/core/i18n/i18n.context';

interface AdminLinksTabProps {
  storeLinks: StoreLink[];
  onChangeStoreLinks: (links: StoreLink[]) => void;
  onUpdateStoreLink: (link: StoreLink) => void;
  onDeleteStoreLink: (link: StoreLink) => void;
  newLinkKey: string;
  onChangeNewLinkKey: (val: string) => void;
  newLinkLabel: string;
  onChangeNewLinkLabel: (val: string) => void;
  newLinkUrl: string;
  onChangeNewLinkUrl: (val: string) => void;
  newLinkCategory: StoreLinkCategory;
  onChangeNewLinkCategory: (cat: StoreLinkCategory) => void;
  onAddNewStoreLink: (e: React.FormEvent) => void;
}

export function AdminLinksTab({
  storeLinks,
  onChangeStoreLinks,
  onUpdateStoreLink,
  onDeleteStoreLink,
  newLinkKey,
  onChangeNewLinkKey,
  newLinkLabel,
  onChangeNewLinkLabel,
  newLinkUrl,
  onChangeNewLinkUrl,
  newLinkCategory,
  onChangeNewLinkCategory,
  onAddNewStoreLink,
}: AdminLinksTabProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div className="border border-[#E7E0D6] bg-white p-6 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E0D6] gap-2">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-5 h-5 text-[#9A7B3E]" />
            <div>
              <h2 className="font-serif-display text-2xl font-medium text-[#1C1917]">
                {t.admin.linksTab.title}
              </h2>
              <p className="text-xs text-[#78716C]">
                {t.admin.linksTab.subtitle}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-[#78716C]">
            Table:{' '}
            <code className="bg-[#FAF7F2] px-1.5 py-0.5 text-[#1C1917] rounded">public.store_links</code>
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {storeLinks.map((item) => (
            <div
              key={item.key}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-[#E7E0D6] bg-[#FAF7F2]/60 p-4 rounded-xl"
            >
              <div className="md:col-span-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1C1917]">{item.label}</span>
                  <span className="border border-[#E6D5B8] bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#9A7B3E] rounded-md">
                    {item.category}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#78716C] mt-0.5">key: {item.key}</div>
              </div>

              <div className="md:col-span-6">
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => {
                    const updated = storeLinks.map((l) =>
                      l.key === item.key ? { ...l, url: e.target.value } : l
                    );
                    onChangeStoreLinks(updated);
                  }}
                  placeholder={
                    item.key === 'whatsapp'
                      ? 'https://wa.me/88017XXXXXXXX or 017XXXXXXXX'
                      : item.key === 'messenger'
                      ? 'https://m.me/yourpage or page username'
                      : 'https://...'
                  }
                  className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059] rounded-lg"
                />
              </div>

              <div className="md:col-span-3 flex items-center justify-end gap-2">
                <label className="flex items-center gap-1.5 text-xs text-[#1C1917] cursor-pointer mr-2">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(e) => {
                      const updatedLink = { ...item, isActive: e.target.checked };
                      onUpdateStoreLink(updatedLink);
                    }}
                    className="accent-[#1C1917] rounded"
                  />
                  <span className="text-[11px] font-semibold">{t.admin.linksTab.active}</span>
                </label>

                <button
                  type="button"
                  onClick={() => onUpdateStoreLink(item)}
                  className="boutique-btn-primary px-3.5 py-2 text-[10px] cursor-pointer rounded-lg shadow-2xs"
                >
                  {t.admin.linksTab.saveUrl}
                </button>

                {item.key !== 'whatsapp' && item.key !== 'messenger' && (
                  <button
                    type="button"
                    onClick={() => onDeleteStoreLink(item)}
                    className="p-2 text-[#A8A29E] hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition"
                    title={`Delete ${item.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Any Custom URL Form */}
      <form
        onSubmit={onAddNewStoreLink}
        className="border border-[#C5A059] bg-white p-6 space-y-4 rounded-xl shadow-xs"
      >
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] block">
            {t.admin.linksTab.addBadge}
          </span>
          <h3 className="font-serif-display text-2xl font-medium text-[#1C1917]">
            {t.admin.linksTab.addTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
              {t.admin.linksTab.displayLabel}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Telegram Support / YouTube"
              value={newLinkLabel}
              onChange={(e) => onChangeNewLinkLabel(e.target.value)}
              className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
              {t.admin.linksTab.uniqueKey}
            </label>
            <input
              type="text"
              placeholder="e.g. telegram"
              value={newLinkKey}
              onChange={(e) => onChangeNewLinkKey(e.target.value)}
              className="w-full border border-[#D6CFC5] px-3 py-2 font-mono text-[#1C1917] focus:outline-none focus:border-[#C5A059] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
              {t.admin.linksTab.fullUrl}
            </label>
            <input
              type="text"
              required
              placeholder="https://..."
              value={newLinkUrl}
              onChange={(e) => onChangeNewLinkUrl(e.target.value)}
              className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
              {t.admin.linksTab.placementCategory}
            </label>
            <select
              value={newLinkCategory}
              onChange={(e) => onChangeNewLinkCategory(e.target.value as StoreLinkCategory)}
              className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] bg-white focus:outline-none focus:border-[#C5A059] rounded-lg"
            >
              <option value="chat">{t.admin.linksTab.catChat}</option>
              <option value="social">{t.admin.linksTab.catSocial}</option>
              <option value="other">{t.admin.linksTab.catOther}</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="boutique-btn-primary px-6 py-2.5 cursor-pointer rounded-lg shadow-2xs"
          >
            {t.admin.linksTab.addUrlBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

