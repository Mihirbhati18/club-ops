import { supabase, apiCall } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Member' | 'Viewer';
}

export async function register(email: string, password: string, name: string, role: string) {
  const response = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
  return response;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const response = await apiCall('/auth/profile');
    return response.user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
