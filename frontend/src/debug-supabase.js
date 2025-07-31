// Debug script to check Supabase URL
import { supabase } from './supabaseClient';

console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase client config:', supabase);

// Test authentication
const testAuth = async () => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
    });

    console.log('Auth response data:', data);
    console.log('Auth response error:', error);
  } catch (e) {
    console.error('Auth exception:', e);
  }
};

testAuth();
