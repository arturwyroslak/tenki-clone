'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { ArrowLeft, GitBranch, PlayCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  githubRepo?: string;
  workspace: {
    id: string;
    name: string;
  };
  workflows: Array<{
    id: string;
    name: string;
    fileName: string;
    runs: Array<{
      id: string;
      status: string;
      createdAt: string;
      duration?: number;
    }>;
  }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/api/projects/${params.id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Project not found</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'RUNNING': return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'RUNNING': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/workspaces/${project.workspace.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workspace
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description || 'No description'}</p>
            {project.githubRepo && (
              <div className="flex items-center gap-2 mt-2">
                <GitBranch className="h-4 w-4 text-gray-500" />
                <a
                  href={`https://github.com/${project.githubRepo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {project.githubRepo}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Workflows</h2>
          
          {project.workflows && project.workflows.length > 0 ? (
            <div className="space-y-4">
              {project.workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <CardTitle>{workflow.name}</CardTitle>
                    <CardDescription>{workflow.fileName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Recent Runs</h3>
                      {workflow.runs && workflow.runs.length > 0 ? (
                        <div className="space-y-2">
                          {workflow.runs.slice(0, 5).map((run) => (
                            <div
                              key={run.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {getStatusIcon(run.status)}
                                <div>
                                  <Badge className={getStatusColor(run.status)}>
                                    {run.status}
                                  </Badge>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(run.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              {run.duration && (
                                <p className="text-sm text-gray-600">
                                  {Math.floor(run.duration / 60)}m {run.duration % 60}s
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No runs yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No workflows yet</p>
                <Button onClick={() => router.push(`/dashboard/projects/${project.id}/migrate`)}>
                  Migrate Workflows
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
