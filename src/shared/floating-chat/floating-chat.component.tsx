'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  // WhatsApp number and Facebook Page URL
  const whatsappNumber = '8801522111036'; // 01522111036
  const facebookUrl = 'https://www.facebook.com/profile.php?id=61596527274952';

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hi MELO! I would like to know more about your jewellery collection and delivery.'
  )}`;
  const messengerUrl = facebookUrl;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanded Support Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 rounded-2xl bg-white p-4 shadow-2xl border border-stone-200/90 transition-all animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-stone-900 text-amber-100 font-bold text-xs shadow-xs">
                M
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1 font-serif">
                  <span>MELO Support</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online • Typically replies in 5m</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              aria-label="Close chat support options"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="my-3 text-xs text-stone-600 leading-relaxed">
            Have a question about earring clips, ring sizing, or order delivery in Bangladesh? Chat with us directly:
          </p>

          {/* Chat Channels */}
          <div className="space-y-2">
            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 p-2.5 transition border border-[#25D366]/20 text-stone-900 group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366] text-white shadow-sm group-hover:scale-105 transition-transform">
                {/* WhatsApp SVG Icon */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-stone-900">WhatsApp Chat</div>
                <div className="text-[10px] text-stone-500">Fast direct messaging</div>
              </div>
              <span className="rounded-full bg-[#25D366] px-2 py-0.5 text-[10px] font-bold text-white">
                Chat
              </span>
            </a>

            {/* Facebook Messenger Button */}
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-[#0084FF]/10 hover:bg-[#0084FF]/20 p-2.5 transition border border-[#0084FF]/20 text-stone-900 group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white shadow-sm group-hover:scale-105 transition-transform">
                {/* Messenger SVG Icon */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.745 6.616 4.472 8.652v4.237l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.196 14.949l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-stone-900">Facebook Messenger</div>
                <div className="text-[10px] text-stone-500">Official Page Chat</div>
              </div>
              <span className="rounded-full bg-[#0084FF] px-2 py-0.5 text-[10px] font-bold text-white">
                Message
              </span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Quick WhatsApp circular button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/25 hover:scale-110 active:scale-95 transition-all"
          title="Chat directly on WhatsApp"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>

        {/* Quick Facebook Messenger circular button */}
        <a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white shadow-lg shadow-blue-500/25 hover:scale-110 active:scale-95 transition-all"
          title="Message on Facebook"
          aria-label="Message on Facebook"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.745 6.616 4.472 8.652v4.237l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.196 14.949l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z" />
          </svg>
        </a>

        {/* Support Toggle Pill */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-12 items-center gap-2 rounded-full px-4 text-xs font-bold shadow-lg transition-all ${
            isOpen
              ? 'bg-stone-900 text-stone-200 hover:bg-stone-800'
              : 'bg-stone-900 text-amber-100 shadow-stone-900/30 hover:bg-amber-800 hover:text-white hover:scale-105 active:scale-95'
          }`}
          aria-label="Toggle chat options menu"
        >
          {isOpen ? (
            <>
              <X className="w-4 h-4" />
              <span>Close</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Need Help?</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

