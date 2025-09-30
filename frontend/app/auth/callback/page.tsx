'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        router.push('/login?error=no_code');
        return;
      }

      try {
        const response = await api.post('/api/auth/callback', { code });
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        router.push('/dashboard');
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
