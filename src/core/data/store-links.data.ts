import { StoreLink } from '../models/store-link.model';

export const DEFAULT_STORE_LINKS: StoreLink[] = [
  {
    key: 'whatsapp',
    label: 'WhatsApp Concierge',
    url: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
      : 'https://wa.me/8801522111036',
    category: 'chat',
    isActive: true,
  },
  {
    key: 'messenger',
    label: 'Facebook Messenger',
    url: process.env.NEXT_PUBLIC_MESSENGER_USERNAME
      ? `https://m.me/${process.env.NEXT_PUBLIC_MESSENGER_USERNAME}`
      : 'https://www.facebook.com/profile.php?id=61596527274952',
    category: 'chat',
    isActive: true,
  },
  {
    key: 'facebook',
    label: 'Facebook Page',
    url: 'https://www.facebook.com/profile.php?id=61596527274952',
    category: 'social',
    isActive: true,
  },
  {
    key: 'instagram',
    label: 'Instagram',
    url: 'https://instagram.com/melobangladesh',
    category: 'social',
    isActive: true,
  },
];

