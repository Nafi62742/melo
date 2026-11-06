import { AccountFeature } from '@/features/account/account.feature';

export const metadata = {
  title: 'My Account & Order Tracking | MELO Bangladesh',
  description: 'Sign in to track your MELO jewellery orders and manage your bKash TrxID payments.',
};

export default function AccountPage() {
  return <AccountFeature />;
}

