import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Plus,
  Eye,
  Download,
  Building,
  Users,
  Target,
  PieChart
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AccountingTree {
  id: number;
  code: string;
  name: string;
  nameEn?: string;
  parentId?: number;
  level: number;
  accountType: string;
  isActive: boolean;
  isMain: boolean;
  debitBalance: string;
  creditBalance: string;
  branchId?: number;
  consolidationAccountId?: number;
}

interface JournalEntry {
  id: number;
  description: string;
  reference?: string;
  totalDebit: string;
  totalCredit: string;
  status: string;
  createdAt: string;
  details?: JournalEntryDetail[];
}

interface JournalEntryDetail {
  id: number;
  accountId: number;
  debit: string;
  credit: string;
  description: string;
  account?: AccountingTree;
}

interface ConsolidationReport {
  id: number;
  reportType: string;
  period: string;
  startDate: string;
  endDate: string;
  branchIds: number[];
  reportData: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    branchBreakdown: Array<{
      branchId: number;
      branchName: string;
      revenue: number;
      expenses: number;
      netIncome: number;
    }>;
    accountSummary: Array<{
      accountCode: string;
      accountName: string;
      totalDebit: number;
      totalCredit: number;
      balance: number;
    }>;
  };
  status: string;
  createdAt: string;
}

export default function BranchAccounting() {
  const params = useParams();
  const branchId = params.branchId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [newJournalEntry, setNewJournalEntry] = useState({
    description: '',
    reference: '',
    entries: [
      { accountId: 0, debit: 0, credit: 0, description: '' },
      { accountId: 0, debit: 0, credit: 0, description: '' }
    ]
  });

  // جلب شجرة الحسابات للفرع
  const { data: chartOfAccounts } = useQuery({
    queryKey: [`/api/branch-accounting/chart-of-accounts?branchId=${branchId}`],
    enabled: !!branchId
  });

  // جلب القيود المحاسبية
  const { data: journalEntries } = useQuery({
    queryKey: [`/api/branch-accounting/journal-entries?branchId=${branchId}`],
    enabled: !!branchId
  });

  // جلب التقارير التجميعية
  const { data: consolidationReports } = useQuery({
    queryKey: [`/api/branch-accounting/consolidation-reports?branchId=${branchId}`],
    enabled: !!branchId
  });

  // جلب مؤشرات الأداء
  const { data: kpis } = useQuery({
    queryKey: [`/api/branch-accounting/kpis?branchId=${branchId}`],
    enabled: !!branchId
  });

  // إنشاء شجرة حسابات للفرع
  const createChartMutation = useMutation({
    mutationFn: async (basedOnBranchId?: number) => {
      return apiRequest(`/api/branch-accounting/create-chart?branchId=${branchId}`, {
        method: 'POST',
        body: { basedOnBranchId }
      });
    },
    onSuccess: () => {
      toast({
        title: "نجح الإنشاء",
        description: "تم إنشاء شجرة الحسابات للفرع بنجاح",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/branch-accounting/chart-of-accounts`] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإنشاء",
        description: error.message || "فشل في إنشاء شجرة الحسابات",
        variant: "destructive"
      });
    }
  });

  // إنشاء قيد محاسبي
  const createJournalEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      return apiRequest(`/api/branch-accounting/create-journal-entry?branchId=${branchId}`, {
        method: 'POST',
        body: { entryData }
      });
    },
    onSuccess: () => {
      toast({
        title: "نجح الإنشاء",
        description: "تم إنشاء القيد المحاسبي بنجاح",
        variant: "default"
      });
      setNewJournalEntry({
        description: '',
        reference: '',
        entries: [
          { accountId: 0, debit: 0, credit: 0, description: '' },
          { accountId: 0, debit: 0, credit: 0, description: '' }
        ]
      });
      queryClient.invalidateQueries({ queryKey: [`/api/branch-accounting/journal-entries`] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإنشاء",
        description: error.message || "فشل في إنشاء القيد المحاسبي",
        variant: "destructive"
      });
    }
  });

  // حساب مؤشرات الأداء
  const calculateKpisMutation = useMutation({
    mutationFn: async (reportDate: string) => {
      return apiRequest(`/api/branch-accounting/calculate-kpis?branchId=${branchId}`, {
        method: 'POST',
        body: { reportDate }
      });
    },
    onSuccess: () => {
      toast({
        title: "تم الحساب",
        description: "تم حساب مؤشرات الأداء بنجاح",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/branch-accounting/kpis`] });
    }
  });

  const addJournalEntryRow = () => {
    setNewJournalEntry(prev => ({
      ...prev,
      entries: [...prev.entries, { accountId: 0, debit: 0, credit: 0, description: '' }]
    }));
  };

  const removeJournalEntryRow = (index: number) => {
    if (newJournalEntry.entries.length > 2) {
      setNewJournalEntry(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateJournalEntryRow = (index: number, field: string, value: any) => {
    setNewJournalEntry(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const handleCreateJournalEntry = () => {
    // التحقق من التوازن
    const totalDebit = newJournalEntry.entries.reduce((sum, entry) => sum + parseFloat(entry.debit.toString() || '0'), 0);
    const totalCredit = newJournalEntry.entries.reduce((sum, entry) => sum + parseFloat(entry.credit.toString() || '0'), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast({
        title: "خطأ في التوازن",
        description: "مجموع المدين يجب أن يساوي مجموع الدائن",
        variant: "destructive"
      });
      return;
    }

    createJournalEntryMutation.mutate(newJournalEntry);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">النظام المحاسبي للفرع</h1>
          <p className="text-gray-600 mt-2">إدارة شاملة للمحاسبة والتقارير المالية</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => calculateKpisMutation.mutate(new Date().toISOString().split('T')[0])}
            disabled={calculateKpisMutation.isPending}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            حساب المؤشرات
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            شجرة الحسابات
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            القيود المحاسبية
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            التقارير التجميعية
          </TabsTrigger>
          <TabsTrigger value="kpis" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            مؤشرات الأداء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.totalRevenue?.toLocaleString() || '0'} ر.س</div>
                <p className="text-xs text-muted-foreground">+20.1% من الشهر الماضي</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.totalExpenses?.toLocaleString() || '0'} ر.س</div>
                <p className="text-xs text-muted-foreground">+2.5% من الشهر الماضي</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.netProfit?.toLocaleString() || '0'} ر.س</div>
                <p className="text-xs text-muted-foreground">+15.3% من الشهر الماضي</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">هامش الربح</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.profitMargin?.toFixed(1) || '0'}%</div>
                <p className="text-xs text-muted-foreground">+2.1% من الشهر الماضي</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ملخص الحسابات الرئيسية</CardTitle>
              <CardDescription>أرصدة الحسابات الأساسية للفرع</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الحساب</TableHead>
                    <TableHead>اسم الحساب</TableHead>
                    <TableHead>نوع الحساب</TableHead>
                    <TableHead>الرصيد المدين</TableHead>
                    <TableHead>الرصيد الدائن</TableHead>
                    <TableHead>الرصيد الصافي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(chartOfAccounts as AccountingTree[])?.filter(account => account.level === 1)?.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.accountType}</Badge>
                      </TableCell>
                      <TableCell>{parseFloat(account.debitBalance).toLocaleString()}</TableCell>
                      <TableCell>{parseFloat(account.creditBalance).toLocaleString()}</TableCell>
                      <TableCell className={
                        parseFloat(account.debitBalance) - parseFloat(account.creditBalance) >= 0 
                          ? "text-green-600" 
                          : "text-red-600"
                      }>
                        {(parseFloat(account.debitBalance) - parseFloat(account.creditBalance)).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>شجرة الحسابات</CardTitle>
              <CardDescription>إدارة وعرض الهيكل المحاسبي للفرع</CardDescription>
            </CardHeader>
            <CardContent>
              {!chartOfAccounts || (chartOfAccounts as AccountingTree[]).length === 0 ? (
                <Alert>
                  <Building className="h-4 w-4" />
                  <AlertDescription>
                    لم يتم إنشاء شجرة الحسابات لهذا الفرع بعد.
                    <Button 
                      onClick={() => createChartMutation.mutate()}
                      disabled={createChartMutation.isPending}
                      className="mr-2"
                    >
                      إنشاء شجرة الحسابات
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الحساب</TableHead>
                      <TableHead>اسم الحساب</TableHead>
                      <TableHead>المستوى</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الرصيد المدين</TableHead>
                      <TableHead>الرصيد الدائن</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(chartOfAccounts as AccountingTree[]).map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono">{account.code}</TableCell>
                        <TableCell style={{ paddingRight: `${account.level * 20}px` }}>
                          {account.name}
                        </TableCell>
                        <TableCell>{account.level}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.accountType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell>{parseFloat(account.debitBalance).toLocaleString()}</TableCell>
                        <TableCell>{parseFloat(account.creditBalance).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إنشاء قيد محاسبي جديد</CardTitle>
                <CardDescription>أدخل تفاصيل القيد المحاسبي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">وصف القيد</Label>
                  <Textarea
                    id="description"
                    placeholder="أدخل وصف القيد المحاسبي"
                    value={newJournalEntry.description}
                    onChange={(e) => setNewJournalEntry(prev => ({...prev, description: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">رقم المرجع</Label>
                  <Input
                    id="reference"
                    placeholder="رقم المرجع (اختياري)"
                    value={newJournalEntry.reference}
                    onChange={(e) => setNewJournalEntry(prev => ({...prev, reference: e.target.value}))}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>تفاصيل القيد</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addJournalEntryRow}
                    >
                      <Plus className="h-4 w-4" />
                      إضافة سطر
                    </Button>
                  </div>

                  {newJournalEntry.entries.map((entry, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end border p-2 rounded">
                      <div className="col-span-4">
                        <Label className="text-xs">الحساب</Label>
                        <Select 
                          value={entry.accountId?.toString() || ''} 
                          onValueChange={(value) => updateJournalEntryRow(index, 'accountId', parseInt(value))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="اختر حساب" />
                          </SelectTrigger>
                          <SelectContent>
                            {(chartOfAccounts as AccountingTree[])?.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.code} - {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">مدين</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8"
                          value={entry.debit}
                          onChange={(e) => updateJournalEntryRow(index, 'debit', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">دائن</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8"
                          value={entry.credit}
                          onChange={(e) => updateJournalEntryRow(index, 'credit', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        {newJournalEntry.entries.length > 2 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="h-8"
                            onClick={() => removeJournalEntryRow(index)}
                          >
                            حذف
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    المجموع - مدين: {newJournalEntry.entries.reduce((sum, entry) => sum + parseFloat(entry.debit.toString() || '0'), 0).toFixed(2)}
                    ، دائن: {newJournalEntry.entries.reduce((sum, entry) => sum + parseFloat(entry.credit.toString() || '0'), 0).toFixed(2)}
                  </div>
                  <Button 
                    onClick={handleCreateJournalEntry}
                    disabled={createJournalEntryMutation.isPending}
                  >
                    إنشاء القيد
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>القيود المحاسبية الحديثة</CardTitle>
                <CardDescription>آخر القيود المسجلة في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(journalEntries as JournalEntry[])?.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{entry.description}</h4>
                          {entry.reference && (
                            <p className="text-sm text-gray-600">مرجع: {entry.reference}</p>
                          )}
                        </div>
                        <Badge variant={entry.status === 'approved' ? 'default' : 'secondary'}>
                          {entry.status === 'approved' ? 'معتمد' : 'في الانتظار'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>المدين: {parseFloat(entry.totalDebit).toLocaleString()}</span>
                        <span>الدائن: {parseFloat(entry.totalCredit).toLocaleString()}</span>
                        <span>{new Date(entry.createdAt).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التقارير التجميعية</CardTitle>
              <CardDescription>تقارير شاملة تجمع بيانات من عدة فروع</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(consolidationReports as ConsolidationReport[])?.map((report) => (
                  <div key={report.id} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">تقرير {report.reportType}</h4>
                        <p className="text-sm text-gray-600">
                          الفترة: {new Date(report.startDate).toLocaleDateString('en-GB')} - {new Date(report.endDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <Badge variant={report.status === 'final' ? 'default' : 'secondary'}>
                        {report.status === 'final' ? 'نهائي' : 'مسودة'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                        <p className="font-medium">{report.reportData.totalRevenue.toLocaleString()} ر.س</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">إجمالي المصروفات</p>
                        <p className="font-medium">{report.reportData.totalExpenses.toLocaleString()} ر.س</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">صافي الدخل</p>
                        <p className={`font-medium ${report.reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {report.reportData.netIncome.toLocaleString()} ر.س
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        تحميل التقرير
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مؤشرات الأداء المالي</CardTitle>
              <CardDescription>مؤشرات شاملة لقياس أداء الفرع المالي</CardDescription>
            </CardHeader>
            <CardContent>
              {kpis ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">الربحية</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>الربح الإجمالي:</span>
                        <span className="font-medium">{kpis.grossProfit?.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>صافي الربح:</span>
                        <span className="font-medium">{kpis.netProfit?.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>هامش الربح:</span>
                        <span className="font-medium">{kpis.profitMargin?.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">الكفاءة</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>دوران المخزون:</span>
                        <span className="font-medium">{kpis.inventoryTurnover?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>دوران الذمم:</span>
                        <span className="font-medium">{kpis.receivablesTurnover?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>العائد على الأصول:</span>
                        <span className="font-medium">{kpis.returnOnAssets?.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">السيولة</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>النسبة الجارية:</span>
                        <span className="font-medium">{kpis.currentRatio?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>التدفق النقدي:</span>
                        <span className="font-medium">{kpis.cashFlowFromOperations?.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>رضا العملاء:</span>
                        <span className="font-medium">{kpis.customerSatisfactionScore?.toFixed(1)}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    لم يتم حساب مؤشرات الأداء بعد. انقر على "حساب المؤشرات" لتحديث البيانات.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}