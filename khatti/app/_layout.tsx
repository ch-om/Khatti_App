import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../supabase';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/home' as any);
      } else {
        router.replace('/login' as any);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/home' as any);
      } else {
        router.replace('/login' as any);
      }
    });
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}