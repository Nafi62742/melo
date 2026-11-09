'use client';

import dynamic from 'next/dynamic';

const AdminFeature = dynamic(
  () => import('@/features/admin/admin.feature').then((m) => m.AdminFeature),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] gap-3">
        <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-[0.2em] text-[#78716C] font-mono">
          Loading Admin Workspace...
        </span>
      </div>
    ),
  }
);

export function AdminClient({
  initialSection = 'store',
}: {
  initialSection?: 'store' | 'orders' | 'operations';
}) {
  return <AdminFeature initialSection={initialSection} />;
}
