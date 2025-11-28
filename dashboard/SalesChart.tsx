import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';

interface SalesChartProps {
  data: {
    labels: string[];
    sales: number[];
    purchases: number[];
  };
}

export default function SalesChart({ data }: SalesChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'المبيعات',
            data: data.sales,
            borderColor: 'hsl(var(--accounting-primary))',
            backgroundColor: 'hsl(var(--accounting-primary) / 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'المشتريات',
            data: data.purchases,
            borderColor: 'hsl(var(--accounting-secondary))',
            backgroundColor: 'hsl(var(--accounting-secondary) / 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                family: 'Cairo'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'SAR',
                  minimumFractionDigits: 0
                }).format(value as number);
              },
              font: {
                family: 'Cairo'
              }
            }
          },
          x: {
            ticks: {
              font: {
                family: 'Cairo'
              }
            }
          }
        }
      }
    };

    chartInstanceRef.current = new Chart(ctx, config);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="relative h-80">
      <canvas ref={chartRef} />
    </div>
  );
}
