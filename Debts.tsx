import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calendar,
  Eye,
  Edit,
  Trash2,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Mock data for development
const mockDebts = [
  {
    id: 1,
    debtorType: 'client',
    debtorName: 'شركة التقنية المتقدمة',
    amount: '50000',
    remainingAmount: '30000',
    type: 'receivable',
    description: 'مستحقات مبيعات شهر 5',
    dueDate: new Date('2025-07-15'),
    status: 'active',
    priority: 'high',
    createdAt: new Date('2025-05-15')
  },
  {
    id: 2,
    debtorType: 'supplier',
    debtorName: 'مؤسسة الإمدادات الصناعية',
    amount: '25000',
    remainingAmount: '25000',
    type: 'payable',
    description: 'فاتورة مشتريات معدات',
    dueDate: new Date('2025-07-30'),
    status: 'active',
    priority: 'medium',
    createdAt: new Date('2025-06-01')
  },
  {
    id: 3,
    debtorType: 'employee',
    debtorName: 'أحمد محمد السالم',
    amount: '5000',
    remainingAmount: '2500',
    type: 'receivable',
    description: 'سلفة موظف',
    dueDate: new Date('2025-08-01'),
    status: 'active',
    priority: 'low',
    createdAt: new Date('2025-06-10')
  }
];

interface DebtFormData {
  debtorType: string;
  debtorName: string;
  amount: string;
  type: string;
  description: string;
  dueDate: string;
  priority: string;
}

export default function Debts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Use mock data for now
  const { data: debts = mockDebts } = useQuery({
    queryKey: ['/api/debts'],
    queryFn: () => Promise.resolve(mockDebts),
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter debts
  const filteredDebts = debts.filter((debt: any) => {
    const matchesSearch = debt.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         debt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter;
    const matchesType = typeFilter === 'all' || debt.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const totalReceivable = debts
    .filter((debt: any) => debt.type === 'receivable')
    .reduce((sum: number, debt: any) => sum + parseFloat(debt.remainingAmount), 0);

  const totalPayable = debts
    .filter((debt: any) => debt.type === 'payable')
    .reduce((sum: number, debt: any) => sum + parseFloat(debt.remainingAmount), 0);

  const overdueDebts = debts.filter((debt: any) => 
    new Date(debt.dueDate) < new Date() && debt.status === 'active'
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'receivable' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const formatCurrency = (amount: string | number) => {
    return parseFloat(amount.toString()).toLocaleString('en-US', {
      style: 'currency',
      currency: 'SAR'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الديون</h1>
          <p className="text-gray-600 mt-1">متابعة وإدارة المديونيات والمطلوبات</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة دين جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستحقات لنا</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalReceivable)}
            </div>
            <p className="text-xs text-muted-foreground">مبالغ مدينة لنا</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المطلوبات علينا</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalPayable)}
            </div>
            <p className="text-xs text-muted-foreground">مبالغ دائنة علينا</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الديون المتأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overdueDebts}</div>
            <p className="text-xs text-muted-foreground">تحتاج متابعة عاجلة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الديون</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{debts.length}</div>
            <p className="text-xs text-muted-foreground">جميع السجلات</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في الديون..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="paid">مدفوع</SelectItem>
                <SelectItem value="overdue">متأخر</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة بالنوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="receivable">مدين لنا</SelectItem>
                <SelectItem value="payable">دائن علينا</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Debts List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الديون</CardTitle>
          <CardDescription>
            عرض جميع الديون والمطلوبات مع تفاصيل الاستحقاق والحالة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDebts.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد ديون</h3>
                <p className="mt-1 text-sm text-gray-500">لم يتم العثور على ديون بالمعايير المحددة</p>
              </div>
            ) : (
              filteredDebts.map((debt: any) => (
                <div key={debt.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(debt.type)}
                        <h3 className="font-semibold text-lg">{debt.debtorName}</h3>
                        <Badge className={getStatusColor(debt.status)}>
                          {debt.status === 'active' ? 'نشط' : 
                           debt.status === 'paid' ? 'مدفوع' : 
                           debt.status === 'overdue' ? 'متأخر' : 'ملغي'}
                        </Badge>
                        <Badge className={getPriorityColor(debt.priority)}>
                          {debt.priority === 'high' ? 'عالي' : 
                           debt.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{debt.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">المبلغ الكلي:</span>
                          <div className="font-semibold">{formatCurrency(debt.amount)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">المبلغ المتبقي:</span>
                          <div className="font-semibold text-red-600">{formatCurrency(debt.remainingAmount)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">تاريخ الاستحقاق:</span>
                          <div className="font-semibold">
                            {format(new Date(debt.dueDate), 'dd/MM/yyyy', { locale: ar })}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">النوع:</span>
                          <div className="font-semibold">
                            {debt.type === 'receivable' ? 'مدين لنا' : 'دائن علينا'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}