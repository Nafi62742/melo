'use client';

import React from 'react';
import { StoreLink, StoreLinkCategory } from '@/core/models/store-link.model';
import { Link2, Trash2, Plus } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="border border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.admin.linksTab.title}
              </h2>
              <p className="text-xs text-slate-500">
                {t.admin.linksTab.subtitle}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Table: <code className="bg-slate-100 px-2 py-0.5 text-slate-800 rounded border border-slate-200 font-bold">public.store_links</code>
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {storeLinks.map((item) => (
            <div
              key={item.key}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-slate-200 bg-slate-50/70 p-4 rounded-xl shadow-2xs"
            >
              <div className="md:col-span-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  <span className="border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-700 rounded-md shadow-2xs">
                    {item.category}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">key: {item.key}</div>
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
                  className="w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-lg shadow-2xs"
                />
              </div>

              <div className="md:col-span-3 flex items-center justify-end gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer mr-2">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(e) => {
                      const updatedLink = { ...item, isActive: e.target.checked };
                      onUpdateStoreLink(updatedLink);
                    }}
                    className="accent-slate-900 rounded"
                  />
                  <span className="text-[11px] font-semibold">{t.admin.linksTab.active}</span>
                </label>

                <button
                  type="button"
                  onClick={() => onUpdateStoreLink(item)}
                  className="bg-slate-900 hover:bg-black text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg shadow-xs transition"
                >
                  {t.admin.linksTab.saveUrl}
                </button>

                {item.key !== 'whatsapp' && item.key !== 'messenger' && (
                  <button
                    type="button"
                    onClick={() => onDeleteStoreLink(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                    title={`Delete ${item.label}`}
                  >
                    <Trash2 className="w-4 h-4" />
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
        className="border border-slate-200 bg-white p-6 space-y-4 rounded-2xl shadow-xs"
      >
        <div className="border-b border-slate-100 pb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {t.admin.linksTab.addBadge}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            {t.admin.linksTab.addTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.admin.linksTab.displayLabel} *
            </label>
            <input
              type="text"
              required
              value={newLinkLabel}
              onChange={(e) => onChangeNewLinkLabel(e.target.value)}
              placeholder="e.g. Telegram Support / YouTube"
              className="w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-xl shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.admin.linksTab.uniqueKey}
            </label>
            <input
              type="text"
              value={newLinkKey}
              onChange={(e) => onChangeNewLinkKey(e.target.value)}
              placeholder="e.g. telegram"
              className="w-full border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-xl shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.admin.linksTab.fullUrl} *
            </label>
            <input
              type="text"
              required
              value={newLinkUrl}
              onChange={(e) => onChangeNewLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-xl shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.admin.linksTab.placementCategory}
            </label>
            <select
              value={newLinkCategory}
              onChange={(e) => onChangeNewLinkCategory(e.target.value as StoreLinkCategory)}
              className="w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 rounded-xl shadow-2xs"
            >
              <option value="chat" className="bg-white text-slate-900">
                Floating Concierge Chat
              </option>
              <option value="social" className="bg-white text-slate-900">
                Footer Social Icon
              </option>
              <option value="footer" className="bg-white text-slate-900">
                Footer Custom Link (other)
              </option>
              <option value="other" className="bg-white text-slate-900">
                Other
              </option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store Link</span>
          </button>
        </div>
      </form>
    </div>
  );
}
