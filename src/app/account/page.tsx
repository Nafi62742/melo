import { Suspense } from 'react';
import { AccountFeature } from '@/features/account/account.feature';

export const metadata = {
  title: 'My Account & Order Tracking | MELO Bangladesh',
  description: 'Sign in to track your MELO jewellery orders and manage your bKash TrxID payments.',
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-xs text-[#78716C]">
          Loading customer account &amp; tracking...
        </div>
      }
    >
      <AccountFeature />
    </Suspense>
  );
}

