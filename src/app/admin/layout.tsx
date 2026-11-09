import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-theme min-h-screen w-full bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}
