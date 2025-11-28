import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator as CalculatorIcon, X } from 'lucide-react';

export default function Calculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForValue, setWaitingForValue] = useState(false);

  const calculate = (firstValue: string, secondValue: string, operation: string) => {
    const first = parseFloat(firstValue);
    const second = parseFloat(secondValue);

    switch (operation) {
      case '+':
        return (first + second).toString();
      case '-':
        return (first - second).toString();
      case '*':
        return (first * second).toString();
      case '/':
        return second !== 0 ? (first / second).toString() : 'Error';
      default:
        return secondValue;
    }
  };

  const inputNumber = (num: string) => {
    if (waitingForValue) {
      setDisplay(num);
      setWaitingForValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = display;

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || '0';
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(newValue);
      setPreviousValue(newValue);
    }

    setWaitingForValue(true);
    setOperation(nextOperation);
  };

  const performCalculation = () => {
    const inputValue = display;

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(newValue);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForValue(true);
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForValue(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const inputDecimal = () => {
    if (waitingForValue) {
      setDisplay('0.');
      setWaitingForValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50" data-testid="calculator-button">
        <Button
          onClick={() => setIsOpen(true)}
          className="shadow-lg bg-green-600 hover:bg-green-700"
          size="default"
        >
          <CalculatorIcon className="h-5 w-5 ml-2" />
          آلة حاسبة
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Card className="w-64 shadow-xl mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">آلة حاسبة</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Display */}
          <div className="bg-gray-100 p-3 rounded text-right text-lg font-mono border">
            {display}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" onClick={clearAll} className="text-sm">
              C
            </Button>
            <Button variant="outline" onClick={clearEntry} className="text-sm">
              CE
            </Button>
            <Button variant="outline" onClick={() => inputOperation('/')} className="text-sm">
              ÷
            </Button>
            <Button variant="outline" onClick={() => inputOperation('*')} className="text-sm">
              ×
            </Button>

            <Button variant="outline" onClick={() => inputNumber('7')} className="text-sm">
              7
            </Button>
            <Button variant="outline" onClick={() => inputNumber('8')} className="text-sm">
              8
            </Button>
            <Button variant="outline" onClick={() => inputNumber('9')} className="text-sm">
              9
            </Button>
            <Button variant="outline" onClick={() => inputOperation('-')} className="text-sm">
              -
            </Button>

            <Button variant="outline" onClick={() => inputNumber('4')} className="text-sm">
              4
            </Button>
            <Button variant="outline" onClick={() => inputNumber('5')} className="text-sm">
              5
            </Button>
            <Button variant="outline" onClick={() => inputNumber('6')} className="text-sm">
              6
            </Button>
            <Button variant="outline" onClick={() => inputOperation('+')} className="text-sm">
              +
            </Button>

            <Button variant="outline" onClick={() => inputNumber('1')} className="text-sm">
              1
            </Button>
            <Button variant="outline" onClick={() => inputNumber('2')} className="text-sm">
              2
            </Button>
            <Button variant="outline" onClick={() => inputNumber('3')} className="text-sm">
              3
            </Button>
            <Button 
              variant="default" 
              onClick={performCalculation} 
              className="row-span-2 bg-blue-600 hover:bg-blue-700 text-sm"
            >
              =
            </Button>

            <Button 
              variant="outline" 
              onClick={() => inputNumber('0')} 
              className="col-span-2 text-sm"
            >
              0
            </Button>
            <Button variant="outline" onClick={inputDecimal} className="text-sm">
              .
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}