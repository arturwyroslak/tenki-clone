'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { Plus, FolderGit2, Server, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 md:p-8 lg:p-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
              </div>
              <p className="text-gray-600 text-lg">Manage your workspaces and accelerate your CI/CD pipeline</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/workspaces/new')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Workspace
            </Button>
          </div>

          {/* Stats Overview */}
          {workspaces.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Workspaces</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{workspaces.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Projects</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {workspaces.reduce((sum, w) => sum + w._count.projects, 0)}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <FolderGit2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Runners</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {workspaces.reduce((sum, w) => sum + w._count.runners, 0)}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Server className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Workspaces Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace, index) => (
            <motion.div
              key={workspace.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer group border-none shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden"
                onClick={() => router.push(`/dashboard/workspaces/${workspace.id}`)}
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="group-hover:text-blue-600 transition-colors text-xl">
                        {workspace.name}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {workspace.description || 'No description provided'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                      <FolderGit2 className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-medium">{workspace._count.projects}</span>
                      <span className="text-gray-500">projects</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                      <Server className="h-3.5 w-3.5 text-green-600" />
                      <span className="font-medium">{workspace._count.runners}</span>
                      <span className="text-gray-500">runners</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {workspaces.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-full"
            >
              <Card className="border-2 border-dashed border-gray-300 bg-white">
                <CardContent className="py-20 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-6">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No workspaces yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Get started by creating your first workspace to organize your projects and runners
                  </p>
                  <Button 
                    onClick={() => router.push('/dashboard/workspaces/new')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Workspace
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
