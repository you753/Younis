import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface AnimatedAreaChartProps {
  data: any[];
  title: string;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  gradientColors?: [string, string];
  height?: number;
}

export default function AnimatedAreaChart({ 
  data, 
  title, 
  dataKey, 
  xAxisKey, 
  color = '#8B5CF6',
  gradientColors = ['#8B5CF6', '#EC4899'],
  height = 300 
}: AnimatedAreaChartProps) {
  const [animatedData, setAnimatedData] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setAnimatedData([]);
    
    // Animate area chart with smooth data progression
    data.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => [...prev, item]);
      }, index * 80);
    });

    return () => {
      setAnimatedData([]);
      setIsVisible(false);
    };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <motion.h3 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center"
      >
        {title}
      </motion.h3>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={animatedData}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColors[0]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={gradientColors[1]} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
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
          <Area 
            type="monotone" 
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            fill={`url(#gradient-${dataKey})`}
            animationDuration={1500}
            animationBegin={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}