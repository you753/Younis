import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, Receipt, FileText, Printer, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface BranchClientAccountsProps {
  branchId?: number;
}

interface ClientAccount {
  id: number;
  name: string;
  code: string;
  openingBalance: number;
  currentBalance: number;
  totalSales: number;
  totalPayments: number;
  phone: string;
  status: string;
}

export default function SimpleBranchClientAccounts({ branchId }: BranchClientAccountsProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBalance, setFilterBalance] = useState('all');
  const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(null);
  const [showStatementDialog, setShowStatementDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientAccount | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    code: '',
    phone: '',
    openingBalance: 0
  });

  // استعلام البيانات الحقيقية من الخادم - فقط عملاء هذا الفرع
  const { data: clients, isLoading, refetch: refetchClients } = useQuery({
    queryKey: ['/api/clients', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/clients${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId,
    refetchInterval: 3000
  });

  // تحويل بيانات العملاء للنسق المطلوب
  const clientAccounts: ClientAccount[] = (clients || []).map((client: any) => ({
    id: client.id,
    name: client.name,
    code: `CLI${client.id.toString().padStart(3, '0')}`,
    openingBalance: parseFloat(client.openingBalance?.toString()) || 0,
    currentBalance: parseFloat(client.balance?.toString()) || 0,
    totalSales: parseFloat(client.totalSales?.toString()) || 0,
    totalPayments: parseFloat(client.totalPayments?.toString()) || 0,
    phone: client.phone || 'غير محدد',
    status: 'نشط'
  }));

  // بيانات كشف الحساب
  const getStatementData = (clientId: number) => [
    {
      date: 'الرصيد الافتتاحي',
      description: 'الرصيد الافتتاحي',
      debit: 0,
      credit: 0,
      balance: selectedClient?.openingBalance || 0
    },
    {
      date: '2024/07/01',
      description: 'فاتورة مبيعات رقم INV-001',
      debit: 3000,
      credit: 0,
      balance: (selectedClient?.openingBalance || 0) + 3000
    },
    {
      date: '2024/07/05',
      description: 'فاتورة مبيعات رقم INV-002',
      debit: 15000,
      credit: 0,
      balance: (selectedClient?.openingBalance || 0) + 18000
    },
    {
      date: '2024/07/10',
      description: 'سند قبض رقم REC-001',
      debit: 0,
      credit: 5000,
      balance: (selectedClient?.openingBalance || 0) + 13000
    },
    {
      date: '2024/07/15',
      description: 'فاتورة مبيعات رقم INV-003',
      debit: 7000,
      credit: 0,
      balance: (selectedClient?.openingBalance || 0) + 20000
    },
    {
      date: '2024/07/20',
      description: 'سند قبض رقم REC-002',
      debit: 0,
      credit: 8000,
      balance: selectedClient?.currentBalance || 0
    }
  ];

  const filteredAccounts = clientAccounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBalance === 'all' ||
                         (filterBalance === 'positive' && account.currentBalance > 0) ||
                         (filterBalance === 'negative' && account.currentBalance < 0) ||
                         (filterBalance === 'zero' && account.currentBalance === 0);
    
    return matchesSearch && matchesFilter;
  });

  // تطبيق pagination
  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData: paginatedAccounts,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredAccounts,
    itemsPerPage: 10,
    resetTriggers: [searchTerm, filterBalance]
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const handleShowStatement = (client: ClientAccount) => {
    setSelectedClient(client);
    setShowStatementDialog(true);
  };

  const handleViewClient = (client: ClientAccount) => {
    setSelectedClient(client);
    setShowViewDialog(true);
  };

  const handleEditClient = (client: ClientAccount) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      code: client.code,
      phone: client.phone,
      openingBalance: client.openingBalance
    });
    setShowAddDialog(true);
  };

  // إضافة عميل جديد
  const addClientMutation = useMutation({
    mutationFn: async (clientData: typeof newClient) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientData.name,
          phone: clientData.phone,
          email: '',
          address: '',
          openingBalance: clientData.openingBalance,
          balance: clientData.openingBalance
        })
      });
      if (!response.ok) throw new Error('فشل في إضافة العميل');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', branchId] });
      refetchClients();
      setShowAddDialog(false);
      setNewClient({ name: '', code: '', phone: '', openingBalance: 0 });
      toast({ title: 'تم بنجاح', description: 'تم إضافة العميل بنجاح', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في إضافة العميل', variant: 'destructive' });
    }
  });

  // تحديث عميل
  const updateClientMutation = useMutation({
    mutationFn: async (clientData: { id: number } & typeof newClient) => {
      const response = await fetch(`/api/clients/${clientData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientData.name,
          phone: clientData.phone,
          openingBalance: clientData.openingBalance
        })
      });
      if (!response.ok) throw new Error('فشل في تحديث العميل');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', branchId] });
      refetchClients();
      setShowAddDialog(false);
      setEditingClient(null);
      setNewClient({ name: '', code: '', phone: '', openingBalance: 0 });
      toast({ title: 'تم بنجاح', description: 'تم تحديث العميل بنجاح', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في تحديث العميل', variant: 'destructive' });
    }
  });

  // حذف عميل
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('فشل في حذف العميل');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', branchId] });
      refetchClients();
      toast({ title: 'تم بنجاح', description: 'تم حذف العميل بنجاح', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في حذف العميل', variant: 'destructive' });
    }
  });

  const handleDeleteClient = (client: ClientAccount) => {
    if (confirm(`هل أنت متأكد من حذف العميل "${client.name}"؟`)) {
      deleteClientMutation.mutate(client.id);
    }
  };

  const handleAddClient = () => {
    if (editingClient) {
      updateClientMutation.mutate({
        id: editingClient.id,
        ...newClient
      });
    } else {
      addClientMutation.mutate(newClient);
    }
  };

  const printStatement = () => {
    if (!selectedClient) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const statementData = getStatementData(selectedClient.id);

    const printContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب العميل - ${selectedClient.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          .company-info {
            margin-bottom: 20px;
            text-align: center;
          }
          .client-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
          }
          .client-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .statement-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .statement-table th,
          .statement-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
          }
          .statement-table th {
            background-color: #f1f3f4;
            font-weight: bold;
          }
          .debit { color: #d32f2f; }
          .credit { color: #388e3c; }
          .balance { font-weight: bold; }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>كشف حساب العميل</h1>
          <div class="company-info">
            
            <p>المملكة العربية السعودية</p>
          </div>
        </div>

        <div class="client-info">
          <h3>بيانات العميل</h3>
          <div class="client-grid">
            <div><strong>اسم العميل:</strong> ${selectedClient.name}</div>
            <div><strong>كود العميل:</strong> ${selectedClient.code}</div>
            <div><strong>رقم الهاتف:</strong> ${selectedClient.phone}</div>
            <div><strong>تاريخ الكشف:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>

        <table class="statement-table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>البيان</th>
              <th>مدين</th>
              <th>دائن</th>
              <th>الرصيد</th>
            </tr>
          </thead>
          <tbody>
            ${statementData.map(item => `
              <tr>
                <td>${item.date}</td>
                <td>${item.description}</td>
                <td class="debit">${item.debit ? formatNumber(item.debit) : '-'}</td>
                <td class="credit">${item.credit ? formatNumber(item.credit) : '-'}</td>
                <td class="balance">${formatNumber(item.balance)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>تم إنشاء هذا الكشف في: ${new Date().toLocaleString('en-US')}</p>
          <p>نظام المحاسب الأعظم</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // حساب الإحصائيات
  const totalCurrentBalance = clientAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalOpeningBalance = clientAccounts.reduce((sum, acc) => sum + acc.openingBalance, 0);
  const totalSales = clientAccounts.reduce((sum, acc) => sum + acc.totalSales, 0);
  const totalPayments = clientAccounts.reduce((sum, acc) => sum + acc.totalPayments, 0);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ تحميل بيانات العملاء...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* العنوان */}
      <div className="flex items-center gap-3">
        <div className="bg-gray-200 p-3 rounded-full border border-gray-900">
          <User className="h-6 w-6 text-gray-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">حسابات العملاء</h1>
          <p className="text-gray-600">إدارة حسابات العملاء وكشوف الحسابات</p>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-2 border-gray-900">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{clientAccounts.length}</div>
              <div className="text-sm text-gray-600">إجمالي العملاء</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-900">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(totalCurrentBalance)} ر.س</div>
              <div className="text-sm text-gray-600">الرصيد الحالي</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-900">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(totalSales)} ر.س</div>
              <div className="text-sm text-gray-600">إجمالي المبيعات</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-900">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(totalPayments)} ر.س</div>
              <div className="text-sm text-gray-600">إجمالي المدفوعات</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* البحث والتصفية */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-white border-gray-300 text-gray-900 h-11"
              />
            </div>
          </div>
          <Select value={filterBalance} onValueChange={setFilterBalance}>
            <SelectTrigger className="w-full sm:w-48 h-11 bg-white border-gray-300">
              <SelectValue placeholder="نوع الرصيد" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="all">جميع الأرصدة</SelectItem>
              <SelectItem value="positive">رصيد موجب</SelectItem>
              <SelectItem value="negative">رصيد سالب</SelectItem>
              <SelectItem value="zero">رصيد صفر</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => {
              setEditingClient(null);
              setNewClient({ name: '', code: '', phone: '', openingBalance: 0 });
              setShowAddDialog(true);
            }}
            className="bg-gray-900 hover:bg-gray-800 h-11"
          >
            <Plus className="h-4 w-4 ml-2" />
            جديد
          </Button>
        </div>
      </div>

      {/* قائمة العملاء */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">قائمة العملاء ({filteredAccounts.length})</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {paginatedAccounts.map((account) => (
              <div key={account.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">{account.name}</span>
                      <span className="text-sm text-gray-500">#{account.id}</span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-900 border border-gray-900">
                        {account.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">الرصيد الافتتاحي: </span>
                        <span className="text-gray-900 font-medium">{formatNumber(account.openingBalance)} ر.س</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الرصيد الحالي: </span>
                        <span className="font-bold text-gray-900">
                          {formatNumber(account.currentBalance)} ر.س
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">إجمالي المبيعات: </span>
                        <span className="text-gray-900 font-medium">{formatNumber(account.totalSales)} ر.س</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الهاتف: </span>
                        <span className="text-gray-900">{account.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-gray-900"
                      onClick={() => handleViewClient(account)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-gray-900"
                      onClick={() => handleEditClient(account)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-gray-900"
                      onClick={() => handleDeleteClient(account)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAccounts.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد عملاء</h3>
                <p className="text-gray-500">لم يتم العثور على عملاء مطابقين للبحث</p>
              </div>
            )}
          </div>

          {pageCount > 1 && (
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              totalItems={filteredAccounts.length}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </div>
      </div>

      {/* حوار كشف الحساب */}
      <Dialog open={showStatementDialog} onOpenChange={setShowStatementDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              كشف حساب العميل - {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-4">
              {/* معلومات العميل */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-bold text-gray-900 mb-3">معلومات العميل</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">اسم العميل:</span> <span className="font-medium">{selectedClient.name}</span></div>
                  <div><span className="text-gray-600">كود العميل:</span> <span className="font-medium">{selectedClient.code}</span></div>
                  <div><span className="text-gray-600">الهاتف:</span> <span className="font-medium">{selectedClient.phone}</span></div>
                  <div><span className="text-gray-600">تاريخ الكشف:</span> <span className="font-medium">{new Date().toLocaleDateString('en-GB')}</span></div>
                </div>
              </div>

              {/* جدول كشف الحساب */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-center font-bold text-gray-900 border-b">التاريخ</th>
                      <th className="p-3 text-center font-bold text-gray-900 border-b">البيان</th>
                      <th className="p-3 text-center font-bold text-gray-900 border-b">مدين</th>
                      <th className="p-3 text-center font-bold text-gray-900 border-b">دائن</th>
                      <th className="p-3 text-center font-bold text-gray-900 border-b">الرصيد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getStatementData(selectedClient.id).map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 text-center border-b">{item.date}</td>
                        <td className="p-3 text-right border-b">{item.description}</td>
                        <td className="p-3 text-center border-b text-gray-900 font-medium">
                          {item.debit ? formatNumber(item.debit) : '-'}
                        </td>
                        <td className="p-3 text-center border-b text-gray-900 font-medium">
                          {item.credit ? formatNumber(item.credit) : '-'}
                        </td>
                        <td className="p-3 text-center border-b font-bold">
                          {formatNumber(item.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* أزرار العمليات */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  الرصيد النهائي: <span className="font-bold text-lg text-gray-900">{formatNumber(selectedClient.currentBalance)} ر.س</span>
                </div>
                <Button
                  onClick={printStatement}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  طباعة الكشف
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة إضافة/تعديل العميل */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'تحديث العميل' : 'إضافة عميل جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل *</label>
              <Input
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                placeholder="أدخل اسم العميل"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رمز العميل *</label>
              <Input
                value={newClient.code}
                onChange={(e) => setNewClient({...newClient, code: e.target.value})}
                placeholder="CLI001"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <Input
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                placeholder="أدخل رقم الهاتف"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرصيد الافتتاحي</label>
              <Input
                type="number"
                value={newClient.openingBalance}
                onChange={(e) => setNewClient({...newClient, openingBalance: parseFloat(e.target.value) || 0})}
                placeholder="0"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleAddClient}
              disabled={!newClient.name || !newClient.code}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {editingClient ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة معاينة العميل */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>معاينة العميل</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedClient.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{selectedClient.code}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الهاتف:</span>
                  <span className="font-medium">{selectedClient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الرصيد الافتتاحي:</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(selectedClient.openingBalance)} ر.س
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الرصيد الحالي:</span>
                  <span className="font-bold text-gray-900">
                    {formatNumber(selectedClient.currentBalance)} ر.س
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">إجمالي المبيعات:</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(selectedClient.totalSales)} ر.س
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">إجمالي المدفوعات:</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(selectedClient.totalPayments)} ر.س
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة:</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-900 border border-gray-900">
                    {selectedClient.status}
                  </span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => handleShowStatement(selectedClient)}
                  className="w-full bg-gray-900 hover:bg-gray-800"
                >
                  <FileText className="h-4 w-4 ml-2" />
                  عرض كشف الحساب
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}