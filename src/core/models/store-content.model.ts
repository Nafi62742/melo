export interface HeroTrustMetric {
  value: string;
  label: string;
}

export interface HeroContent {
  badge: string;
  titleLine1: string;
  titleHighlight: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  trustMetrics: [HeroTrustMetric, HeroTrustMetric, HeroTrustMetric];
  primaryProductSlug: string;
  primaryProductBadge: string;
  secondaryProductSlug: string;
  secondaryProductBadge: string;
  tickerItems: string[];
}

export interface StoreContent {
  hero: HeroContent;
}

