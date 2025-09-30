'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { Github } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleGithubLogin = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/auth/login');
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Tenki Clone</CardTitle>
          <CardDescription>
            Sign in with GitHub to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            {loading ? 'Redirecting...' : 'Sign in with GitHub'}
          </Button>
          <p className="mt-4 text-center text-sm text-gray-600">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
