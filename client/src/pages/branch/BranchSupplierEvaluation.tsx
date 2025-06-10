import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  BarChart3, 
  Star,
  TrendingUp,
  TrendingDown,
  Truck
} from 'lucide-react';

interface BranchSupplierEvaluationProps {
  branchId: number;
}

const evaluations = [
  { 
    id: 1, 
    supplierName: 'خير الله', 
    qualityScore: 85, 
    deliveryScore: 90, 
    priceScore: 75, 
    overallScore: 83,
    trend: 'up',
    lastEvaluation: '2024-01-15'
  },
  { 
    id: 2, 
    supplierName: 'مورد الأقمشة', 
    qualityScore: 78, 
    deliveryScore: 85, 
    priceScore: 82, 
    overallScore: 82,
    trend: 'stable',
    lastEvaluation: '2024-01-10'
  },
  { 
    id: 3, 
    supplierName: 'الشركة المتحدة', 
    qualityScore: 70, 
    deliveryScore: 65, 
    priceScore: 88, 
    overallScore: 74,
    trend: 'down',
    lastEvaluation: '2024-01-08'
  }
];

export default function BranchSupplierEvaluation({ branchId }: BranchSupplierEvaluationProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvaluations = evaluations.filter(evaluation =>
    evaluation.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقييم الموردين</h1>
            <p className="text-gray-600">تقييم أداء موردي الفرع {branchId}</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Star className="h-4 w-4 mr-2" />
          إضافة تقييم جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في تقييمات الموردين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredEvaluations.length} تقييم
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تقييمات</h3>
              <p className="text-gray-500 mb-6">لم يتم العثور على أي تقييمات مطابقة للبحث</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Star className="h-4 w-4 mr-2" />
                إضافة أول تقييم
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvaluations.map((evaluation) => (
                <Card key={evaluation.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{evaluation.supplierName}</h3>
                          <p className="text-sm text-gray-500">آخر تقييم: {evaluation.lastEvaluation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full ${getScoreBgColor(evaluation.overallScore)}`}>
                          <span className={`font-bold ${getScoreColor(evaluation.overallScore)}`}>
                            {evaluation.overallScore}%
                          </span>
                        </div>
                        {getTrendIcon(evaluation.trend)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">جودة المنتجات</span>
                          <span className={`text-sm font-bold ${getScoreColor(evaluation.qualityScore)}`}>
                            {evaluation.qualityScore}%
                          </span>
                        </div>
                        <Progress value={evaluation.qualityScore} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">سرعة التسليم</span>
                          <span className={`text-sm font-bold ${getScoreColor(evaluation.deliveryScore)}`}>
                            {evaluation.deliveryScore}%
                          </span>
                        </div>
                        <Progress value={evaluation.deliveryScore} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">تنافسية الأسعار</span>
                          <span className={`text-sm font-bold ${getScoreColor(evaluation.priceScore)}`}>
                            {evaluation.priceScore}%
                          </span>
                        </div>
                        <Progress value={evaluation.priceScore} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        عرض التفاصيل
                      </Button>
                      <Button variant="outline" size="sm">
                        تقييم جديد
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}