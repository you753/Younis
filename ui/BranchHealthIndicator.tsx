import { Heart, TrendingUp, Package, Users, Activity, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface HealthMetrics {
  healthScore: number;
  salesPerformance: number;
  inventoryHealth: number;
  customerSatisfaction: number;
}

interface BranchHealthIndicatorProps {
  branchName: string;
  metrics: HealthMetrics;
  className?: string;
}

const getHealthEmoji = (score: number) => {
  if (score >= 90) return "🚀";
  if (score >= 80) return "💪";
  if (score >= 70) return "😊";
  if (score >= 60) return "🙂";
  if (score >= 50) return "😐";
  if (score >= 40) return "😟";
  return "😨";
};

const getHealthColor = (score: number) => {
  if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
};

const getHealthLabel = (score: number) => {
  if (score >= 90) return "ممتاز";
  if (score >= 80) return "جيد جداً";
  if (score >= 70) return "جيد";
  if (score >= 60) return "مقبول";
  if (score >= 50) return "متوسط";
  if (score >= 40) return "ضعيف";
  return "يحتاج تدخل";
};

const getProgressColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

export default function BranchHealthIndicator({ branchName, metrics, className = "" }: BranchHealthIndicatorProps) {
  const { healthScore, salesPerformance, inventoryHealth, customerSatisfaction } = metrics;

  return (
    <Card className={`p-4 relative overflow-hidden ${className}`}>
      {/* Sparkle animation for high scores */}
      {healthScore >= 85 && (
        <div className="absolute top-2 right-2 animate-pulse">
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{getHealthEmoji(healthScore)}</div>
          <div>
            <h3 className="font-semibold text-sm">{branchName}</h3>
            <Badge 
              variant="outline" 
              className={`text-xs ${getHealthColor(healthScore)}`}
            >
              {getHealthLabel(healthScore)}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{healthScore.toFixed(0)}%</div>
          <div className="text-xs text-gray-500">الصحة العامة</div>
        </div>
      </div>

      {/* Overall health progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">المؤشر العام</span>
          <span className="text-xs font-medium">{healthScore.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(healthScore)}`}
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>

      {/* Individual metrics */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-blue-500" />
          <div>
            <div className="text-gray-600">المبيعات</div>
            <div className="font-medium">{salesPerformance.toFixed(0)}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Package className="h-3 w-3 text-purple-500" />
          <div>
            <div className="text-gray-600">المخزون</div>
            <div className="font-medium">{inventoryHealth.toFixed(0)}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-green-500" />
          <div>
            <div className="text-gray-600">العملاء</div>
            <div className="font-medium">{customerSatisfaction.toFixed(0)}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3 text-orange-500" />
          <div>
            <div className="text-gray-600">النشاط</div>
            <div className="font-medium">
              {healthScore >= 80 ? "عالي" : healthScore >= 60 ? "متوسط" : "منخفض"}
            </div>
          </div>
        </div>
      </div>

      {/* Animated pulse for attention */}
      {healthScore < 50 && (
        <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-pulse opacity-30" />
      )}
    </Card>
  );
}