import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Package, 
  Search, 
  Plus, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  unit: string;
  currentStock: number;
  unitPrice: number;
  minStock: number;
  barcode?: string;
}

interface InventoryCountItem {
  id: string;
  productId: number;
  productName: string;
  productCode: string;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
  notes: string;
  status: 'pending' | 'verified' | 'discrepancy';
}

interface InventoryCount {
  id: number;
  countNumber: string;
  date: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved';
  countedBy: string;
  verifiedBy?: string;
  notes: string;
  totalItems: number;
  discrepancies: number;
  items: InventoryCountItem[];
  createdAt: string;
  updatedAt: string;
}

export default function InventoryCount() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState<InventoryCount | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newCountItems, setNewCountItems] = useState<InventoryCountItem[]>([]);
  const [newCountForm, setNewCountForm] = useState({
    countNumber: '',
    notes: '',
    countedBy: 'يونس المدير الرئيسي'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products for inventory counting
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    enabled: true
  });

  // Fetch existing inventory counts
  const { data: inventoryCounts = [] } = useQuery({
    queryKey: ['/api/inventory-counts'],
    enabled: true
  });

  // Generate count number
  const generateCountNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const time = String(today.getHours()).padStart(2, '0') + String(today.getMinutes()).padStart(2, '0');
    return `JRD-${year}${month}${day}-${time}`;
  };

  // Initialize new count
  const initializeNewCount = () => {
    if (!products.length) return;
    
    const items: InventoryCountItem[] = products.map((product: any) => ({
      id: `item-${product.id}`,
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      systemQuantity: product.currentStock || 0,
      countedQuantity: 0,
      difference: 0,
      notes: '',
      status: 'pending' as const
    }));

    setNewCountItems(items);
    setNewCountForm({
      ...newCountForm,
      countNumber: generateCountNumber()
    });
  };

  // Update counted quantity
  const updateCountedQuantity = (itemId: string, quantity: number) => {
    setNewCountItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const difference = quantity - item.systemQuantity;
        return {
          ...item,
          countedQuantity: quantity,
          difference,
          status: difference === 0 ? 'verified' : 'discrepancy'
        };
      }
      return item;
    }));
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalCounts = inventoryCounts.length;
    const completedCounts = inventoryCounts.filter((count: any) => count.status === 'completed' || count.status === 'approved').length;
    const inProgressCounts = inventoryCounts.filter((count: any) => count.status === 'in_progress' || count.status === 'draft').length;
    const totalDiscrepancies = inventoryCounts.reduce((sum: number, count: any) => sum + (count.discrepancies || 0), 0);

    return {
      totalCounts,
      completedCounts,
      inProgressCounts,
      totalDiscrepancies,
      completionRate: totalCounts > 0 ? Math.round((completedCounts / totalCounts) * 100) : 0
    };
  };

  const stats = calculateStats();

  // Mock data for demonstration
  const mockInventoryCounts: InventoryCount[] = [
    {
      id: 1,
      countNumber: 'JRD-20250626-1430',
      date: '2025-06-26',
      status: 'completed',
      countedBy: 'يونس المدير الرئيسي',
      verifiedBy: 'أحمد المحاسب',
      notes: 'جرد شهري - يونيو 2025',
      totalItems: 145,
      discrepancies: 8,
      items: [],
      createdAt: '2025-06-26T14:30:00Z',
      updatedAt: '2025-06-26T16:45:00Z'
    },
    {
      id: 2,
      countNumber: 'JRD-20250620-0900',
      date: '2025-06-20',
      status: 'approved',
      countedBy: 'سارة مسؤولة المخزون',
      verifiedBy: 'يونس المدير الرئيسي',
      notes: 'جرد أسبوعي - منتجات عالية الحركة',
      totalItems: 67,
      discrepancies: 3,
      items: [],
      createdAt: '2025-06-20T09:00:00Z',
      updatedAt: '2025-06-20T12:30:00Z'
    },
    {
      id: 3,
      countNumber: 'JRD-20250615-1100',
      date: '2025-06-15',
      status: 'in_progress',
      countedBy: 'محمد عامل المخزون',
      notes: 'جرد قسم الإلكترونيات',
      totalItems: 89,
      discrepancies: 5,
      items: [],
      createdAt: '2025-06-15T11:00:00Z',
      updatedAt: '2025-06-15T15:20:00Z'
    }
  ];

  // Create inventory count mutation
  const createCountMutation = useMutation({
    mutationFn: async (countData: any) => {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الجرد بنجاح",
        description: "تم حفظ عملية الجرد الجديدة"
      });
      setIsCreateDialogOpen(false);
      setNewCountItems([]);
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-counts'] });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء الجرد",
        description: "حدث خطأ أثناء حفظ عملية الجرد",
        variant: "destructive"
      });
    }
  });

  // Filter counts
  const filteredCounts = mockInventoryCounts.filter(count => {
    const matchesSearch = count.countNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         count.countedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         count.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || count.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">مسودة</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">مكتمل</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700">معتمد</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  const getDiscrepancyColor = (difference: number) => {
    if (difference === 0) return 'text-green-600';
    if (Math.abs(difference) <= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">جرد المخزون</h1>
          <p className="text-gray-600 mt-1">إدارة وتتبع عمليات جرد المخزون</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            تصدير التقرير
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={initializeNewCount}>
                <Plus className="w-4 h-4" />
                جرد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle>إنشاء عملية جرد جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>رقم الجرد</Label>
                    <Input
                      value={newCountForm.countNumber}
                      onChange={(e) => setNewCountForm({...newCountForm, countNumber: e.target.value})}
                      className="text-right"
                    />
                  </div>
                  <div>
                    <Label>القائم بالجرد</Label>
                    <Input
                      value={newCountForm.countedBy}
                      onChange={(e) => setNewCountForm({...newCountForm, countedBy: e.target.value})}
                      className="text-right"
                    />
                  </div>
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={newCountForm.notes}
                    onChange={(e) => setNewCountForm({...newCountForm, notes: e.target.value})}
                    className="text-right"
                    placeholder="أدخل ملاحظات حول عملية الجرد..."
                  />
                </div>
                
                {/* Products to count */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">الأصناف المراد جردها ({newCountItems.length})</h3>
                  <div className="max-h-96 overflow-y-auto border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-right p-3 text-sm font-medium text-gray-700">كود الصنف</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-700">اسم الصنف</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-700">الكمية بالنظام</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-700">الكمية المعدودة</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-700">الفرق</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-700">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newCountItems.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="p-3 text-sm">{item.productCode}</td>
                            <td className="p-3 text-sm">{item.productName}</td>
                            <td className="p-3 text-sm text-center">{item.systemQuantity}</td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={item.countedQuantity}
                                onChange={(e) => updateCountedQuantity(item.id, parseInt(e.target.value) || 0)}
                                className="w-20 text-center"
                                min="0"
                              />
                            </td>
                            <td className={`p-3 text-sm text-center font-medium ${getDiscrepancyColor(item.difference)}`}>
                              {item.difference > 0 ? `+${item.difference}` : item.difference}
                            </td>
                            <td className="p-3">
                              {item.status === 'verified' && <CheckCircle className="w-4 h-4 text-green-600" />}
                              {item.status === 'discrepancy' && <AlertCircle className="w-4 h-4 text-red-600" />}
                              {item.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={() => createCountMutation.mutate({})}
                    disabled={createCountMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createCountMutation.isPending ? 'جاري الحفظ...' : 'حفظ الجرد'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي عمليات الجرد</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCounts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">العمليات المكتملة</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedCounts}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">قيد التنفيذ</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgressCounts}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الفروقات</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDiscrepancies}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="counts">قائمة الجرد</TabsTrigger>
          <TabsTrigger value="reports">قائمة الجرد التفصيلية</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                ملخص أداء الجرد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{stats.completionRate}%</div>
                  <div className="text-sm text-gray-600 mt-1">معدل الإنجاز</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-gray-600 mt-1">دقة الجرد</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">7.5</div>
                  <div className="text-sm text-gray-600 mt-1">متوسط أيام الجرد</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counts" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في عمليات الجرد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 text-right"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="approved">معتمد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Counts List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                قائمة عمليات الجرد ({filteredCounts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCounts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد عمليات جرد</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-right p-4 text-sm font-medium text-gray-700">رقم الجرد</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-700">التاريخ</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-700">القائم بالجرد</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-700">إجمالي الأصناف</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-700">الفروقات</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-700">الحالة</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-700">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCounts.map((count) => (
                          <tr key={count.id} className="border-t hover:bg-gray-50">
                            <td className="p-4">
                              <div className="font-medium text-blue-600">{count.countNumber}</div>
                              <div className="text-sm text-gray-500">{count.notes}</div>
                            </td>
                            <td className="p-4 text-sm">
                              {format(new Date(count.date), 'dd/MM/yyyy')}
                            </td>
                            <td className="p-4 text-sm">{count.countedBy}</td>
                            <td className="p-4 text-sm text-center">{count.totalItems}</td>
                            <td className="p-4 text-sm text-center">
                              <span className={count.discrepancies > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                                {count.discrepancies}
                              </span>
                            </td>
                            <td className="p-4">{getStatusBadge(count.status)}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Detailed Inventory Count List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                قائمة جرد المخزون التفصيلية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Enhanced Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="البحث برقم الجرد، القائم بالجرد، أو الملاحظات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 text-right"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="تصفية بالحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الحالات</SelectItem>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="approved">معتمد</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      تصدير
                    </Button>
                  </div>
                </div>

                {/* Inventory Count Cards */}
                <div className="grid gap-4">
                  {filteredCounts.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">لا توجد عمليات جرد</h3>
                      <p className="text-gray-400">ابدأ بإنشاء عملية جرد جديدة</p>
                    </div>
                  ) : (
                    filteredCounts.map((count) => (
                      <Card key={count.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Count Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-blue-600">{count.countNumber}</h3>
                                {getStatusBadge(count.status)}
                              </div>
                              <p className="text-gray-600 mb-2">{count.notes}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(count.date), 'dd/MM/yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {count.countedBy}
                                </span>
                                {count.verifiedBy && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    معتمد من: {count.verifiedBy}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Count Statistics */}
                            <div className="flex gap-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{count.totalItems}</div>
                                <div className="text-sm text-gray-500">إجمالي الأصناف</div>
                              </div>
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${count.discrepancies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {count.discrepancies}
                                </div>
                                <div className="text-sm text-gray-500">الفروقات</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {Math.round(((count.totalItems - count.discrepancies) / count.totalItems) * 100)}%
                                </div>
                                <div className="text-sm text-gray-500">دقة الجرد</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700 hover:bg-gray-50">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Progress Bar for In-Progress Counts */}
                          {count.status === 'in_progress' && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>تقدم الجرد</span>
                                <span>75%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {filteredCounts.length > 0 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>
                        السابق
                      </Button>
                      <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                        1
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        التالي
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}