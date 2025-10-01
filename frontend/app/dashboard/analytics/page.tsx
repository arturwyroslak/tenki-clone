'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import { BarChart3, TrendingUp, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';

interface WorkflowRunData {
  date: string;
  successful: number;
  failed: number;
  running: number;
}

interface RunnerUsageData {
  name: string;
  minutes: number;
  cost: number;
}

interface CostData {
  month: string;
  cost: number;
  savings: number;
}

interface AnalyticsData {
  totalRuns: number;
  successRate: number;
  totalCost: number;
  minutesUsed: number;
  workflowRuns: WorkflowRunData[];
  runnerUsage: RunnerUsageData[];
  costTrends: CostData[];
  successBreakdown: { name: string; value: number }[];
}

const COLORS = {
  success: '#10b981',
  failed: '#ef4444',
  running: '#3b82f6',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAnalytics = async () => {
    try {
      // Mock data for demonstration - replace with actual API call
      const mockData: AnalyticsData = {
        totalRuns: 1247,
        successRate: 92.5,
        totalCost: 89.43,
        minutesUsed: 11179,
        workflowRuns: [
          { date: 'Mon', successful: 45, failed: 3, running: 2 },
          { date: 'Tue', successful: 52, failed: 5, running: 1 },
          { date: 'Wed', successful: 48, failed: 2, running: 3 },
          { date: 'Thu', successful: 61, failed: 4, running: 2 },
          { date: 'Fri', successful: 55, failed: 6, running: 1 },
          { date: 'Sat', successful: 38, failed: 2, running: 4 },
          { date: 'Sun', successful: 42, failed: 3, running: 2 },
        ],
        runnerUsage: [
          { name: 'Small (2c/4g)', minutes: 4200, cost: 3.36 },
          { name: 'Medium (4c/8g)', minutes: 3500, cost: 5.6 },
          { name: 'Large (8c/16g)', minutes: 2100, cost: 6.72 },
          { name: 'Large+ (16c/32g)', minutes: 1200, cost: 10.56 },
          { name: 'Autoscale', minutes: 179, cost: 0.14 },
        ],
        costTrends: [
          { month: 'Jan', cost: 78.5, savings: 705.5 },
          { month: 'Feb', cost: 82.3, savings: 741.7 },
          { month: 'Mar', cost: 91.2, savings: 820.8 },
          { month: 'Apr', cost: 89.4, savings: 804.6 },
        ],
        successBreakdown: [
          { name: 'Successful', value: 1153 },
          { name: 'Failed', value: 74 },
          { name: 'Running', value: 20 },
        ],
      };
      setData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 md:p-8 lg:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
              </div>
              <p className="text-gray-600 text-lg">Real-time insights into your CI/CD pipeline performance</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'border-green-500 text-green-600' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </Button>
              <Button onClick={fetchAnalytics} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Runs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{data.totalRuns.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last week</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{data.successRate}%</p>
                  <p className="text-xs text-green-600 mt-1">+2.3% from last week</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">${data.totalCost.toFixed(2)}</p>
                  <p className="text-xs text-green-600 mt-1">90% cheaper than GitHub</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-pink-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Minutes Used</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{data.minutesUsed.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">1,321 free mins remaining</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workflow Runs Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Workflow Runs Timeline</CardTitle>
                    <CardDescription>Last 7 days activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={data.workflowRuns}>
                        <defs>
                          <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.failed} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.failed} stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="successful"
                          stroke={COLORS.success}
                          fill="url(#successGradient)"
                          name="Successful"
                        />
                        <Area
                          type="monotone"
                          dataKey="failed"
                          stroke={COLORS.failed}
                          fill="url(#failedGradient)"
                          name="Failed"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Success Rate Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Success Rate Breakdown</CardTitle>
                    <CardDescription>Workflow run distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.successBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {data.successBreakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 0 ? COLORS.success : index === 1 ? COLORS.failed : COLORS.running}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Runner Usage by Type</CardTitle>
                  <CardDescription>Minutes and cost breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.runnerUsage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" angle={-15} textAnchor="end" height={80} />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="minutes" fill={COLORS.purple} name="Minutes Used" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="cost" fill={COLORS.pink} name="Cost ($)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="cost" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Cost Trends & Savings</CardTitle>
                  <CardDescription>Monthly cost vs GitHub Actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data.costTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cost"
                        stroke={COLORS.failed}
                        strokeWidth={3}
                        name="Tenki Cost ($)"
                        dot={{ fill: COLORS.failed, r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="savings"
                        stroke={COLORS.success}
                        strokeWidth={3}
                        name="Savings vs GitHub ($)"
                        dot={{ fill: COLORS.success, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  <CardDescription>Workflow execution performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={data.workflowRuns}>
                      <defs>
                        <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.running} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={COLORS.running} stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="successful"
                        stackId="1"
                        stroke={COLORS.running}
                        fill="url(#performanceGradient)"
                        name="Total Runs"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
