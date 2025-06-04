import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, FileText, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaxCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  discount?: number;
}

export default function TaxCalculator() {
  const [subtotal, setSubtotal] = useState<string>('');
  const [taxRate, setTaxRate] = useState<string>('15'); // 15% VAT default for Saudi Arabia
  const [discount, setDiscount] = useState<string>('');
  const [discountType, setDiscountType] = useState<string>('percentage');
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);

  const calculateTax = () => {
    const subtotalNum = parseFloat(subtotal) || 0;
    const taxRateNum = parseFloat(taxRate) || 0;
    const discountNum = parseFloat(discount) || 0;

    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotalNum * discountNum) / 100;
    } else {
      discountAmount = discountNum;
    }

    const discountedSubtotal = subtotalNum - discountAmount;
    const taxAmount = (discountedSubtotal * taxRateNum) / 100;
    const total = discountedSubtotal + taxAmount;

    setCalculation({
      subtotal: subtotalNum,
      taxRate: taxRateNum,
      taxAmount,
      total,
      discount: discountAmount
    });
  };

  const resetCalculator = () => {
    setSubtotal('');
    setTaxRate('15');
    setDiscount('');
    setDiscountType('percentage');
    setCalculation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">حاسبة الضرائب</h1>
          <p className="text-gray-600">احسب الضرائب والمجاميع للفواتير</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              بيانات الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subtotal">المبلغ الفرعي (قبل الضريبة)</Label>
              <Input
                id="subtotal"
                type="number"
                placeholder="0.00"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
              <Select value={taxRate} onValueChange={setTaxRate}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نسبة الضريبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">معفي من الضريبة (0%)</SelectItem>
                  <SelectItem value="5">ضريبة القيمة المضافة (5%)</SelectItem>
                  <SelectItem value="15">ضريبة القيمة المضافة (15%)</SelectItem>
                  <SelectItem value="10">ضريبة خاصة (10%)</SelectItem>
                  <SelectItem value="20">ضريبة خاصة (20%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">الخصم</Label>
              <div className="flex gap-2">
                <Input
                  id="discount"
                  type="number"
                  placeholder="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="text-right flex-1"
                />
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">ريال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateTax} className="flex-1">
                <Calculator className="h-4 w-4 ml-2" />
                احسب
              </Button>
              <Button variant="outline" onClick={resetCalculator}>
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              نتائج الحساب
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculation ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المبلغ الفرعي:</span>
                    <span className="font-medium">{calculation.subtotal.toFixed(2)} ريال</span>
                  </div>
                  
                  {calculation.discount && calculation.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>الخصم:</span>
                      <span>- {calculation.discount.toFixed(2)} ريال</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">المبلغ بعد الخصم:</span>
                    <span className="font-medium">{(calculation.subtotal - (calculation.discount || 0)).toFixed(2)} ريال</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">الضريبة ({calculation.taxRate}%):</span>
                    <span className="font-medium">{calculation.taxAmount.toFixed(2)} ريال</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>المجموع الكلي:</span>
                    <span>{calculation.total.toFixed(2)} ريال</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded text-center">
                    <div className="text-blue-600 font-medium">نسبة الضريبة</div>
                    <div className="text-lg font-bold text-blue-700">{calculation.taxRate}%</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded text-center">
                    <div className="text-green-600 font-medium">مبلغ الضريبة</div>
                    <div className="text-lg font-bold text-green-700">{calculation.taxAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>أدخل البيانات واضغط "احسب" لرؤية النتائج</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الضرائب في المملكة العربية السعودية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">ضريبة القيمة المضافة</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• النسبة الأساسية: 15%</li>
                <li>• تطبق على معظم السلع والخدمات</li>
                <li>• إلزامية للمنشآت التي تتجاوز 375,000 ريال سنوياً</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">السلع المعفاة</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• المواد الغذائية الأساسية</li>
                <li>• الخدمات الطبية</li>
                <li>• الخدمات التعليمية</li>
                <li>• العقارات السكنية</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}