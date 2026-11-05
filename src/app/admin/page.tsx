import { AdminFeature } from '@/features/admin/admin.feature';

export const metadata = {
  title: 'Admin Management Dashboard | MELO',
  description: 'Manage store inventory, stock, and orders.',
};

export default function AdminPage() {
  return <AdminFeature />;
}

