/**
 * MELO Admin Panel — Centralized Color Palette & Theme Tokens
 *
 * All color schemes, backgrounds, borders, text, status badges, buttons,
 * and inputs for the administration dashboard are centralized here.
 *
 * To change the look or feel of the Admin Panel, adjust the tokens below.
 */

export const ADMIN_COLORS = {
  // Base Canvas & Surfaces
  base: {
    pageBg: '#F8FAFC',        // slate-50: Main dashboard canvas
    surface: '#FFFFFF',       // white: Cards, modals, popovers
    surfaceSubtle: '#F1F5F9', // slate-100: Table headers, switcher pills well
    surfaceHover: '#F8FAFC',  // slate-50: Row and item hover
    well: '#F8FAFC',          // slate-50: Sub-containers inside cards
  },

  // Borders
  border: {
    subtle: '#F1F5F9',        // slate-100: Subtle inner dividers
    default: '#E2E8F0',       // slate-200: Standard card & table borders
    strong: '#CBD5E1',        // slate-300: Active inputs & focused borders
    dark: '#334155',          // slate-700: Dark badges & contrast outlines
  },

  // Typography
  text: {
    primary: '#0F172A',       // slate-900: High-emphasis titles, labels, prices
    secondary: '#334155',     // slate-700: Body text, table headers
    muted: '#64748B',         // slate-500: Subtitles, helper notes, timestamps
    subtle: '#94A3B8',        // slate-400: Placeholders & disabled indicators
    white: '#FFFFFF',         // white: High-contrast buttons & pill badges
  },

  // Primary Action & Identity
  brand: {
    primary: '#0F172A',       // slate-900: Monogram, primary button, active tabs
    hover: '#1E293B',         // slate-800: Hover state for primary buttons
    active: '#020617',        // slate-950: Active/pressed state
    text: '#FFFFFF',          // Text on brand elements
  },

  // Functional Status Badges & Accents
  status: {
    // Pending / Low Stock / Waiting
    pending: {
      bg: '#FFFBEB',          // amber-50
      text: '#92400E',        // amber-800
      border: '#FDE68A',      // amber-200
      solid: '#D97706',       // amber-600
      badge: '#F59E0B',       // amber-500
    },
    // Confirmed / In Stock / Paid / Operational
    confirmed: {
      bg: '#ECFDF5',          // emerald-50
      text: '#065F46',        // emerald-800
      border: '#A7F3D0',      // emerald-200
      solid: '#059669',       // emerald-600
      badge: '#10B981',       // emerald-500
    },
    // Dispatched / In Transit / Shipped
    dispatched: {
      bg: '#EEF2FF',          // indigo-50
      text: '#3730A3',        // indigo-800
      border: '#C7D2FE',      // indigo-200
      solid: '#4F46E5',       // indigo-600
      badge: '#6366F1',       // indigo-500
    },
    // Delivered / Completed / Successful
    delivered: {
      bg: '#EFF6FF',          // blue-50
      text: '#1E40AF',        // blue-800
      border: '#BFDBFE',      // blue-200
      solid: '#2563EB',       // blue-600
      badge: '#3B82F6',       // blue-500
    },
    // Cancelled / Sold Out / Critical Alert
    cancelled: {
      bg: '#FFF1F2',          // rose-50
      text: '#9F1239',        // rose-800
      border: '#FECDD3',      // rose-200
      solid: '#E11D48',       // rose-600
      badge: '#EF4444',       // red-500
    },
    // Urgent Alert / Attention Pulse
    alert: {
      bg: '#FFF1F2',          // rose-50
      text: '#9F1239',        // rose-900
      border: '#FECDD3',      // rose-200
      solid: '#E11D48',       // rose-600
      badge: '#EF4444',       // red-500
    },
    // Neutral Badge / Default Count
    neutral: {
      bg: '#F1F5F9',          // slate-100
      text: '#334155',        // slate-700
      border: '#E2E8F0',      // slate-200
      solid: '#334155',       // slate-700
      badge: '#475569',       // slate-600
    },
  },

  // Courier Identifiers
  courier: {
    pathao: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', accent: '#DC2626' },
    steadfast: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', accent: '#2563EB' },
    redx: { bg: '#FFF1F2', text: '#9F1239', border: '#FECDD3', accent: '#E11D48' },
  },
} as const;

/**
 * Pre-composed Tailwind design tokens for uniform admin styling.
 * Use these across admin components for consistent layout, borders, and colors.
 */
export const adminTheme = {
  // Layout & Containers
  layout: {
    page: 'min-h-screen bg-slate-50 text-slate-900 py-3 md:py-5',
    outerContainer: 'mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8',
    innerContainer: 'mx-auto max-w-7xl px-4 sm:px-8 lg:px-14 pt-2 pb-10',
  },

  // Surfaces & Cards
  card: {
    base: 'bg-white border border-slate-200 rounded-2xl shadow-xs',
    header: 'px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3',
    body: 'p-5',
    footer: 'px-5 py-3 border-t border-slate-200 bg-slate-50/70',
    well: 'border border-slate-200 bg-slate-50/70 p-4 rounded-xl shadow-2xs',
  },

  // Navigation Switchers
  nav: {
    topBar: 'flex flex-wrap items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 sm:px-5 py-3 shadow-xs gap-3 mb-4',
    pillGroup: 'flex flex-wrap items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl shadow-inner',
    tabActive: 'bg-slate-900 text-white shadow-xs',
    tabInactive: 'text-slate-700 hover:bg-white hover:text-slate-900',
    badgeActive: 'bg-slate-800 text-white',
    badgeInactive: 'bg-slate-200 text-slate-700',
    badgeAlert: 'bg-rose-500 text-white',
  },

  // Action Buttons
  button: {
    primary: 'inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 cursor-pointer text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all',
    secondary: 'inline-flex items-center gap-1.5 border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 px-3.5 py-2 cursor-pointer text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-2xs transition-all',
    success: 'inline-flex items-center gap-1.5 border border-emerald-500 bg-emerald-600 text-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-500 transition-all cursor-pointer rounded-xl shadow-sm',
    danger: 'inline-flex items-center gap-1.5 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer',
    ghost: 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer',
  },

  // Form Controls
  input: {
    base: 'w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl shadow-2xs',
    select: 'border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 rounded-xl shadow-2xs',
    label: 'block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5',
    helper: 'text-[11px] text-slate-500 mt-1',
  },

  // Tables
  table: {
    container: 'border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-xs',
    header: 'bg-slate-100/90 text-slate-600 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider',
    th: 'py-3.5 px-4 text-left font-bold text-slate-600',
    row: 'border-b border-slate-200 hover:bg-slate-50/70 transition-colors',
    td: 'py-3.5 px-4 text-slate-900',
    price: 'font-mono font-bold text-slate-900 text-base',
  },

  // Status Badges
  badge: {
    pending: 'inline-flex items-center gap-1 border border-amber-200 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold',
    confirmed: 'inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold',
    dispatched: 'inline-flex items-center gap-1 border border-indigo-200 bg-indigo-50 text-indigo-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold',
    delivered: 'inline-flex items-center gap-1 border border-blue-200 bg-blue-50 text-blue-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold',
    cancelled: 'inline-flex items-center gap-1 border border-rose-200 bg-rose-50 text-rose-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold',
    neutral: 'inline-flex items-center gap-1 border border-slate-200 bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold',
    alert: 'inline-flex items-center gap-1 bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold',
  },
} as const;

/**
 * Status color helper functions for dynamic data binding.
 */
export function getAdminOrderStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
    case 'bkash_check':
      return adminTheme.badge.pending;
    case 'confirmed':
    case 'processing':
      return adminTheme.badge.confirmed;
    case 'dispatched':
    case 'shipped':
      return adminTheme.badge.dispatched;
    case 'delivered':
      return adminTheme.badge.delivered;
    case 'cancelled':
    case 'failed':
      return adminTheme.badge.cancelled;
    default:
      return adminTheme.badge.neutral;
  }
}

export function getAdminStockStatusClasses(stock: number) {
  if (stock <= 0) return adminTheme.badge.cancelled;
  if (stock <= 2) return adminTheme.badge.pending;
  return adminTheme.badge.confirmed;
}

