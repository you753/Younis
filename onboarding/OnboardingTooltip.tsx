import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TooltipStep {
  id: string;
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'focus';
  isOptional?: boolean;
  nextButtonText?: string;
  skipButtonText?: string;
}

interface OnboardingTooltipProps {
  steps: TooltipStep[];
  currentStep: number;
  isVisible: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onClose: () => void;
}

export function OnboardingTooltip({
  steps,
  currentStep,
  isVisible,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  onClose
}: OnboardingTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (!isVisible || !currentStepData) return;

    const updatePosition = () => {
      const target = document.querySelector(currentStepData.target) as HTMLElement;
      if (!target || !tooltipRef.current) return;

      setTargetElement(target);
      
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      let top = 0;
      let left = 0;

      switch (currentStepData.position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 12;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + 12;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - 12;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + 12;
          break;
        case 'center':
        default:
          top = windowHeight / 2 - tooltipRect.height / 2;
          left = windowWidth / 2 - tooltipRect.width / 2;
          break;
      }

      // Ensure tooltip stays within viewport
      if (left < 12) left = 12;
      if (left + tooltipRect.width > windowWidth - 12) {
        left = windowWidth - tooltipRect.width - 12;
      }
      if (top < 12) top = 12;
      if (top + tooltipRect.height > windowHeight - 12) {
        top = windowHeight - tooltipRect.height - 12;
      }

      setPosition({ top, left });

      // Highlight target element
      target.style.position = 'relative';
      target.style.zIndex = '1001';
      target.style.outline = '2px solid hsl(var(--primary))';
      target.style.outlineOffset = '4px';
      target.style.borderRadius = '8px';
    };

    // Initial position calculation
    setTimeout(updatePosition, 100);

    // Recalculate on resize
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      
      // Remove highlight from target element
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.outline = '';
        targetElement.style.outlineOffset = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [currentStep, isVisible, currentStepData, targetElement]);

  if (!isVisible || !currentStepData) return null;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[1000]" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[1002] w-80 max-w-sm",
          "animate-fade-in"
        )}
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <Card className="shadow-xl border-primary/20">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">
                  خطوة {currentStep + 1} من {steps.length}
                </div>
                {currentStepData.isOptional && (
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    اختياري
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-right">
                {currentStepData.title}
              </h3>
              <p className="text-muted-foreground text-right leading-relaxed">
                {currentStepData.content}
              </p>
            </div>

            {/* Action hint */}
            {currentStepData.action && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary text-right">
                  {currentStepData.action === 'click' && 'اضغط على العنصر المحدد'}
                  {currentStepData.action === 'hover' && 'مرر فوق العنصر المحدد'}
                  {currentStepData.action === 'focus' && 'اضغط على الحقل المحدد'}
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevious}
                    className="flex items-center gap-1"
                  >
                    <ChevronRight className="h-4 w-4" />
                    السابق
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSkip}
                >
                  {currentStepData.skipButtonText || 'تخطي'}
                </Button>
              </div>

              <Button
                onClick={handleNext}
                size="sm"
                className="flex items-center gap-1"
              >
                {isLastStep ? (
                  <>
                    <Check className="h-4 w-4" />
                    إنهاء
                  </>
                ) : (
                  <>
                    التالي
                    <ChevronLeft className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Arrow pointer */}
        {currentStepData.position !== 'center' && (
          <div
            className={cn(
              "absolute w-3 h-3 bg-background border border-border rotate-45",
              {
                'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0': currentStepData.position === 'top',
                'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0': currentStepData.position === 'bottom',
                'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-t-0 border-r-0': currentStepData.position === 'left',
                'left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-b-0 border-l-0': currentStepData.position === 'right',
              }
            )}
          />
        )}
      </div>
    </>
  );
}