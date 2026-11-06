const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Shared low-level HTTP client for Supabase PostgREST calls.
 * Used exclusively by repositories in `src/core/repositories/`.
 */
export class SupabaseClient {
  get baseUrl(): string {
    return SUPABASE_URL;
  }

  isConfigured(): boolean {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  }

  getHeaders(extraHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Prefer: 'return=representation',
      ...extraHeaders,
    };
    if (SUPABASE_ANON_KEY.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
    }
    return headers;
  }

  async checkConnection(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const supabaseClient = new SupabaseClient();

