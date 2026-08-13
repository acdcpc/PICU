import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

const DEEP_LINK = 'com.ourpicu.app://auth/callback';

const AuthContext = createContext(null);

function parseHashParams(url) {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return new URLSearchParams('');
  const fragment = url.substring(hashIndex + 1).replace(/^#/, '');
  return new URLSearchParams(fragment);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Deep link handler (native only) — picks up OAuth/magic-link redirects
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    App.addListener('appUrlOpen', ({ url }) => {
      if (!url.startsWith(DEEP_LINK)) return;
      const params = parseHashParams(url);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          supabase.auth.getSession();
        });
      }
    });
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
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: DEEP_LINK,
        skipBrowserRedirect: true,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw error;
    if (data?.url) {
      if (Capacitor.isNativePlatform()) {
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

  const value = {
    user, profile, loading, isAdmin,
    signIn, signUp, signInWithGoogle, signInWithMagicLink, resetPassword, signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
