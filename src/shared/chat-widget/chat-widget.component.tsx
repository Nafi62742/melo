'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, PhoneCall, ExternalLink } from 'lucide-react';
import { storeLinkService, STORE_LINKS_UPDATED_EVENT } from '@/core/services/store-link.service';
import { StoreLink, DEFAULT_STORE_LINKS } from '@/core/models/store-link.model';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<StoreLink[]>(DEFAULT_STORE_LINKS);

  useEffect(() => {
    const refreshLinks = () => {
      setLinks([...storeLinkService.getAllLinks()]);
    };

    refreshLinks();
    void storeLinkService.syncFromDatabase().then((remote) => {
      setLinks([...remote]);
    });

    window.addEventListener(STORE_LINKS_UPDATED_EVENT, refreshLinks);
    return () => {
      window.removeEventListener(STORE_LINKS_UPDATED_EVENT, refreshLinks);
    };
  }, []);

  const whatsappLink = links.find((l) => l.key === 'whatsapp' && l.isActive && l.url);
  const messengerLink = links.find((l) => l.key === 'messenger' && l.isActive && l.url);
  const customChatLinks = links.filter(
    (l) => l.category === 'chat' && l.isActive && l.url && l.key !== 'whatsapp' && l.key !== 'messenger'
  );

  const whatsappUrl = whatsappLink
    ? whatsappLink.url.includes('?')
      ? whatsappLink.url
      : `${whatsappLink.url}?text=${encodeURIComponent(
          'Hello MELO! I have a question about your collection.'
        )}`
    : '';
  const messengerUrl = messengerLink ? messengerLink.url : '';

  if (!whatsappUrl && !messengerUrl && customChatLinks.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Hover / Click Popup Card */}
      <div
        className={`mb-3 w-72 sm:w-80 border border-[#C5A059] bg-[#FAF7F2] shadow-2xl transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Popup Header */}
        <div className="bg-[#181512] px-4 py-3.5 text-[#FAF7F2] flex items-center justify-between border-b border-[#2E2925]">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div>
              <div className="font-serif-display text-base font-medium tracking-wide text-[#FAF7F2] leading-none">
                MELO Concierge
              </div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#C5A059] mt-1">
                Instant Chat Support
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-[#A8A29E] hover:text-white p-1 transition cursor-pointer"
            aria-label="Close chat popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Popup Body */}
        <div className="p-4 space-y-3 bg-white">
          <div className="flex items-start gap-2 text-xs text-[#78716C] bg-[#FAF7F2] border border-[#E7E0D6] p-3">
            <Sparkles className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
            <span>
              Need help choosing French ear clips, ring sizing, or tracking your order? Chat with us directly:
            </span>
          </div>

          {/* WhatsApp Chat Option */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border border-[#E7E0D6] bg-white p-3 hover:border-emerald-600 hover:bg-emerald-50/30 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1C1917] group-hover:text-emerald-800">
                    {whatsappLink?.label || 'WhatsApp Chat'}
                  </div>
                  <div className="text-[10px] text-[#78716C]">Replies within minutes</div>
                </div>
              </div>
              <Send className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-emerald-700 group-hover:translate-x-0.5 transition" />
            </a>
          )}

          {/* Facebook Messenger Option */}
          {messengerUrl && (
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border border-[#E7E0D6] bg-white p-3 hover:border-blue-600 hover:bg-blue-50/30 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1C1917] group-hover:text-blue-800">
                    {messengerLink?.label || 'Facebook Messenger'}
                  </div>
                  <div className="text-[10px] text-[#78716C]">Message our official page</div>
                </div>
              </div>
              <Send className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
            </a>
          )}

          {/* Any Additional Custom Chat Channels Added in Admin */}
          {customChatLinks.map((custom) => (
            <a
              key={custom.key}
              href={custom.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border border-[#E7E0D6] bg-white p-3 hover:border-[#C5A059] hover:bg-[#FAF7F2] transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181512] text-[#C5A059] shadow-xs">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1C1917] group-hover:text-[#9A7B3E]">
                    {custom.label}
                  </div>
                  <div className="text-[10px] text-[#78716C]">Direct Support Link</div>
                </div>
              </div>
              <Send className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-[#9A7B3E] group-hover:translate-x-0.5 transition" />
            </a>
          ))}
        </div>
      </div>

      {/* Floating Bottom-Right Hovering Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Quick Direct WhatsApp Floating Circle */}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
          </a>
        )}

        {/* Quick Direct Messenger Floating Circle */}
        {messengerUrl && (
          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on Facebook Messenger"
            title="Chat on Messenger"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-lg hover:bg-blue-600 hover:scale-105 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        )}

        {/* Main Boutique Chat Toggle Pill */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle live chat popup"
          className="flex items-center gap-2 rounded-full border border-[#C5A059] bg-[#181512] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#FAF7F2] shadow-xl hover:bg-[#9A7B3E] hover:border-[#9A7B3E] transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-[#C5A059]" />
          <span className="hidden sm:inline">Chat with Us</span>
        </button>
      </div>
    </div>
  );
}
