import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet, Plus, Save, AlertCircle, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface OpeningBalanceItem {
  id?: number;
  clientId: number;
  clientName: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  notes: string;
  date: string;
}

export default function BranchOpeningBalance() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<OpeningBalanceItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [newBalance, setNewBalance] = useState<Partial<OpeningBalanceItem>>({
    date: new Date().toISOString().split('T')[0]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب العملاء
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // جلب الأرصدة الافتتاحية
  const { data: openingBalances = [], isLoading } = useQuery<OpeningBalanceItem[]>({
    queryKey: ['/api/opening-balances'],
  });

  // إضافة رصيد افتتاحي
  const addBalanceMutation = useMutation({
    mutationFn: async (balance: Partial<OpeningBalanceItem>) => {
      const response = await fetch('/api/opening-balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(balance),
      });
      if (!response.ok) throw new Error('فشل في إضافة الرصيد');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opening-balances'] });
      toast({ title: 'تم إضافة الرصيد الافتتاحي بنجاح' });
      setNewBalance({ date: new Date().toISOString().split('T')[0] });
    },
    onError: () => {
      toast({ title: 'خطأ في إضافة الرصيد', variant: 'destructive' });
    }
  });

  // استيراد الأرصدة من Excel
  const importBalancesMutation = useMutation({
    mutationFn: async (balances: OpeningBalanceItem[]) => {
      const response = await fetch('/api/opening-balances/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balances }),
      });
      if (!response.ok) throw new Error('فشل في استيراد الأرصدة');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opening-balances'] });
      toast({ title: 'تم استيراد الأرصدة الافتتاحية بنجاح' });
      setImportData([]);
      setSelectedFile(null);
    },
    onError: () => {
      toast({ title: 'خطأ في استيراد الأرصدة', variant: 'destructive' });
    }
  });

  // معالجة ملف Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processedData: OpeningBalanceItem[] = jsonData.map((row: any, index) => ({
          id: index + 1,
          clientId: row['رقم العميل'] || 0,
          clientName: row['اسم العميل'] || '',
          debitAmount: parseFloat(row['مدين'] || '0'),
          creditAmount: parseFloat(row['دائن'] || '0'),
          balance: parseFloat(row['الرصيد'] || '0'),
          notes: row['ملاحظات'] || '',
          date: new Date().toISOString().split('T')[0]
        }));

        setImportData(processedData);
        toast({ title: 'تم قراءة الملف بنجاح' });
      } catch (error) {
        toast({ title: 'خطأ في قراءة الملف', variant: 'destructive' });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // تحميل نموذج Excel
  const downloadTemplate = () => {
    const templateData = [
      {
        'رقم العميل': 1,
        'اسم العميل': 'شركة النور التجارية',
        'مدين': 5000,
        'دائن': 0,
        'الرصيد': 5000,
        'ملاحظات': 'رصيد افتتاحي'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الأرصدة الافتتاحية');
    XLSX.writeFile(workbook, 'نموذج-الأرصدة-الافتتاحية.xlsx');
  };

  // إضافة رصيد جديد
  const handleAddBalance = () => {
    if (!newBalance.clientId || !newBalance.balance) {
      toast({ title: 'يرجى تعبئة جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    const selectedClient = clients.find((c: Client) => c.id === newBalance.clientId);
    addBalanceMutation.mutate({
      ...newBalance,
      clientName: selectedClient?.name || '',
      debitAmount: newBalance.balance! > 0 ? newBalance.balance! : 0,
      creditAmount: newBalance.balance! < 0 ? Math.abs(newBalance.balance!) : 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* العنوان */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8" />
                الأرصدة الافتتاحية
              </h1>
              <p className="text-blue-100 mt-2">الفرع 117</p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Upload className="h-5 w-5 mr-2" />
              + إضافة رصيد افتتاحي
            </Button>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">75.38</div>
                <div className="text-orange-100">متوسط التكلفة</div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">9.80</div>
                <div className="text-green-100">إجمالي القيمة</div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Upload className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">130</div>
                <div className="text-purple-100">إجمالي الكمية</div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Plus className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">4</div>
                <div className="text-blue-100">إجمالي المنتجات</div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Download className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* استيراد من Excel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              استيراد من ملف Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="excel-file">ملف Excel</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                تحميل النموذج
              </Button>
            </div>

            {selectedFile && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  تم اختيار الملف: {selectedFile.name} ({importData.length} صف)
                </AlertDescription>
              </Alert>
            )}

            {importData.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">معاينة البيانات:</h3>
                <div className="max-h-60 overflow-y-auto border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم العميل</TableHead>
                        <TableHead>مدين</TableHead>
                        <TableHead>دائن</TableHead>
                        <TableHead>الرصيد</TableHead>
                        <TableHead>ملاحظات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importData.slice(0, 5).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.clientName}</TableCell>
                          <TableCell>{item.debitAmount.toLocaleString()}</TableCell>
                          <TableCell>{item.creditAmount.toLocaleString()}</TableCell>
                          <TableCell>{item.balance.toLocaleString()}</TableCell>
                          <TableCell>{item.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => importBalancesMutation.mutate(importData)}
                    disabled={importBalancesMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    استيراد البيانات ({importData.length} عنصر)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setImportData([])}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* إضافة رصيد يدوياً */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إضافة رصيد افتتاحي جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="client">العميل</Label>
                <Select 
                  value={newBalance.clientId?.toString()} 
                  onValueChange={(value) => setNewBalance({...newBalance, clientId: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: Client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="balance">الرصيد</Label>
                <Input
                  id="balance"
                  type="number"
                  value={newBalance.balance || ''}
                  onChange={(e) => setNewBalance({...newBalance, balance: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="date">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={newBalance.date || ''}
                  onChange={(e) => setNewBalance({...newBalance, date: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Input
                  id="notes"
                  value={newBalance.notes || ''}
                  onChange={(e) => setNewBalance({...newBalance, notes: e.target.value})}
                  placeholder="ملاحظات اختيارية"
                />
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleAddBalance}
                  disabled={addBalanceMutation.isPending}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة الأرصدة الحالية */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>الأرصدة الافتتاحية التفصيلية</CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Input
                    placeholder="البحث عن عميل أو رقم المنتج..."
                    className="pl-10 w-64"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  تصدير متقدمة
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center p-4">جاري التحميل...</div>
            ) : openingBalances.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                لا توجد أرصدة افتتاحية مسجلة
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>مدين</TableHead>
                      <TableHead>دائن</TableHead>
                      <TableHead>الرصيد النهائي</TableHead>
                      <TableHead>ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openingBalances.map((balance: OpeningBalanceItem) => (
                      <TableRow key={balance.id}>
                        <TableCell>{new Date(balance.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>{balance.clientName}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {balance.debitAmount.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell className="text-red-600 font-medium">
                          {balance.creditAmount.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell className={`font-bold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {balance.balance.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell>{balance.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}