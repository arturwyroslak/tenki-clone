'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

const RUNNER_TYPES = [
  { value: 'SMALL_2C_4G', label: 'Small (2 vCPU, 4GB RAM)', price: '$0.0008/min' },
  { value: 'MEDIUM_4C_8G', label: 'Medium (4 vCPU, 8GB RAM)', price: '$0.0016/min' },
  { value: 'LARGE_8C_16G', label: 'Large (8 vCPU, 16GB RAM)', price: '$0.0032/min' },
  { value: 'LARGE_PLUS_16C_32G', label: 'Large Plus (16 vCPU, 32GB RAM)', price: '$0.0088/min' },
  { value: 'AUTOSCALE', label: 'Autoscale', price: '$0.0008/min' },
];

export default function NewRunnerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspaceId');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'MEDIUM_4C_8G',
    workspaceId: workspaceId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/runners', formData);
      router.push(`/dashboard/workspaces/${formData.workspaceId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create runner');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold">Create New Runner</h1>
        <p className="text-gray-600 mt-2">Configure a new CI/CD runner for your workspace</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Runner Configuration</CardTitle>
          <CardDescription>
            Choose the runner type and specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Runner Name</Label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Production Runner"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Runner Type</Label>
              <div className="space-y-3">
                {RUNNER_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-gray-600">{type.price}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Runner'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
