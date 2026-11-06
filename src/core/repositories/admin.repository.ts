import { supabaseClient } from './supabase.client';

export const ADMIN_AUTH_CHANGED_EVENT = 'melo-admin-auth-changed';
const ADMIN_SESSION_KEY = 'melo_admin_authenticated';
const DEFAULT_ADMIN_EMAIL = 'melo@gmail.com';
const DEFAULT_ADMIN_PASS = 'hippo#aurora';

/**
 * AdminRepository — Handles all database (`public.admins`), database health checks,
 * and browser session storage for admin authentication.
 */
export class AdminRepository {
  getDefaultAdminEmail(): string {
    return DEFAULT_ADMIN_EMAIL;
  }

  isSessionAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return (
        sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true' ||
        localStorage.getItem(ADMIN_SESSION_KEY) === 'true'
      );
    } catch {
      return false;
    }
  }

  setSessionAuthenticated(authenticated: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      if (authenticated) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } else {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
      window.dispatchEvent(new CustomEvent(ADMIN_AUTH_CHANGED_EVENT));
    } catch {
      // ignore storage errors
    }
  }

  isDatabaseConfigured(): boolean {
    return supabaseClient.isConfigured();
  }

  async checkDatabaseConnection(): Promise<boolean> {
    return supabaseClient.checkConnection();
  }

  async verifyCredentialsInDb(email: string, password: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (
      cleanEmail === DEFAULT_ADMIN_EMAIL &&
      (password === DEFAULT_ADMIN_PASS || cleanPass === DEFAULT_ADMIN_PASS)
    ) {
      return true;
    }

    if (supabaseClient.isConfigured()) {
      try {
        const res = await fetch(
          `${supabaseClient.baseUrl}/rest/v1/admins?email=eq.${encodeURIComponent(
            cleanEmail
          )}&password=eq.${encodeURIComponent(cleanPass)}&select=id,email,role`,
          {
            headers: supabaseClient.getHeaders(),
            cache: 'no-store',
          }
        );
        if (res.ok) {
          const rows = (await res.json()) as Array<{ id: string; email: string }>;
          if (Array.isArray(rows) && rows.length > 0) {
            return true;
          }
        }
      } catch {
        // Fallback if network/DB is unreachable
      }
    }

    return false;
  }
}

export const adminRepository = new AdminRepository();

