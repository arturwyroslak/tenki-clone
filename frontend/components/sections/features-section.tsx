'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Shield, Users, BarChart, GitBranch, Clock } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: '30% faster than GitHub Actions with bare-metal performance and optimized infrastructure.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with isolated environments, encrypted data, and compliance certifications.'
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Advanced role-based access control, workspace management, and collaborative features.'
  },
  {
    icon: BarChart,
    title: 'Real-time Analytics',
    description: 'Comprehensive metrics, cost tracking, and performance insights for data-driven decisions.'
  },
  {
    icon: GitBranch,
    title: 'Easy Migration',
    description: 'Seamless migration from GitHub Actions with automated workflow analysis and conversion.'
  },
  {
    icon: Clock,
    title: 'Auto Scaling',
    description: 'Intelligent auto-scaling that adapts to your workload demands automatically.'
  }
];

export function FeaturesSection() {
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for modern CI/CD
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to accelerate your development workflow while reducing costs.
            </p>
          </motion.div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}