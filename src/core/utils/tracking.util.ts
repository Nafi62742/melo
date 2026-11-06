export interface CourierOption {
  key: string;
  name: string;
  website: string;
  trackingUrlTemplate: (trackingCode: string) => string;
}

export const COURIER_OPTIONS: CourierOption[] = [
  {
    key: 'steadfast',
    name: 'Steadfast Courier',
    website: 'https://steadfast.com.bd',
    trackingUrlTemplate: (code: string) =>
      `https://steadfast.com.bd/t/${encodeURIComponent(code.trim())}`,
  },
  {
    key: 'pathao',
    name: 'Pathao Courier',
    website: 'https://pathao.com',
    trackingUrlTemplate: (code: string) =>
      `https://pathao.com/courier-tracking/?consignment_id=${encodeURIComponent(code.trim())}`,
  },
  {
    key: 'paperfly',
    name: 'Paperfly',
    website: 'https://paperfly.com.bd',
    trackingUrlTemplate: (code: string) =>
      `https://paperfly.com.bd/tracking.php?invoice=${encodeURIComponent(code.trim())}`,
  },
  {
    key: 'redx',
    name: 'RedX',
    website: 'https://redx.com.bd',
    trackingUrlTemplate: (code: string) =>
      `https://redx.com.bd/track/${encodeURIComponent(code.trim())}`,
  },
  {
    key: 'sundarban',
    name: 'Sundarban Courier',
    website: 'https://sundarbancourierltd.com',
    trackingUrlTemplate: (code: string) =>
      `https://sundarbancourierltd.com/tracking?cn=${encodeURIComponent(code.trim())}`,
  },
  {
    key: 'other',
    name: 'Other Courier',
    website: '',
    trackingUrlTemplate: () => '',
  },
];

export function buildCourierTrackingUrl(courierKeyOrName: string, trackingCode: string): string {
  if (!trackingCode.trim()) return '';
  const clean = courierKeyOrName.toLowerCase().trim();
  const matched = COURIER_OPTIONS.find(
    (c) => c.key === clean || c.name.toLowerCase().includes(clean)
  );
  if (matched && matched.key !== 'other') {
    return matched.trackingUrlTemplate(trackingCode.trim());
  }
  return '';
}

export function cleanPhoneNumber(raw: string): string {
  return raw.replace(/[\s\-\(\)\+]/g, '').trim();
}

