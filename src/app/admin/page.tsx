import { AdminClient } from './admin-client';

export const metadata = {
  title: 'Admin Management Dashboard | MELO',
  description: 'Manage store inventory, stock, and orders.',
};

export default function AdminPage() {
  return (
    <div className="admin-theme min-h-screen bg-slate-50 text-slate-900">
      <AdminClient />
    </div>
  );
}
