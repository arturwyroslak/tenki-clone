'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import { ArrowLeft, Plus, Server, FolderGit2, Users } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Workspace not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDLE': return 'bg-green-100 text-green-800';
      case 'BUSY': return 'bg-yellow-100 text-yellow-800';
      case 'OFFLINE': return 'bg-gray-100 text-gray-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{workspace.name}</h1>
            <p className="text-gray-600 mt-2">{workspace.description || 'No description'}</p>
            <p className="text-sm text-gray-500 mt-1">
              Created by {workspace.creator.name}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">
            <FolderGit2 className="mr-2 h-4 w-4" />
            Projects ({workspace.projects?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="runners">
            <Server className="mr-2 h-4 w-4" />
            Runners ({workspace.runners?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members ({workspace.members?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Projects</h2>
            <Button onClick={() => router.push(`/dashboard/workspaces/${workspace.id}/projects/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspace.projects?.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {project.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.githubRepo && (
                    <p className="text-sm text-gray-600">
                      <FolderGit2 className="inline mr-1 h-3 w-3" />
                      {project.githubRepo}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {(!workspace.projects || workspace.projects.length === 0) && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">No projects yet</p>
                  <Button onClick={() => router.push(`/dashboard/workspaces/${workspace.id}/projects/new`)}>
                    Create Your First Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="runners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Runners</h2>
            <Button onClick={() => router.push(`/dashboard/runners/new?workspaceId=${workspace.id}`)}>
              <Plus className="mr-2 h-4 w-4" />
              New Runner
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspace.runners?.map((runner) => (
              <Card key={runner.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{runner.name}</CardTitle>
                    <Badge className={getStatusColor(runner.status)}>
                      {runner.status}
                    </Badge>
                  </div>
                  <CardDescription>{runner.type}</CardDescription>
                </CardHeader>
              </Card>
            ))}

            {(!workspace.runners || workspace.runners.length === 0) && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">No runners yet</p>
                  <Button onClick={() => router.push(`/dashboard/runners/new?workspaceId=${workspace.id}`)}>
                    Create Your First Runner
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>

          <div className="grid gap-4">
            {workspace.members?.map((member) => (
              <Card key={member.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-sm text-gray-600">{member.user.email}</p>
                  </div>
                  <Badge variant="outline">{member.role}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
