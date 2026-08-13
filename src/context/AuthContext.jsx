import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

const DEEP_LINK = 'com.ourpicu.app://auth/callback';

const AuthContext = createContext(null);

// Extract OAuth tokens / errors from either the query string or the hash fragment.
function extractAuthParams(url) {
  const params = new URLSearchParams();
  const add = (s) => {
    if (!s) return;
    const clean = s.replace(/^[?#]/, '');
    new URLSearchParams(clean).forEach((v, k) => params.set(k, v));
  };
  const q = url.indexOf('?');
  const h = url.indexOf('#');
  if (q !== -1) add(url.slice(q + 1, h === -1 ? url.length : h));
  if (h !== -1) add(url.slice(h + 1));
  return params;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
    return data;
  }, []);

  // Session bootstrap
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Deep link handler (native only) — picks up OAuth/magic-link redirects.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleUrl = async (url) => {
      if (!url || !url.startsWith(DEEP_LINK)) return;

      const params = extractAuthParams(url);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const error = params.get('error');
      const error_description = params.get('error_description');

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token }).catch(() => {});
        setAuthError('');
      } else if (error || error_description) {
        setAuthError(error_description || error || 'Sign-in was cancelled or denied.');
      }
      await Browser.close().catch(() => {});
    };

    // Cold start: app was opened directly by the deep link (listener not yet mounted).
    App.getLaunchUrl().then(({ url }) => handleUrl(url)).catch(() => {});
    // Warm start / while running.
    const sub = App.addListener('appUrlOpen', ({ url }) => handleUrl(url));

    return () => { sub.then((h) => h && h.remove()).catch(() => {}); };
  }, []);

  const isAdmin = profile?.role === 'admin';

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    const isNative = Capacitor.isNativePlatform();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: isNative ? DEEP_LINK : window.location.origin,
        skipBrowserRedirect: true,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw error;
    if (data?.url) {
      if (isNative) {
        await Browser.open({ url: data.url, windowName: '_self' });
      } else {
        window.location.href = data.url;
      }
    }
  };

  const signInWithMagicLink = async (email) => {
    const redirectTo = Capacitor.isNativePlatform() ? DEEP_LINK : window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const redirectTo = Capacitor.isNativePlatform() ? DEEP_LINK : window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  };

  const signOut = () => supabase.auth.signOut();
  const clearAuthError = () => setAuthError('');

  const value = {
    user, profile, loading, isAdmin, authError,
    signIn, signUp, signInWithGoogle, signInWithMagicLink, resetPassword, signOut, clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
