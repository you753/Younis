import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Delete, Divide, Minus, Plus, X } from 'lucide-react';

export default function BranchCalculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        return current !== 0 ? prev / current : 0;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const handlePercentage = () => {
    const current = parseFloat(display);
    setDisplay(String(current / 100));
    setNewNumber(true);
  };

  const handleToggleSign = () => {
    const current = parseFloat(display);
    setDisplay(String(-current));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <Calculator className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">الآلة الحاسبة</h1>
            <p className="text-green-100 mt-1">حاسبة احترافية للعمليات الحسابية</p>
          </div>
        </div>
      </div>

      {/* Calculator */}
      <Card className="border-2 border-green-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
          <CardTitle className="text-center text-green-900">آلة حاسبة احترافية</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Display */}
          <div className="bg-slate-900 text-white p-6 rounded-lg mb-6 border-4 border-green-500">
            <div className="text-right">
              <div className="text-sm text-gray-400 h-6">
                {previousValue !== null && operation && (
                  <span>
                    {previousValue} {operation === '*' ? '×' : operation === '/' ? '÷' : operation}
                  </span>
                )}
              </div>
              <div 
                className="text-4xl font-bold font-mono break-all" 
                style={{ direction: 'ltr' }}
                data-testid="calculator-display"
              >
                {display}
              </div>
            </div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <Button
              onClick={handleClear}
              className="col-span-2 h-16 text-xl font-bold bg-red-500 hover:bg-red-600 text-white"
              data-testid="button-clear"
            >
              C
            </Button>
            <Button
              onClick={handleBackspace}
              className="h-16 text-xl bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="button-backspace"
            >
              <Delete className="h-6 w-6" />
            </Button>
            <Button
              onClick={() => handleOperation('/')}
              className="h-16 text-xl bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-divide"
            >
              <Divide className="h-6 w-6" />
            </Button>

            {/* Row 2 */}
            <Button
              onClick={() => handleNumber('7')}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-7"
            >
              7
            </Button>
            <Button
              onClick={() => handleNumber('8')}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-8"
            >
              8
            </Button>
            <Button
              onClick={() => handleNumber('9')}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-9"
            >
              9
            </Button>
            <Button
              onClick={() => handleOperation('*')}
              className="h-16 text-xl bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-multiply"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Row 3 */}
            <Button
              onClick={() => handleNumber('4')}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-4"
            >
              4
            </Button>
            <Button
              onClick={() => handleNumber('5')}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-5"
            >
              5
            </Button>
            <Button
              onClick={() => handleNumber('6')}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-6"
            >
              6
            </Button>
            <Button
              onClick={() => handleOperation('-')}
              className="h-16 text-xl bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-subtract"
            >
              <Minus className="h-6 w-6" />
            </Button>

            {/* Row 4 */}
            <Button
              onClick={() => handleNumber('1')}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-1"
            >
              1
            </Button>
            <Button
              onClick={() => handleNumber('2')}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-2"
            >
              2
            </Button>
            <Button
              onClick={() => handleNumber('3')}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-3"
            >
              3
            </Button>
            <Button
              onClick={() => handleOperation('+')}
              className="h-16 text-xl bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-add"
            >
              <Plus className="h-6 w-6" />
            </Button>

            {/* Row 5 */}
            <Button
              onClick={handleToggleSign}
              className="h-16 text-xl bg-gray-600 hover:bg-gray-700 text-white"
              data-testid="button-toggle-sign"
            >
              +/-
            </Button>
            <Button
              onClick={() => handleNumber('0')}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-0"
            >
              0
            </Button>
            <Button
              onClick={handleDecimal}
              className="h-16 text-2xl font-bold bg-gray-700 hover:bg-gray-800 text-white"
              data-testid="button-decimal"
            >
              .
            </Button>
            <Button
              onClick={handleEquals}
              className="h-16 text-xl bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-equals"
            >
              =
            </Button>
          </div>

          {/* Additional Functions */}
          <div className="mt-4">
            <Button
              onClick={handlePercentage}
              className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="button-percentage"
            >
              % نسبة مئوية
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              إرشادات الاستخدام
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• استخدم الأرقام والعمليات الحسابية الأساسية</li>
              <li>• اضغط C لمسح جميع العمليات</li>
              <li>• اضغط ← لحذف آخر رقم</li>
              <li>• اضغط % لحساب النسبة المئوية</li>
              <li>• اضغط +/- لتغيير الإشارة</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
