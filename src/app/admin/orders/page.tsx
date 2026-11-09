import { AdminClient } from '../admin-client';

export const metadata = {
  title: 'Orders & bKash Fulfillment | MELO Admin',
  description: 'Manage customer orders, bKash verification, and courier tracking.',
};

export default function AdminOrdersPage() {
  return (
    <div className="admin-theme min-h-screen bg-slate-50 text-slate-900">
      <AdminClient initialSection="orders" />
    </div>
  );
}
