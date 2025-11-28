import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Plus, Search, FileText, Download, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaxAccount {
  id: number;
  accountName: string;
  taxType: string;
  taxRate: number;
  accountNumber: string;
  currentBalance: number;
  lastTransaction: string;
  status: 'active' | 'inactive';
  description: string;
  createdAt: string;
}

export default function TaxAccounts() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaxType, setSelectedTaxType] = useState('all');
  
  // بيانات تجريبية للحسابات الضريبية
  const [taxAccounts] = useState<TaxAccount[]>([
    {
      id: 1,
      accountName: 'ضريبة القيمة المضافة - مبيعات',
      taxType: 'VAT_OUTPUT',
      taxRate: 15,
      accountNumber: 'TAX-001',
      currentBalance: 12500.00,
      lastTransaction: '2025-07-13',
      status: 'active',
      description: 'حساب ضريبة القيمة المضافة على المبيعات',
      createdAt: '2025-01-01'
    },
    {
      id: 2,
      accountName: 'ضريبة القيمة المضافة - مشتريات',
      taxType: 'VAT_INPUT',
      taxRate: 15,
      accountNumber: 'TAX-002',
      currentBalance: -8750.00,
      lastTransaction: '2025-07-12',
      status: 'active',
      description: 'حساب ضريبة القيمة المضافة على المشتريات',
      createdAt: '2025-01-01'
    },
    {
      id: 3,
      accountName: 'ضريبة الدخل',
      taxType: 'INCOME_TAX',
      taxRate: 20,
      accountNumber: 'TAX-003',
      currentBalance: 25000.00,
      lastTransaction: '2025-07-10',
      status: 'active',
      description: 'حساب ضريبة الدخل السنوية',
      createdAt: '2025-01-01'
    },
    {
      id: 4,
      accountName: 'ضريبة الخدمات',
      taxType: 'SERVICE_TAX',
      taxRate: 5,
      accountNumber: 'TAX-004',
      currentBalance: 3200.00,
      lastTransaction: '2025-07-11',
      status: 'active',
      description: 'ضريبة على الخدمات المقدمة',
      createdAt: '2025-01-01'
    }
  ]);

  // إحصائيات الحسابات الضريبية
  const stats = {
    totalAccounts: taxAccounts.length,
    activeAccounts: taxAccounts.filter(acc => acc.status === 'active').length,
    totalBalance: taxAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0),
    vatBalance: taxAccounts.filter(acc => acc.taxType.includes('VAT')).reduce((sum, acc) => sum + acc.currentBalance, 0)
  };

  // تصفية الحسابات
  const filteredAccounts = taxAccounts.filter(account => {
    const matchesSearch = account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTaxType === 'all' || account.taxType === selectedTaxType;
    return matchesSearch && matchesType;
  });

  const getTaxTypeLabel = (type: string) => {
    const types = {
      'VAT_OUTPUT': 'ض.ق.م - مبيعات',
      'VAT_INPUT': 'ض.ق.م - مشتريات',
      'INCOME_TAX': 'ضريبة الدخل',
      'SERVICE_TAX': 'ضريبة الخدمات'
    };
    return types[type as keyof typeof types] || type;
  };

  const handleCreateAccount = () => {
    toast({
      title: "تم إنشاء الحساب الضريبي",
      description: "تم إضافة الحساب الضريبي الجديد بنجاح",
    });
    setShowDialog(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            حسابات الضريبة
          </h1>
          <p className="text-gray-600 mt-1">إدارة الحسابات الضريبية والمعاملات الضريبية</p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              إضافة حساب ضريبي
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة حساب ضريبي جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountName">اسم الحساب</Label>
                <Input id="accountName" placeholder="مثال: ضريبة القيمة المضافة" />
              </div>
              <div>
                <Label htmlFor="taxType">نوع الضريبة</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الضريبة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VAT_OUTPUT">ض.ق.م - مبيعات</SelectItem>
                    <SelectItem value="VAT_INPUT">ض.ق.م - مشتريات</SelectItem>
                    <SelectItem value="INCOME_TAX">ضريبة الدخل</SelectItem>
                    <SelectItem value="SERVICE_TAX">ضريبة الخدمات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taxRate">معدل الضريبة (%)</Label>
                <Input id="taxRate" type="number" placeholder="15" />
              </div>
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea id="description" placeholder="وصف الحساب الضريبي" />
              </div>
              <Button onClick={handleCreateAccount} className="w-full">
                إنشاء الحساب
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحسابات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAccounts}</div>
            <p className="text-xs text-muted-foreground">حساب ضريبي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحسابات النشطة</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAccounts}</div>
            <p className="text-xs text-muted-foreground">حساب نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرصيد</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">الرصيد الإجمالي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رصيد ض.ق.م</CardTitle>
            <ArrowUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.vatBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">ضريبة القيمة المضافة</p>
          </CardContent>
        </Card>
      </div>

      {/* فلاتر البحث */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في الحسابات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTaxType} onValueChange={setSelectedTaxType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="نوع الضريبة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="VAT_OUTPUT">ض.ق.م - مبيعات</SelectItem>
                <SelectItem value="VAT_INPUT">ض.ق.م - مشتريات</SelectItem>
                <SelectItem value="INCOME_TAX">ضريبة الدخل</SelectItem>
                <SelectItem value="SERVICE_TAX">ضريبة الخدمات</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="whitespace-nowrap">
              <Download className="h-4 w-4 mr-2" />
              تصدير التقرير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* جدول الحسابات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الحسابات الضريبية</CardTitle>
          <CardDescription>
            إدارة جميع الحسابات الضريبية ومعدلاتها وأرصدتها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الحساب</TableHead>
                <TableHead>رقم الحساب</TableHead>
                <TableHead>نوع الضريبة</TableHead>
                <TableHead>المعدل (%)</TableHead>
                <TableHead>الرصيد الحالي</TableHead>
                <TableHead>آخر معاملة</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.accountName}</TableCell>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTaxTypeLabel(account.taxType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.taxRate}%</TableCell>
                  <TableCell className={account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {account.currentBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </TableCell>
                  <TableCell>{account.lastTransaction}</TableCell>
                  <TableCell>
                    <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                      {account.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}