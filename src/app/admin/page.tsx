import { AdminClient } from './admin-client';

export const metadata = {
  title: 'Admin Management Dashboard | MELO',
  description: 'Manage store inventory, stock, and orders.',
};

export default function AdminPage() {
  return <AdminClient />;
}
