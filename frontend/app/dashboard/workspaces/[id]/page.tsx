'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import { ArrowLeft, Plus, Server, FolderGit2, Users, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    githubRepo?: string;
  }>;
  runners: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
  }>;
}

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/api/workspaces/${params.id}`);
        setWorkspace(response.data);
      } catch (error) {
        console.error('Error fetching workspace:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchWorkspace();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="max-w-md border-none shadow-xl">
          <CardContent className="py-16 text-center">
            <p className="text-gray-600 text-lg">Workspace not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDLE': return 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md';
      case 'BUSY': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md';
      case 'OFFLINE': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
      case 'ERROR': return 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 md:p-8 lg:p-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-6 hover:bg-white hover:shadow-md transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
                  {workspace.name}
                </h1>
                <p className="text-gray-600 text-lg mb-2">{workspace.description || 'No description'}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="h-4 w-4" />
                  <span>Created by {workspace.creator.name}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-white shadow-md border border-gray-200 p-1">
            <TabsTrigger value="projects" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              <FolderGit2 className="mr-2 h-4 w-4" />
              Projects ({workspace.projects?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="runners" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
              <Server className="mr-2 h-4 w-4" />
              Runners ({workspace.runners?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Users className="mr-2 h-4 w-4" />
              Members ({workspace.members?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center"
            >
              <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
              <Button 
                onClick={() => router.push(`/dashboard/workspaces/${workspace.id}/projects/new`)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workspace.projects?.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="cursor-pointer group border-none shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden"
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  >
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <CardHeader>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {project.githubRepo && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                          <FolderGit2 className="h-4 w-4 text-gray-600" />
                          <p className="text-sm text-gray-700 font-medium">{project.githubRepo}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {(!workspace.projects || workspace.projects.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="col-span-full"
                >
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="py-16 text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
                        <FolderGit2 className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-gray-500 mb-6">No projects yet</p>
                      <Button onClick={() => router.push(`/dashboard/workspaces/${workspace.id}/projects/new`)}>
                        Create Your First Project
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="runners" className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center"
            >
              <h2 className="text-2xl font-semibold text-gray-900">Runners</h2>
              <Button 
                onClick={() => router.push(`/dashboard/runners/new?workspaceId=${workspace.id}`)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Runner
              </Button>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workspace.runners?.map((runner, index) => (
                <motion.div
                  key={runner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            {runner.name}
                          </CardTitle>
                          <CardDescription className="mt-2">{runner.type}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(runner.status)}>
                          {runner.status}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}

              {(!workspace.runners || workspace.runners.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="col-span-full"
                >
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="py-16 text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-4">
                        <Server className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-gray-500 mb-6">No runners yet</p>
                      <Button onClick={() => router.push(`/dashboard/runners/new?workspaceId=${workspace.id}`)}>
                        Create Your First Runner
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center"
            >
              <h2 className="text-2xl font-semibold text-gray-900">Team Members</h2>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </motion.div>

            <div className="grid gap-4">
              {workspace.members?.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                          {member.user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.user.name}</p>
                          <p className="text-sm text-gray-600">{member.user.email}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={member.role === 'ADMIN' ? 'border-purple-500 text-purple-700 bg-purple-50' : 'border-gray-300 text-gray-700'}
                      >
                        {member.role}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
