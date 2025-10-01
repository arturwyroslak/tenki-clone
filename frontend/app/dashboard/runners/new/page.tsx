'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { ArrowLeft, Cpu, HardDrive, DollarSign, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const RUNNER_TYPES = [
  { 
    value: 'SMALL_2C_4G', 
    label: 'Small', 
    specs: '2 vCPU, 4GB RAM', 
    price: '$0.0008/min',
    icon: Cpu,
    color: 'from-blue-400 to-blue-500'
  },
  { 
    value: 'MEDIUM_4C_8G', 
    label: 'Medium', 
    specs: '4 vCPU, 8GB RAM', 
    price: '$0.0016/min',
    icon: Cpu,
    color: 'from-green-400 to-green-500'
  },
  { 
    value: 'LARGE_8C_16G', 
    label: 'Large', 
    specs: '8 vCPU, 16GB RAM', 
    price: '$0.0032/min',
    icon: HardDrive,
    color: 'from-purple-400 to-purple-500'
  },
  { 
    value: 'LARGE_PLUS_16C_32G', 
    label: 'Large Plus', 
    specs: '16 vCPU, 32GB RAM', 
    price: '$0.0088/min',
    icon: HardDrive,
    color: 'from-orange-400 to-orange-500'
  },
  { 
    value: 'AUTOSCALE', 
    label: 'Autoscale', 
    specs: 'Dynamic scaling', 
    price: '$0.0008/min',
    icon: Zap,
    color: 'from-pink-400 to-pink-500'
  },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 hover:bg-white hover:shadow-md transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
              Create New Runner
            </h1>
            <p className="text-gray-600 text-lg">Configure a new CI/CD runner for your workspace</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-none shadow-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="text-2xl">Runner Configuration</CardTitle>
              <CardDescription className="text-base">
                Choose the runner type and specifications that best fit your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md"
                  >
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-semibold text-gray-900">Runner Name</Label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base"
                    placeholder="e.g., Production Runner"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold text-gray-900">Select Runner Type</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    {RUNNER_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = formData.type === type.value;
                      
                      return (
                        <motion.label
                          key={type.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-lg' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={isSelected}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="sr-only"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center shadow-md`}>
                                  <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-lg">{type.label}</p>
                                  <p className="text-sm text-gray-600">{type.specs}</p>
                                </div>
                              </div>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center"
                                >
                                  <Check className="h-4 w-4 text-white" />
                                </motion.div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <p className="text-sm font-semibold text-gray-700">{type.price}</p>
                            </div>
                          </div>
                        </motion.label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="flex-1 h-12 text-base border-2 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Runner'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
