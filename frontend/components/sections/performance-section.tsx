'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const performanceData = [
  {
    name: 'Nodejs/npm install',
    github: { time: '10.08s', cost: '$0.0027' },
    tenki: { time: '8.19s', cost: '$0.00022' },
    improvement: '18.8%'
  },
  {
    name: 'Rust/cargo build',
    github: { time: '5.2s', cost: '$0.0014' },
    tenki: { time: '3.57s', cost: '$0.000095' },
    improvement: '31.3%'
  },
  {
    name: 'Docker/docker build',
    github: { time: '27.37s', cost: '$0.0073' },
    tenki: { time: '19.45s', cost: '$0.00052' },
    improvement: '28.9%'
  },
  {
    name: 'Go/go build',
    github: { time: '10.82s', cost: '$0.0029' },
    tenki: { time: '0.17s', cost: '$0.0000045' },
    improvement: '98.4%'
  },
  {
    name: 'Android/assembleDebug',
    github: { time: '98.06s', cost: '$0.026' },
    tenki: { time: '62.46s', cost: '$0.0017' },
    improvement: '36.3%'
  }
];

export function PerformanceSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Performance
            </h2>
            <h3 className="text-xl md:text-2xl text-gray-700 mb-6">
              Engineered for Speed. Priced for Scale. Proven in Production.
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Accelerate builds, cut costs, and gain full visibility into your DevOps workflows, 
              deploy optimized runners in seconds and pay only for what you use.
            </p>
          </motion.div>
        </div>
        
        <div className="space-y-4 max-w-6xl mx-auto">
          {performanceData.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="performance-card">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">GitHub</div>
                      <div className="text-lg font-semibold text-gray-700">{item.github.time}</div>
                      <div className="text-sm text-gray-600">{item.github.cost}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Tenki</div>
                      <div className="text-lg font-semibold text-blue-600">{item.tenki.time}</div>
                      <div className="text-sm text-blue-600">{item.tenki.cost}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Improvement</div>
                      <div className="text-lg font-bold text-green-600">{item.improvement}</div>
                      <div className="text-xs text-green-600">faster</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Optimized
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}