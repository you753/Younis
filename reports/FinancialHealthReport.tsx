import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Download, Calendar } from "lucide-react";

export default function FinancialHealthReport() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const financialHealth = {
    overallScore: 85,
    cashFlow: {
      current: 125000,
      projected: 140000,
      trend: 'positive'
    },
    profitability: {
      grossMargin: 35.5,
      netMargin: 18.2,
      trend: 'positive'
    },
    liquidity: {
      currentRatio: 2.8,
      quickRatio: 1.9,
      status: 'healthy'
    },
    debt: {
      debtToEquity: 0.35,
      interestCoverage: 8.5,
      status: 'low_risk'
    },
    recommendations: [
      { type: 'warning', message: 'زيادة الاستثمار في المخزون بنسبة 15%' },
      { type: 'success', message: 'الوضع النقدي ممتاز للتوسع' },
      { type: 'info', message: 'تحسين دورة التحصيل إلى 30 يوم' }
    ]
  };

  const exportReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الصحة المالية</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .score-card { text-align: center; background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .score { font-size: 48px; font-weight: bold; color: #0ea5e9; }
          .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
          .metric { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
          .metric-title { font-weight: bold; margin-bottom: 10px; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          .warning { color: #f59e0b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير الصحة المالية</h1>
        </div>

        <div class="score-card">
          <div class="score">${financialHealth.overallScore}</div>
          <p>نقاط الصحة المالية من 100</p>
        </div>

        <div class="metrics">
          <div class="metric">
            <div class="metric-title">التدفق النقدي</div>
            <p>الحالي: ${financialHealth.cashFlow.current.toLocaleString('en-US')} ريال</p>
            <p>المتوقع: ${financialHealth.cashFlow.projected.toLocaleString('en-US')} ريال</p>
          </div>
          <div class="metric">
            <div class="metric-title">الربحية</div>
            <p>هامش الربح الإجمالي: ${financialHealth.profitability.grossMargin}%</p>
            <p>هامش الربح الصافي: ${financialHealth.profitability.netMargin}%</p>
          </div>
          <div class="metric">
            <div class="metric-title">السيولة</div>
            <p>نسبة السيولة الحالية: ${financialHealth.liquidity.currentRatio}</p>
            <p>نسبة السيولة السريعة: ${financialHealth.liquidity.quickRatio}</p>
          </div>
          <div class="metric">
            <div class="metric-title">المديونية</div>
            <p>نسبة الدين إلى رأس المال: ${financialHealth.debt.debtToEquity}</p>
            <p>تغطية الفوائد: ${financialHealth.debt.interestCoverage}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقرير الصحة المالية</h1>
          <p className="text-gray-600 mt-2">تقييم شامل للوضع المالي للشركة</p>
        </div>
        <div className="flex gap-3">
          <Input
            type="date"
            className="w-40"
          />
          <Button onClick={exportReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* نقاط الصحة المالية */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-100">
        <CardContent className="p-8 text-center">
          <div className="text-6xl font-bold text-blue-600 mb-4">{financialHealth.overallScore}</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">نقاط الصحة المالية</h2>
          <p className="text-gray-600">من أصل 100 نقطة</p>
          <Badge className="mt-4 bg-green-100 text-green-800 px-4 py-2">
            <CheckCircle className="w-4 h-4 ml-2" />
            وضع مالي ممتاز
          </Badge>
        </CardContent>
      </Card>

      {/* المؤشرات المالية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التدفق النقدي</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {financialHealth.cashFlow.current.toLocaleString('en-US')} ريال
            </div>
            <p className="text-xs text-gray-600 mt-1">
              متوقع: {financialHealth.cashFlow.projected.toLocaleString('en-US')} ريال
            </p>
            <Badge className="mt-2 bg-green-100 text-green-800">
              <TrendingUp className="w-3 h-3 ml-1" />
              اتجاه إيجابي
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الربحية</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {financialHealth.profitability.netMargin}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              هامش إجمالي: {financialHealth.profitability.grossMargin}%
            </p>
            <Badge className="mt-2 bg-green-100 text-green-800">
              <TrendingUp className="w-3 h-3 ml-1" />
              متحسن
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">السيولة</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {financialHealth.liquidity.currentRatio}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              سريعة: {financialHealth.liquidity.quickRatio}
            </p>
            <Badge className="mt-2 bg-blue-100 text-blue-800">
              <CheckCircle className="w-3 h-3 ml-1" />
              سليمة
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المديونية</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {financialHealth.debt.debtToEquity}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              تغطية فوائد: {financialHealth.debt.interestCoverage}x
            </p>
            <Badge className="mt-2 bg-orange-100 text-orange-800">
              <CheckCircle className="w-3 h-3 ml-1" />
              مخاطر منخفضة
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* التوصيات */}
      <Card>
        <CardHeader>
          <CardTitle>التوصيات المالية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financialHealth.recommendations.map((rec, index) => (
              <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                {rec.type === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                {rec.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {rec.type === 'info' && <Activity className="h-5 w-5 text-blue-500" />}
                <span className="flex-1">{rec.message}</span>
                <Badge variant={rec.type === 'warning' ? 'destructive' : rec.type === 'success' ? 'default' : 'secondary'}>
                  {rec.type === 'warning' ? 'تحذير' : rec.type === 'success' ? 'فرصة' : 'معلومة'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}