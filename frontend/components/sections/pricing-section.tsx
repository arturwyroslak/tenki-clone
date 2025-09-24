'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const pricingData = [
  {
    name: 'Small',
    compute: '2 vCPU',
    memory: '4 GB RAM',
    tenkiPrice: '$0.0008',
    githubPrice: '$0.008',
    savings: '90%'
  },
  {
    name: 'Medium',
    compute: '4 vCPU',
    memory: '8 GB RAM',
    tenkiPrice: '$0.0016',
    githubPrice: '$0.016',
    savings: '90%'
  },
  {
    name: 'Large',
    compute: '8 vCPU',
    memory: '16 GB RAM',
    tenkiPrice: '$0.0032',
    githubPrice: '$0.032',
    savings: '90%'
  },
  {
    name: 'Large Plus',
    compute: '16 vCPU',
    memory: '32 GB RAM',
    tenkiPrice: '$0.0088',
    githubPrice: '$0.064',
    savings: '86%'
  },
  {
    name: 'Autoscale',
    compute: 'Autoscale',
    memory: 'Autoscale',
    tenkiPrice: '$0.0008',
    githubPrice: 'N/A',
    savings: 'N/A',
    popular: true
  }
];

const benefits = [
  'Contact our 24/7 support team',
  'Get 12,500 free mins per month',
  'Receive $10 in minutes by sharing'
];

export function PricingSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Enjoy a fixed-cost structure that's 90% cheaper than GitHub Runners.
            </h2>
          </motion.div>
        </div>
        
        <div className="overflow-x-auto mb-12">
          <table className="w-full max-w-5xl mx-auto">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Compute</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Memory</th>
                <th className="text-center py-4 px-4 font-semibold text-blue-600">Tenki ($/min)</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-600">GitHub ($/min)</th>
                <th className="text-center py-4 px-4 font-semibold text-green-600">Savings</th>
              </tr>
            </thead>
            <tbody>
              {pricingData.map((item, index) => (
                <motion.tr
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`border-b hover:bg-gray-50 ${item.popular ? 'bg-blue-50' : ''}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {item.compute}
                      {item.popular && (
                        <Badge className="ml-2 bg-blue-600 text-white">Popular</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{item.memory}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold text-blue-600">{item.tenkiPrice}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-gray-600">{item.githubPrice}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {item.savings !== 'N/A' ? (
                      <span className="font-bold text-green-600">-{item.savings}</span>
                    ) : (
                      <span className="text-gray-500">{item.savings}</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-gray-700 font-medium">{benefit}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}