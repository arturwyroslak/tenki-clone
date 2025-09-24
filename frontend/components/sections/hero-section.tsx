'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Github, Zap, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
              🚀 Meet Tenki
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Become a DevOps hero with faster,<br />
              more <span className="text-blue-600">cost-efficient</span> GitHub Actions.
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Tenki is purpose-built for scaling by delivering lightning-fast, cost-efficient runners
              with zero maintenance and hassle-free migration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="tenki-gradient text-white px-8 py-3 text-lg font-semibold">
                Migrate Your Runners – Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Book A Demo With Marina
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mb-12">
              No credit card required. 12,500 free minutes every month.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-3xl font-bold text-blue-600 mb-2">2 Click</div>
                <div className="text-sm text-gray-600">Repository Migration</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-3xl font-bold text-green-600 mb-2">Fixed</div>
                <div className="text-sm text-gray-600">Cost Model</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-3xl font-bold text-purple-600 mb-2">30%</div>
                <div className="text-sm text-gray-600">Faster than GitHub</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-3xl font-bold text-orange-600 mb-2">90%</div>
                <div className="text-sm text-gray-600">Cheaper than GitHub</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </section>
  );
}