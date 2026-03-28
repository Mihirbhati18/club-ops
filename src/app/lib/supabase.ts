import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabase = createClient(supabaseUrl, publicAnonKey);

export const apiUrl = `${supabaseUrl}/functions/v1/make-server-5c1df398`;

// API helper with auth
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token || publicAnonKey;

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}
