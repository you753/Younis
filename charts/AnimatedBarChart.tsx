import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface AnimatedBarChartProps {
  data: any[];
  title: string;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

export default function AnimatedBarChart({ 
  data, 
  title, 
  dataKey, 
  xAxisKey, 
  color = '#10B981',
  height = 300 
}: AnimatedBarChartProps) {
  const [animatedData, setAnimatedData] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setAnimatedData([]);
    
    // Animate bars with staggered delay
    data.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => [...prev, item]);
      }, index * 150);
    });

    return () => {
      setAnimatedData([]);
      setIsVisible(false);
    };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <motion.h3 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center"
      >
        {title}
      </motion.h3>
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={animatedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E5E7EB" 
            strokeOpacity={0.5}
          />
          <XAxis 
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            dataKey={dataKey}
            fill={color}
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            animationBegin={300}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}