import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface AnimatedLineChartProps {
  data: any[];
  title: string;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

export default function AnimatedLineChart({ 
  data, 
  title, 
  dataKey, 
  xAxisKey, 
  color = '#4F46E5',
  height = 300 
}: AnimatedLineChartProps) {
  const [animatedData, setAnimatedData] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Animate data points one by one
    data.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => [...prev, item]);
      }, index * 100);
    });

    return () => {
      setAnimatedData([]);
      setIsVisible(false);
    };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center"
      >
        {title}
      </motion.h3>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={animatedData}>
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
          <Line 
            type="monotone" 
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: color, strokeWidth: 2, fill: '#ffffff' }}
            animationDuration={1000}
            animationBegin={200}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}