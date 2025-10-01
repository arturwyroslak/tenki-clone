'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { ArrowLeft, GitBranch, PlayCircle, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="max-w-md border-none shadow-xl">
          <CardContent className="py-16 text-center">
            <p className="text-gray-600 text-lg">Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FAILED': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'RUNNING': return <PlayCircle className="h-5 w-5 text-blue-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md';
      case 'FAILED': return 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md';
      case 'RUNNING': return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md';
      case 'PENDING': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="container mx-auto p-6 md:p-8 lg:p-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/workspaces/${project.workspace.id}`)}
            className="mb-6 hover:bg-white hover:shadow-md transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workspace
          </Button>

          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
                  {project.name}
                </h1>
                <p className="text-gray-600 text-lg mb-4">{project.description || 'No description'}</p>
                {project.githubRepo && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg inline-flex border border-gray-200 shadow-sm">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                    <a
                      href={`https://github.com/${project.githubRepo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                    >
                      {project.githubRepo}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Workflows</h2>
            </div>
          </motion.div>
          
          {project.workflows && project.workflows.length > 0 ? (
            <div className="space-y-6">
              {project.workflows.map((workflow, index) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-lg bg-white overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                      <CardTitle className="text-xl">{workflow.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-base">
                        <GitBranch className="h-4 w-4" />
                        {workflow.fileName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent Runs</h3>
                        {workflow.runs && workflow.runs.length > 0 ? (
                          <div className="space-y-3">
                            {workflow.runs.slice(0, 5).map((run, runIndex) => (
                              <motion.div
                                key={run.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: runIndex * 0.05 }}
                                className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white shadow-sm">
                                    {getStatusIcon(run.status)}
                                  </div>
                                  <div>
                                    <Badge className={getStatusColor(run.status)}>
                                      {run.status}
                                    </Badge>
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(run.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                {run.duration && (
                                  <div className="px-4 py-2 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-semibold text-blue-700">
                                      {Math.floor(run.duration / 60)}m {run.duration % 60}s
                                    </p>
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-lg">No runs yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="py-20 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No workflows yet</h3>
                  <p className="text-gray-500 mb-6">Start by migrating your GitHub workflows</p>
                  <Button 
                    onClick={() => router.push(`/dashboard/projects/${project.id}/migrate`)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                  >
                    Migrate Workflows
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
