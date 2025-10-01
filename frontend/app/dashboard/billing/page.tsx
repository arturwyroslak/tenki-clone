'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { CreditCard, DollarSign, Receipt, Download, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface UsageData {
  minutesUsed: number;
  minutesLimit: number;
  costThisMonth: number;
  freeMinutesRemaining: number;
}

interface Invoice {
  id: string;
  number: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  amount: number;
  dueDate: string;
  createdAt: string;
}

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockUsage: UsageData = {
          minutesUsed: 11179,
          minutesLimit: 12500,
          costThisMonth: 89.43,
          freeMinutesRemaining: 1321,
        };

        const mockInvoices: Invoice[] = [
          {
            id: '1',
            number: 'INV-2024-04-001',
            status: 'PAID',
            amount: 89.43,
            dueDate: '2024-04-30',
            createdAt: '2024-04-01',
          },
          {
            id: '2',
            number: 'INV-2024-03-001',
            status: 'PAID',
            amount: 91.20,
            dueDate: '2024-03-31',
            createdAt: '2024-03-01',
          },
          {
            id: '3',
            number: 'INV-2024-02-001',
            status: 'PAID',
            amount: 82.30,
            dueDate: '2024-02-29',
            createdAt: '2024-02-01',
          },
          {
            id: '4',
            number: 'INV-2024-01-001',
            status: 'PAID',
            amount: 78.50,
            dueDate: '2024-01-31',
            createdAt: '2024-01-01',
          },
        ];

        setUsage(mockUsage);
        setInvoices(mockInvoices);
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !usage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const usagePercentage = (usage.minutesUsed / usage.minutesLimit) * 100;

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge className="bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md">
            Paid
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md">
            Pending
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md">
            Failed
          </Badge>
        );
    }
  };

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
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Billing & Usage
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Manage your billing and track usage</p>
        </motion.div>

        {/* Usage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Month Cost</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">${usage.costThisMonth.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>90% savings vs GitHub</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Minutes Used</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{usage.minutesUsed.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Usage</span>
                  <span>{usagePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Free Minutes Left</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{usage.freeMinutesRemaining.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500">of 12,500 monthly free tier</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Manage your billing information</CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Update Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Visa •••• 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/2025</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Default
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Invoice History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>View and download your invoices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice, index) => (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{invoice.number}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(invoice.createdAt), 'MMM dd, yyyy')} - Due{' '}
                          {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${invoice.amount.toFixed(2)}</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle>Cost Savings Calculator</CardTitle>
              <CardDescription>See how much you save compared to GitHub Actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <p className="text-sm text-gray-600 mb-2">GitHub Actions Cost</p>
                  <p className="text-3xl font-bold text-red-600">${(usage.costThisMonth * 10).toFixed(2)}</p>
                </div>
                <div className="text-center p-4">
                  <p className="text-sm text-gray-600 mb-2">Tenki Cost</p>
                  <p className="text-3xl font-bold text-blue-600">${usage.costThisMonth.toFixed(2)}</p>
                </div>
                <div className="text-center p-4">
                  <p className="text-sm text-gray-600 mb-2">Your Savings</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${(usage.costThisMonth * 9).toFixed(2)}
                  </p>
                  <Badge className="mt-2 bg-gradient-to-r from-green-400 to-green-500 text-white">
                    90% saved
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
