import React from 'react';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOnboarding } from './OnboardingProvider';

interface OnboardingTriggerProps {
  tourName?: string;
  className?: string;
}

export function OnboardingTrigger({ tourName, className }: OnboardingTriggerProps) {
  const { startOnboarding, resetOnboarding } = useOnboarding();

  const tours = [
    { name: 'dashboard', label: 'جولة لوحة التحكم' },
    { name: 'suppliers', label: 'جولة إدارة الموردين' },
    { name: 'products', label: 'جولة إدارة المنتجات' },
    { name: 'sales', label: 'جولة المبيعات' },
  ];

  const handleStartTour = (name: string) => {
    // Force start by clearing completion status first
    resetOnboarding(name);
    startOnboarding(name);
  };

  const handleResetTour = (name: string) => {
    // Force clear localStorage and restart tour
    localStorage.removeItem('onboarding-completed');
    resetOnboarding(name);
    setTimeout(() => {
      startOnboarding(name);
    }, 100);
  };

  if (tourName) {
    // Single tour trigger
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStartTour(tourName)}
        className={className}
      >
        <HelpCircle className="h-4 w-4 ml-2" />
        جولة إرشادية
      </Button>
    );
  }

  // Multi-tour dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <HelpCircle className="h-4 w-4 ml-2" />
          المساعدة والإرشاد
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {tours.map((tour) => (
          <DropdownMenuItem
            key={tour.name}
            onClick={() => handleStartTour(tour.name)}
            className="cursor-pointer text-right"
          >
            {tour.label}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {tours.map((tour) => (
          <DropdownMenuItem
            key={`reset-${tour.name}`}
            onClick={() => handleResetTour(tour.name)}
            className="cursor-pointer text-right text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4 ml-2" />
            إعادة تشغيل {tour.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}