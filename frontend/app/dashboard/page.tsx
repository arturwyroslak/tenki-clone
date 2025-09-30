'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  _count: {
    projects: number;
    runners: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await api.get('/api/workspaces');
        setWorkspaces(response.data);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your workspaces and projects</p>
        </div>
        <Button onClick={() => router.push('/dashboard/workspaces/new')}>
          Create Workspace
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Card 
            key={workspace.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/dashboard/workspaces/${workspace.id}`)}
          >
            <CardHeader>
              <CardTitle>{workspace.name}</CardTitle>
              <CardDescription>{workspace.description || 'No description'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{workspace._count.projects} projects</span>
                <span>{workspace._count.runners} runners</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {workspaces.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No workspaces found</p>
              <Button onClick={() => router.push('/dashboard/workspaces/new')}>
                Create Your First Workspace
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
