import { useState } from 'react';
import { useParams, useLocation, Link, Switch, Route } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart as PieChartComponent, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

// Import employee management pages
import BranchEmployees from './branch/BranchEmployees';
import BranchSalaries from './branch/BranchSalaries';
// import BranchAllowances from './branch/BranchAllowances'; // ملف غير موجود - معلق مؤقتاً
// import BranchDeductions from './branch/BranchDeductions'; // ملف غير موجود - معلق مؤقتاً
// import BranchAttendance from './branch/BranchAttendance'; // ملف غير موجود - معلق مؤقتاً
// import BranchEmployeeReports from './branch/BranchEmployeeReports'; // ملف غير موجود - معلق مؤقتاً
// import BranchEmployeeVacations from './branch/BranchEmployeeVacations'; // ملف غير موجود - معلق مؤقتاً
import BranchEmployeeStatement from './branch/BranchEmployeeStatement';
import ProfessionalBranchDashboard from './branch/ProfessionalBranchDashboard';

import { 
  Building, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Calculator,
  FileText,
  Truck,
  ShoppingCart,
  TrendingUp,
  PieChart as PieChartIcon,
  Target,
  Layers,
  Activity,
  Home,
  UserCheck,
  Warehouse,
  ChevronDown,
  X,
  Menu,
  ScanBarcode,
  Percent,
  List,
  Tags,
  Plus,
  Monitor,
  Wifi,
  WifiOff,
  PowerOff,
  MapPin,
  Clock,
  RefreshCw,
  Edit,
  Search,
  Filter,
  Download,
  Receipt,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Smartphone,
  Minus,
  Wallet,
  Trash2,
  FolderOpen,
  MoreHorizontal,
  Upload,
  Folder,
  Check,
  Send,
  Share2,
  Grid3x3,
  ScanLine
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface NavItem {
  title: string;
  icon: any;
  href?: string;
  children?: NavItem[];
}

export default function BranchSystem() {
  const params = useParams();
  const branchId = params.branchId;
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['نقاط المبيعات', 'الموردين والعملاء', 'المشتريات', 'المبيعات', 'إدارة المخزون', 'إدارة الموظفين']);
  const [showAddTerminalDialog, setShowAddTerminalDialog] = useState(false);
  const [showEditTerminalDialog, setShowEditTerminalDialog] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<any>(null);
  const [searchTerminal, setSearchTerminal] = useState('');
  const [terminalForm, setTerminalForm] = useState({
    name: '',
    location: '',
    employee: '',
    status: 'active'
  });

  // State لإدارة قائمة المحطات
  const [terminals, setTerminals] = useState([
    {
      id: 1,
      name: 'محطة الكاشير الرئيسي',
      code: 'POS-001',
      location: 'المدخل الرئيسي',
      isOnline: true,
      isActive: true,
      lastActivity: 'منذ 5 دقائق',
      employee: 'أحمد محمد',
      ipAddress: '192.168.1.101'
    },
    {
      id: 2,
      name: 'محطة المبيعات السريعة',
      code: 'POS-002',
      location: 'قسم الخضروات',
      isOnline: false,
      isActive: true,
      lastActivity: 'منذ ساعة',
      employee: 'فاطمة علي',
      ipAddress: '192.168.1.102'
    },
    {
      id: 3,
      name: 'محطة خدمة العملاء',
      code: 'POS-003',
      location: 'قسم خدمة العملاء',
      isOnline: true,
      isActive: false,
      lastActivity: 'منذ 30 دقيقة',
      employee: 'محمد حسن',
      ipAddress: '192.168.1.103'
    }
  ]);

  // وظائف إدارة المحطات
  const handleAddTerminal = () => {
    setTerminalForm({ name: '', location: '', employee: '', status: 'active' });
    setShowAddTerminalDialog(true);
  };

  const handleEditTerminal = (terminal: any) => {
    setSelectedTerminal(terminal);
    setTerminalForm({
      name: terminal.name,
      location: terminal.location,
      employee: terminal.employee || '',
      status: terminal.isOnline ? 'active' : 'inactive'
    });
    setShowEditTerminalDialog(true);
  };

  const handleSaveTerminal = async () => {
    // التحقق من صحة البيانات
    if (!terminalForm.name.trim()) {
      alert('يرجى إدخال اسم المحطة');
      return;
    }
    if (!terminalForm.location.trim()) {
      alert('يرجى إدخال موقع المحطة');
      return;
    }
    if (!terminalForm.employee) {
      alert('يرجى اختيار موظف مختص');
      return;
    }

    try {
      if (selectedTerminal) {
        // تعديل محطة موجودة
        setTerminals(prev => prev.map(terminal => 
          terminal.id === selectedTerminal.id 
            ? {
                ...terminal,
                name: terminalForm.name,
                location: terminalForm.location,
                employee: terminalForm.employee,
                isActive: terminalForm.status === 'active',
                isOnline: terminalForm.status !== 'maintenance'
              }
            : terminal
        ));
        alert('تم تعديل المحطة بنجاح');
        setShowEditTerminalDialog(false);
        setSelectedTerminal(null);
      } else {
        // إضافة محطة جديدة
        const nextId = terminals.length > 0 ? Math.max(...terminals.map(t => t.id)) + 1 : 1;
        const newTerminal = {
          id: nextId,
          name: terminalForm.name,
          code: `POS-${String(nextId).padStart(3, '0')}`,
          location: terminalForm.location,
          employee: terminalForm.employee,
          isOnline: terminalForm.status !== 'maintenance',
          isActive: terminalForm.status === 'active',
          lastActivity: 'الآن',
          ipAddress: `192.168.1.${100 + nextId}`
        };
        console.log('إضافة محطة جديدة:', newTerminal);
        setTerminals(prev => {
          const updated = [...prev, newTerminal];
          console.log('قائمة المحطات المحدثة:', updated);
          return updated;
        });
        alert('تم إضافة المحطة بنجاح');
        setShowAddTerminalDialog(false);
      }
      // إعادة تعيين النموذج
      setTerminalForm({ name: '', location: '', employee: '', status: 'active' });
    } catch (error) {
      alert('حدث خطأ أثناء حفظ المحطة');
    }
  };

  const handleRestartTerminal = async (terminalId: number) => {
    if (confirm('هل أنت متأكد من إعادة تشغيل هذه المحطة؟')) {
      try {
        // تحديث حالة المحطة بعد إعادة التشغيل
        setTerminals(prev => prev.map(terminal => 
          terminal.id === terminalId 
            ? {
                ...terminal,
                isOnline: true,
                lastActivity: 'الآن'
              }
            : terminal
        ));
        alert('تم إعادة تشغيل المحطة بنجاح');
      } catch (error) {
        alert('حدث خطأ أثناء إعادة تشغيل المحطة');
      }
    }
  };

  const handleDeleteTerminal = async (terminalId: number) => {
    if (confirm('هل أنت متأكد من حذف هذه المحطة؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        // حذف المحطة من القائمة
        setTerminals(prev => prev.filter(terminal => terminal.id !== terminalId));
        alert('تم حذف المحطة بنجاح');
      } catch (error) {
        alert('حدث خطأ أثناء حذف المحطة');
      }
    }
  };

  // Fetch branch data
  const { data: branchData } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // Fetch branch stats
  const { data: branchStats } = useQuery({
    queryKey: [`/api/branches/${branchId}/stats`],
    enabled: !!branchId,
  });

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  // Navigation items for branch system
  const navigationItems: NavItem[] = [
    { title: 'لوحة التحكم', icon: Home, href: `/branch/${branchId}` },
    {
      title: 'نقاط المبيعات',
      icon: ShoppingCart,
      children: [
        { title: 'نقطة البيع الاحترافية', icon: ShoppingCart, href: `/pos-system/${branchId}` },
        { title: 'إدارة المحطات', icon: Settings, href: `/branch/${branchId}/pos-terminals` },
        { title: 'مبيعات نقاط البيع', icon: Receipt, href: `/branch/${branchId}/pos-sales` },
        { title: 'تقارير نقاط البيع', icon: BarChart3, href: `/branch/${branchId}/pos-reports` }
      ]
    },
    {
      title: 'الموردين والعملاء',
      icon: Users,
      children: [
        { title: 'قائمة الموردين', icon: Truck, href: `/branch/${branchId}/suppliers` },
        { title: 'قائمة العملاء', icon: UserCheck, href: `/branch/${branchId}/clients` },
        { title: 'سندات صرف الموردين', icon: FileText, href: `/branch/${branchId}/supplier-vouchers` },
        { title: 'سندات قبض العملاء', icon: FileText, href: `/branch/${branchId}/client-vouchers` }
      ]
    },
    {
      title: 'الأصناف',
      icon: Package,
      children: [
        { title: 'قائمة الأصناف', icon: List, href: `/branch/${branchId}/products` },
        { title: 'إضافة صنف', icon: Plus, href: `/branch/${branchId}/products/add` },
        { title: 'فئات الأصناف', icon: Grid3x3, href: `/branch/${branchId}/product-categories` },
        { title: 'الباركود', icon: ScanLine, href: `/branch/${branchId}/products/barcode` }
      ]
    },
    {
      title: 'المشتريات',
      icon: ShoppingCart,
      children: [
        { title: 'فواتير المشتريات', icon: FileText, href: `/branch/${branchId}/purchases` },
        { title: 'سند إدخال بضاعة', icon: Package, href: `/branch/${branchId}/goods-receipt` },
        { title: 'قائمة سندات الإدخال', icon: List, href: `/branch/${branchId}/goods-receipt-list` },
        { title: 'مرتجعات المشتريات', icon: Percent, href: `/branch/${branchId}/purchase-returns` }
      ]
    },
    {
      title: 'المبيعات',
      icon: DollarSign,
      children: [
        { title: 'فواتير المبيعات', icon: FileText, href: `/branch/${branchId}/sales` },
        { title: 'سند صرف بضاعة', icon: Package, href: `/branch/${branchId}/goods-issue` },
        { title: 'مرتجعات المبيعات', icon: Percent, href: `/branch/${branchId}/sales-returns` }
      ]
    },
    {
      title: 'إدارة المخزون',
      icon: Warehouse,
      children: [
        { title: 'حالة المخزون', icon: List, href: `/branch/${branchId}/inventory` },
        { title: 'جرد المخزون', icon: Plus, href: `/branch/${branchId}/inventory-count` },
        { title: 'حركة المخزون', icon: BarChart3, href: `/branch/${branchId}/inventory-movement` },
        { title: 'تنبيهات المخزون', icon: Activity, href: `/branch/${branchId}/inventory-alerts` },
        { title: 'تحويل المخزون', icon: ArrowLeft, href: `/branch/${branchId}/inventory-transfer` }
      ]
    },
    {
      title: 'إدارة الموظفين',
      icon: Users,
      children: [
        { title: 'قائمة الموظفين', icon: Users, href: `/branch/${branchId}/employees` },
        { title: 'كشف حساب الموظف', icon: FileText, href: `/branch/${branchId}/employee-statement` },
        { title: 'الرواتب', icon: DollarSign, href: `/branch/${branchId}/salaries` },
        { title: 'العلاوات', icon: Plus, href: `/branch/${branchId}/allowances` },
        { title: 'الخصومات', icon: Minus, href: `/branch/${branchId}/deductions` },
        { title: 'الحضور والغياب', icon: Activity, href: `/branch/${branchId}/attendance` },
        { title: 'تقارير الموظفين', icon: FileText, href: `/branch/${branchId}/employee-reports` }
      ]
    },

  ];

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isItemActive = item.href === location;
    const isExpanded = expandedItems.includes(item.title);
    
    if (item.children) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between text-right p-3 h-auto font-medium text-white hover:bg-white/10",
              level > 0 && "mr-8 text-sm",
              isExpanded && "bg-white/10"
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-5 w-5", level > 0 && "h-4 w-4")} />
              <span>{item.title}</span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </Button>
          
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} href={item.href || '#'}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-right p-3 h-auto font-medium text-white hover:bg-white/10",
            level > 0 && "mr-8 text-sm",
            isItemActive && "bg-white/20 text-white"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className={cn("h-5 w-5", level > 0 && "h-4 w-4")} />
            <span>{item.title}</span>
          </div>
        </Button>
      </Link>
    );
  };

  if (!branchData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الفرع...</p>
        </div>
      </div>
    );
  }

  const branch = branchData as any;

  // مكون صفحة الموردين
  const BranchSuppliersPage = ({ branchId }: { branchId: string }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
      name: '',
      phone: '',
      email: '',
      address: '',
      taxNumber: '',
      creditLimit: 0,
      openingBalance: 0
    });
    
    // البيانات الحقيقية من قاعدة البيانات
    const { data: suppliersData = [], refetch: refetchSuppliers, isLoading } = useQuery({
      queryKey: [`/api/branches/${branchId}/suppliers`],
      enabled: !!branchId
    });
    
    const suppliers = suppliersData as any[];
    
    const supplierMutation = useMutation({
      mutationFn: async (data: any) => {
        const response = await fetch(`/api/branches/${branchId}/suppliers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      },
      onSuccess: () => {
        refetchSuppliers();
        setShowAddForm(false);
        setNewSupplier({
          name: '',
          phone: '',
          email: '',
          address: '',
          taxNumber: '',
          creditLimit: 0,
          openingBalance: 0
        });
        alert('تم إضافة المورد بنجاح');
      },
      onError: (error: any) => {
        console.error('خطأ في حفظ المورد:', error);
        alert('حدث خطأ أثناء حفظ المورد: ' + error.message);
      }
    });
    
    // بيانات وهمية للموردين مع الأرصدة (سيتم إزالتها)
    const [suppliersOld, setSuppliersOld] = useState([
      { 
        id: 1, 
        name: 'شركة الرياض للتوريدات', 
        phone: '+966501234567', 
        email: 'riyadh@suppliers.com',
        address: 'الرياض - حي الملك فهد',
        category: 'مواد غذائية',
        totalPurchases: 125000,
        lastPurchaseDate: '2024-06-15',
        isActive: true,
        rating: 4.5,
        paymentTerms: '30 يوم',
        balance: 15000
      },
      { 
        id: 2, 
        name: 'مؤسسة الأمانة التجارية', 
        phone: '+966502345678', 
        email: 'amana@trade.com',
        address: 'جدة - حي الحمراء',
        category: 'إلكترونيات',
        totalPurchases: 89000,
        lastPurchaseDate: '2024-06-10',
        isActive: true,
        rating: 4.2,
        paymentTerms: '15 يوم',
        balance: 8500
      },
      { 
        id: 3, 
        name: 'شركة النور للمعدات', 
        phone: '+966503456789', 
        email: 'alnoor@equipment.com',
        address: 'الدمام - حي الفيصلية',
        category: 'معدات',
        totalPurchases: 67500,
        lastPurchaseDate: '2024-06-08',
        isActive: false,
        rating: 3.8,
        paymentTerms: '45 يوم',
        balance: 12000
      }
    ]);

    const filteredSuppliers = isLoading ? [] : (suppliers as any[]).filter((supplier: any) =>
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddSupplier = () => {
      console.log('محاولة حفظ المورد:', newSupplier);
      
      if (!newSupplier.name) {
        alert('يرجى إدخال اسم المورد');
        return;
      }
      
      supplierMutation.mutate({
        name: newSupplier.name,
        phone: newSupplier.phone || '',
        email: newSupplier.email || '',
        address: newSupplier.address || '',
        taxNumber: newSupplier.taxNumber || '',
        creditLimit: newSupplier.creditLimit || 0,
        openingBalance: newSupplier.openingBalance || 0,
        balance: newSupplier.openingBalance || 0
      });
    };

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">موردي الفرع</h1>
            <p className="text-gray-600 mt-1">إدارة وتتبع جميع الموردين في الفرع</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              تصدير البيانات
            </Button>
            <Button 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              إضافة مورد جديد
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Package className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الموردين (الاسم، الهاتف، الفئة)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                فلترة متقدمة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{suppliers.length}</div>
              <div className="text-sm text-gray-600">إجمالي الموردين</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{suppliers.filter(s => s.isActive).length}</div>
              <div className="text-sm text-gray-600">موردين نشطين</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {suppliers.reduce((sum, s) => sum + s.totalPurchases, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">إجمالي المشتريات (ر.س)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">متوسط التقييم</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Supplier Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">إضافة مورد جديد</h3>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المورد *</label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="أدخل اسم المورد"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                

                
                <div>
                  <label className="block text-sm font-medium mb-2">الرقم الضريبي</label>
                  <input
                    type="text"
                    value={newSupplier.taxNumber}
                    onChange={(e) => setNewSupplier({...newSupplier, taxNumber: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="أدخل الرقم الضريبي"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">الرصيد الافتتاحي (ر.س)</label>
                  <input
                    type="number"
                    value={newSupplier.openingBalance}
                    onChange={(e) => setNewSupplier({...newSupplier, openingBalance: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">العنوان</label>
                  <textarea
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="أدخل عنوان المورد"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={handleAddSupplier} className="bg-blue-600 hover:bg-blue-700">
                  حفظ المورد
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الموردين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-right p-3 font-medium">الرقم</th>
                    <th className="text-right p-3 font-medium">اسم المورد</th>
                    <th className="text-right p-3 font-medium">الفئة</th>
                    <th className="text-right p-3 font-medium">الهاتف</th>
                    <th className="text-right p-3 font-medium">إجمالي المشتريات</th>
                    <th className="text-right p-3 font-medium">الرصيد الحالي</th>
                    <th className="text-right p-3 font-medium">آخر عملية شراء</th>
                    <th className="text-right p-3 font-medium">التقييم</th>
                    <th className="text-right p-3 font-medium">الحالة</th>
                    <th className="text-right p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier, index) => (
                    <tr key={supplier.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-xs text-gray-500">{supplier.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{supplier.category}</Badge>
                      </td>
                      <td className="p-3 text-gray-600">{supplier.phone}</td>
                      <td className="p-3 font-medium text-green-600">{supplier.totalPurchases.toLocaleString()} ر.س</td>
                      <td className="p-3 font-medium text-red-600">{supplier.balance.toLocaleString()} ر.س</td>
                      <td className="p-3 text-gray-600">{new Date(supplier.lastPurchaseDate).toLocaleDateString('en-GB')}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{supplier.rating}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={supplier.isActive ? "default" : "secondary"}>
                          {supplier.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedSupplier(supplier)}
                            title="عرض التفاصيل"
                            data-testid={`button-view-supplier-${supplier.id}`}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // مكون صفحة العملاء
  const BranchClientsPage = ({ branchId }: { branchId: string }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newClient, setNewClient] = useState({
      name: '',
      phone: '',
      email: '',
      address: '',
      isVip: false,
      creditLimit: 0,
      openingBalance: 0
    });
    
    // بيانات وهمية للعملاء مع الأرصدة
    const [clients, setClients] = useState([
      { 
        id: 1, 
        name: 'أحمد محمد الشهري', 
        phone: '+966551234567', 
        email: 'ahmed@email.com',
        address: 'الرياض - حي النصر',
        totalPurchases: 45000,
        lastVisitDate: '2024-06-16',
        isActive: true,
        isVip: true,
        balance: 2500,
        visitCount: 15,
        registrationDate: '2024-01-15'
      },
      { 
        id: 2, 
        name: 'فاطمة سعد الحزمي', 
        phone: '+966552345678', 
        email: 'fatima@email.com',
        address: 'جدة - حي الروضة',
        totalPurchases: 32000,
        lastVisitDate: '2024-06-14',
        isActive: true,
        isVip: false,
        balance: 1800,
        visitCount: 12,
        registrationDate: '2024-02-20'
      },
      { 
        id: 3, 
        name: 'خالد عبدالله القحطاني', 
        phone: '+966553456789', 
        email: 'khalid@email.com',
        address: 'الدمام - حي الشاطئ',
        totalPurchases: 18000,
        lastVisitDate: '2024-06-12',
        isActive: true,
        isVip: false,
        balance: 1200,
        visitCount: 8,
        registrationDate: '2024-03-10'
      }
    ]);

    const filteredClients = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddClient = () => {
      console.log('محاولة حفظ العميل:', newClient);
      
      if (!newClient.name) {
        alert('يرجى إدخال اسم العميل');
        return;
      }
      
      try {
        // إضافة العميل الجديد إلى القائمة
        const newClientData = {
          id: clients.length + 1,
          name: newClient.name,
          phone: newClient.phone,
          email: newClient.email,
          address: newClient.address,
          totalPurchases: 0,
          lastVisitDate: new Date().toISOString().split('T')[0],
          isActive: true,
          isVip: newClient.isVip,
          balance: newClient.openingBalance,
          visitCount: 0,
          registrationDate: new Date().toISOString().split('T')[0]
        };
        
        console.log('بيانات العميل الجديد:', newClientData);
        setClients([...clients, newClientData]);
        
        // إعادة تعيين النموذج
        setNewClient({
          name: '',
          phone: '',
          email: '',
          address: '',
          isVip: false,
          creditLimit: 0,
          openingBalance: 0
        });
        setShowAddForm(false);
        alert('تم إضافة العميل بنجاح');
        console.log('تم حفظ العميل بنجاح');
      } catch (error) {
        console.error('خطأ في حفظ العميل:', error);
        alert('حدث خطأ أثناء حفظ العميل');
      }
    };

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">عملاء الفرع</h1>
            <p className="text-gray-600 mt-1">إدارة وتتبع جميع العملاء في الفرع</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              تصدير البيانات
            </Button>
            <Button 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              إضافة عميل جديد
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Users className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في العملاء (الاسم، الهاتف، البريد الإلكتروني)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                فلترة متقدمة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Client Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">إضافة عميل جديد</h3>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم العميل *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="أدخل اسم العميل"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">الرصيد الافتتاحي (ر.س)</label>
                  <input
                    type="number"
                    value={newClient.openingBalance}
                    onChange={(e) => setNewClient({...newClient, openingBalance: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newClient.isVip}
                      onChange={(e) => setNewClient({...newClient, isVip: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">عميل VIP</span>
                  </label>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">العنوان</label>
                  <textarea
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="أدخل عنوان العميل"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={handleAddClient} className="bg-green-600 hover:bg-green-700">
                  حفظ العميل
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
              <div className="text-sm text-gray-600">إجمالي العملاء</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{clients.filter(c => c.isActive).length}</div>
              <div className="text-sm text-gray-600">عملاء نشطين</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {clients.reduce((sum, c) => sum + c.totalPurchases, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">إجمالي المبيعات (ر.س)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{clients.filter(c => c.isVip).length}</div>
              <div className="text-sm text-gray-600">عملاء VIP</div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-right p-3 font-medium">الرقم</th>
                    <th className="text-right p-3 font-medium">اسم العميل</th>
                    <th className="text-right p-3 font-medium">الهاتف</th>
                    <th className="text-right p-3 font-medium">إجمالي المشتريات</th>
                    <th className="text-right p-3 font-medium">الرصيد المستحق</th>
                    <th className="text-right p-3 font-medium">عدد الزيارات</th>
                    <th className="text-right p-3 font-medium">آخر زيارة</th>
                    <th className="text-right p-3 font-medium">النوع</th>
                    <th className="text-right p-3 font-medium">الحالة</th>
                    <th className="text-right p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client, index) => (
                    <tr key={client.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-xs text-gray-500">{client.email}</div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{client.phone}</td>
                      <td className="p-3 font-medium text-green-600">{client.totalPurchases.toLocaleString()} ر.س</td>
                      <td className="p-3">
                        <span className={`font-medium ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {client.balance.toLocaleString()} ر.س
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{client.visitCount}</td>
                      <td className="p-3 text-gray-600">{new Date(client.lastVisitDate).toLocaleDateString('en-GB')}</td>
                      <td className="p-3">
                        {client.isVip ? (
                          <Badge className="bg-yellow-500 text-white">VIP</Badge>
                        ) : (
                          <Badge variant="outline">عادي</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant={client.isActive ? "default" : "secondary"}>
                          {client.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedClient(client)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // مكون صفحة سندات صرف الموردين
  const SupplierVouchersPage = ({ branchId }: { branchId: string }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newVoucher, setNewVoucher] = useState({
      supplierId: '',
      amount: 0,
      description: '',
      paymentMethod: 'نقدي',
      reference: ''
    });
    
    // استخدام نفس بيانات الموردين من الصفحة الرئيسية
    const [localSuppliers, setLocalSuppliers] = useState([
      { id: 1, name: 'شركة الرياض للتوريدات', balance: 15000 },
      { id: 2, name: 'مؤسسة الأمانة التجارية', balance: 8500 },
      { id: 3, name: 'شركة النور للمعدات', balance: 12000 }
    ]);

    // بيانات وهمية لسندات الصرف
    const vouchers = [
      {
        id: 1,
        voucherNumber: 'SP-001',
        supplierName: 'شركة الرياض للتوريدات',
        amount: 5000,
        date: '2024-06-16',
        description: 'دفع مستحقات فاتورة رقم 123',
        paymentMethod: 'نقدي',
        reference: 'REF-001',
        status: 'مدفوع'
      },
      {
        id: 2,
        voucherNumber: 'SP-002',
        supplierName: 'مؤسسة الأمانة التجارية',
        amount: 3500,
        date: '2024-06-15',
        description: 'دفعة على حساب',
        paymentMethod: 'تحويل بنكي',
        reference: 'TRF-002',
        status: 'مدفوع'
      }
    ];

    const suppliers = [
      { id: 1, name: 'شركة الرياض للتوريدات' },
      { id: 2, name: 'مؤسسة الأمانة التجارية' },
      { id: 3, name: 'شركة النور للمعدات' }
    ];

    const filteredVouchers = vouchers.filter(voucher =>
      voucher.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.voucherNumber.includes(searchTerm) ||
      voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddVoucher = () => {
      if (!newVoucher.supplierId || !newVoucher.amount) {
        alert('يرجى إدخال المورد والمبلغ');
        return;
      }

      const selectedSupplier = localSuppliers.find(s => s.id === parseInt(newVoucher.supplierId));
      if (!selectedSupplier) {
        alert('المورد المحدد غير موجود');
        return;
      }

      // تحديث رصيد المورد (خصم المبلغ)
      const updatedSuppliers = localSuppliers.map(supplier => {
        if (supplier.id === parseInt(newVoucher.supplierId)) {
          return {
            ...supplier,
            balance: supplier.balance - newVoucher.amount
          };
        }
        return supplier;
      });
      
      setLocalSuppliers(updatedSuppliers);

      vouchers.push({
        id: vouchers.length + 1,
        voucherNumber: `SP-${String(vouchers.length + 1).padStart(3, '0')}`,
        supplierName: selectedSupplier.name,
        amount: newVoucher.amount,
        date: new Date().toISOString().split('T')[0],
        description: newVoucher.description,
        paymentMethod: newVoucher.paymentMethod,
        reference: newVoucher.reference,
        status: 'مدفوع'
      });

      setNewVoucher({
        supplierId: '',
        amount: 0,
        description: '',
        paymentMethod: 'نقدي',
        reference: ''
      });
      setShowAddForm(false);
      alert(`تم إضافة سند الصرف بنجاح وخصم ${newVoucher.amount} ر.س من رصيد ${selectedSupplier.name}`);
    };

    return (
      <div className="p-6 space-y-6">
        {/* Current Supplier Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {localSuppliers.map(supplier => (
            <Card key={supplier.id} className="p-4 border-2 border-red-200 bg-red-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">{supplier.name}</p>
                  <p className="text-2xl font-bold text-red-600">{supplier.balance.toLocaleString()} ر.س</p>
                  <p className="text-xs text-gray-600">رصيد مطلوب</p>
                </div>
                <div className="text-red-500">
                  <CreditCard className="h-8 w-8" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">سندات صرف الموردين</h1>
            <p className="text-gray-600 mt-1">إدارة سندات الصرف للموردين</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              تصدير البيانات
            </Button>
            <Button 
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              سند صرف جديد
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">إضافة سند صرف جديد</h3>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">المورد *</label>
                  <select
                    value={newVoucher.supplierId}
                    onChange={(e) => setNewVoucher({...newVoucher, supplierId: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">اختر المورد</option>
                    {localSuppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">المبلغ (ر.س) *</label>
                  <input
                    type="number"
                    value={newVoucher.amount}
                    onChange={(e) => setNewVoucher({...newVoucher, amount: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">طريقة الدفع</label>
                  <select
                    value={newVoucher.paymentMethod}
                    onChange={(e) => setNewVoucher({...newVoucher, paymentMethod: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="نقدي">نقدي</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                    <option value="شيك">شيك</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">رقم المرجع</label>
                  <input
                    type="text"
                    value={newVoucher.reference}
                    onChange={(e) => setNewVoucher({...newVoucher, reference: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="رقم الشيك أو التحويل"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">البيان</label>
                  <textarea
                    value={newVoucher.description}
                    onChange={(e) => setNewVoucher({...newVoucher, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="تفاصيل سند الصرف"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={handleAddVoucher} className="bg-red-600 hover:bg-red-700">
                  حفظ السند
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Package className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في سندات الصرف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سندات صرف الموردين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-right p-3 font-medium">رقم السند</th>
                    <th className="text-right p-3 font-medium">المورد</th>
                    <th className="text-right p-3 font-medium">المبلغ</th>
                    <th className="text-right p-3 font-medium">التاريخ</th>
                    <th className="text-right p-3 font-medium">البيان</th>
                    <th className="text-right p-3 font-medium">طريقة الدفع</th>
                    <th className="text-right p-3 font-medium">الحالة</th>
                    <th className="text-right p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVouchers.map((voucher) => (
                    <tr key={voucher.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-blue-600">{voucher.voucherNumber}</td>
                      <td className="p-3">{voucher.supplierName}</td>
                      <td className="p-3 font-medium text-red-600">{voucher.amount.toLocaleString()} ر.س</td>
                      <td className="p-3">{new Date(voucher.date).toLocaleDateString('en-GB')}</td>
                      <td className="p-3">{voucher.description}</td>
                      <td className="p-3">
                        <Badge variant="outline">{voucher.paymentMethod}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-green-500">{voucher.status}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // مكون صفحة سندات قبض العملاء
  const ClientVouchersPage = ({ branchId }: { branchId: string }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newVoucher, setNewVoucher] = useState({
      clientId: '',
      amount: 0,
      description: '',
      paymentMethod: 'نقدي',
      reference: ''
    });
    
    // استخدام نفس بيانات العملاء من الصفحة الرئيسية
    const [localClients, setLocalClients] = useState([
      { id: 1, name: 'أحمد محمد الشهري', balance: 2500 },
      { id: 2, name: 'فاطمة سعد الحزمي', balance: 1800 },
      { id: 3, name: 'خالد عبدالله القحطاني', balance: 1200 }
    ]);

    // بيانات وهمية لسندات القبض
    const vouchers = [
      {
        id: 1,
        voucherNumber: 'CR-001',
        clientName: 'أحمد محمد الشهري',
        amount: 2500,
        date: '2024-06-16',
        description: 'تحصيل من العميل',
        paymentMethod: 'نقدي',
        reference: 'CASH-001',
        status: 'محصل'
      },
      {
        id: 2,
        voucherNumber: 'CR-002',
        clientName: 'فاطمة سعد الحزمي',
        amount: 1800,
        date: '2024-06-15',
        description: 'دفعة على حساب',
        paymentMethod: 'تحويل بنكي',
        reference: 'TRF-002',
        status: 'محصل'
      }
    ];

    const clients = [
      { id: 1, name: 'أحمد محمد الشهري' },
      { id: 2, name: 'فاطمة سعد الحزمي' },
      { id: 3, name: 'خالد عبدالله القحطاني' }
    ];

    const filteredVouchers = vouchers.filter(voucher =>
      voucher.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.voucherNumber.includes(searchTerm) ||
      voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddVoucher = () => {
      if (!newVoucher.clientId || !newVoucher.amount) {
        alert('يرجى إدخال العميل والمبلغ');
        return;
      }

      const selectedClient = localClients.find(c => c.id === parseInt(newVoucher.clientId));
      if (!selectedClient) {
        alert('العميل المحدد غير موجود');
        return;
      }

      // تحديث رصيد العميل (خصم المبلغ)
      const updatedClients = localClients.map(client => {
        if (client.id === parseInt(newVoucher.clientId)) {
          return {
            ...client,
            balance: client.balance - newVoucher.amount
          };
        }
        return client;
      });
      
      setLocalClients(updatedClients);

      vouchers.push({
        id: vouchers.length + 1,
        voucherNumber: `CR-${String(vouchers.length + 1).padStart(3, '0')}`,
        clientName: selectedClient.name,
        amount: newVoucher.amount,
        date: new Date().toISOString().split('T')[0],
        description: newVoucher.description,
        paymentMethod: newVoucher.paymentMethod,
        reference: newVoucher.reference,
        status: 'محصل'
      });

      setNewVoucher({
        clientId: '',
        amount: 0,
        description: '',
        paymentMethod: 'نقدي',
        reference: ''
      });
      setShowAddForm(false);
      alert(`تم إضافة سند القبض بنجاح وخصم ${newVoucher.amount} ر.س من رصيد ${selectedClient.name}`);
    };

    return (
      <div className="p-6 space-y-6">
        {/* Current Client Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {localClients.map(client => (
            <Card key={client.id} className="p-4 border-2 border-green-200 bg-green-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">{client.name}</p>
                  <p className="text-2xl font-bold text-green-600">{client.balance.toLocaleString()} ر.س</p>
                  <p className="text-xs text-gray-600">رصيد مستحق</p>
                </div>
                <div className="text-green-500">
                  <Wallet className="h-8 w-8" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">سندات قبض العملاء</h1>
            <p className="text-gray-600 mt-1">إدارة سندات القبض من العملاء</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              تصدير البيانات
            </Button>
            <Button 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              سند قبض جديد
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">إضافة سند قبض جديد</h3>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">العميل *</label>
                  <select
                    value={newVoucher.clientId}
                    onChange={(e) => setNewVoucher({...newVoucher, clientId: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">اختر العميل</option>
                    {localClients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">المبلغ (ر.س) *</label>
                  <input
                    type="number"
                    value={newVoucher.amount}
                    onChange={(e) => setNewVoucher({...newVoucher, amount: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">طريقة الدفع</label>
                  <select
                    value={newVoucher.paymentMethod}
                    onChange={(e) => setNewVoucher({...newVoucher, paymentMethod: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="نقدي">نقدي</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                    <option value="شيك">شيك</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">رقم المرجع</label>
                  <input
                    type="text"
                    value={newVoucher.reference}
                    onChange={(e) => setNewVoucher({...newVoucher, reference: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="رقم الشيك أو التحويل"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">البيان</label>
                  <textarea
                    value={newVoucher.description}
                    onChange={(e) => setNewVoucher({...newVoucher, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="تفاصيل سند القبض"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={handleAddVoucher} className="bg-green-600 hover:bg-green-700">
                  حفظ السند
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Users className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في سندات القبض..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سندات قبض العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-right p-3 font-medium">رقم السند</th>
                    <th className="text-right p-3 font-medium">العميل</th>
                    <th className="text-right p-3 font-medium">المبلغ</th>
                    <th className="text-right p-3 font-medium">التاريخ</th>
                    <th className="text-right p-3 font-medium">البيان</th>
                    <th className="text-right p-3 font-medium">طريقة الدفع</th>
                    <th className="text-right p-3 font-medium">الحالة</th>
                    <th className="text-right p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVouchers.map((voucher) => (
                    <tr key={voucher.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-blue-600">{voucher.voucherNumber}</td>
                      <td className="p-3">{voucher.clientName}</td>
                      <td className="p-3 font-medium text-green-600">{voucher.amount.toLocaleString()} ر.س</td>
                      <td className="p-3">{new Date(voucher.date).toLocaleDateString('en-GB')}</td>
                      <td className="p-3">{voucher.description}</td>
                      <td className="p-3">
                        <Badge variant="outline">{voucher.paymentMethod}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-green-500">{voucher.status}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <div className="h-screen bg-gray-100 flex w-full overflow-hidden" dir="rtl" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
      {/* Sidebar */}
      <div className={cn(
        "bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white transition-all duration-300 flex flex-col shadow-2xl",
        sidebarCollapsed ? "w-16" : "w-80"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">{branch.name}</h1>
                <p className="text-blue-200 text-sm">رمز الفرع: {branch.code}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-white hover:bg-white/10 p-2"
            >
              {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Back to Main System */}
        <div className="p-4 border-b border-white/20">
          <Link href="/branches">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 gap-3 mb-3"
            >
              <ArrowLeft className="h-5 w-5" />
              {!sidebarCollapsed && <span>العودة للنظام الرئيسي</span>}
            </Button>
          </Link>
          

        </div>

        {/* Navigation */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map(item => renderNavItem(item))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">لوحة تحكم الفرع</h2>
              <p className="text-gray-600">إدارة شاملة لعمليات {branch.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={branch.isActive ? "default" : "secondary"} className="px-3 py-1">
                {branch.isActive ? "نشط" : "غير نشط"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content with Routing */}
        <div className="flex-1 overflow-y-auto">
          <Switch>
            {/* Dashboard الاحترافية الجديدة */}
            <Route path={`/branch/${branchId}`}>
              <ProfessionalBranchDashboard branchId={branchId ? parseInt(branchId) : undefined} />
            </Route>

            {/* صفحة الموردين الاحترافية */}
            <Route path={`/branch/${branchId}/suppliers`}>
              <BranchSuppliersPage branchId={branchId || ''} />
            </Route>
            
            {/* صفحة العملاء الاحترافية */}
            <Route path={`/branch/${branchId}/clients`}>
              <BranchClientsPage branchId={branchId || ''} />
            </Route>

            {/* صفحة سندات صرف الموردين */}
            <Route path={`/branch/${branchId}/supplier-vouchers`}>
              <SupplierVouchersPage branchId={branchId || ''} />
            </Route>

            {/* صفحة سندات قبض العملاء */}
            <Route path={`/branch/${branchId}/client-vouchers`}>
              <ClientVouchersPage branchId={branchId || ''} />
            </Route>

            {/* صفحات نقاط المبيعات */}
            <Route path={`/branch/${branchId}/pos`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">نقطة البيع</h1>
                    <p className="text-gray-600 mt-2">واجهة نقطة البيع المتكاملة</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center py-12">
                      <CreditCard className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">نقطة البيع</h3>
                      <p className="text-gray-600 mb-6">ابدأ عملية البيع وإدارة المعاملات</p>
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <CreditCard className="ml-2 h-5 w-5" />
                        فتح نقطة البيع
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/pos-terminals`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">إدارة المحطات</h1>
                      <p className="text-gray-600 mt-2">إدارة وتكوين محطات نقاط البيع</p>
                    </div>
                    <Button 
                      onClick={() => window.location.href = `/pos-share-link?branchId=${branchId}&branchName=${encodeURIComponent('فرع رقم ' + branchId)}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      <Share2 className="h-5 w-5 ml-2" />
                      مشاركة رابط نقاط البيع
                    </Button>
                  </div>
                  
                  {/* إحصائيات سريعة */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Monitor className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">إجمالي المحطات</p>
                            <p className="text-2xl font-bold text-gray-900">3</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Wifi className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">المحطات المتصلة</p>
                            <p className="text-2xl font-bold text-green-600">2</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <WifiOff className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">المحطات المنقطعة</p>
                            <p className="text-2xl font-bold text-orange-600">1</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <PowerOff className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">المحطات المعطلة</p>
                            <p className="text-2xl font-bold text-red-600">0</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* شريط الأدوات */}
                  <Card className="shadow-lg border-0 mb-6">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Monitor className="h-5 w-5 ml-2" />
                          قائمة المحطات
                        </CardTitle>
                        <Button 
                          className="bg-white text-blue-600 hover:bg-blue-50"
                          onClick={handleAddTerminal}
                        >
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة محطة جديدة
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="البحث في المحطات..."
                          className="pr-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          value={searchTerminal}
                          onChange={(e) => setSearchTerminal(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* قائمة المحطات */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {terminals
                      .filter(terminal => 
                        terminal.name.toLowerCase().includes(searchTerminal.toLowerCase()) ||
                        terminal.code.toLowerCase().includes(searchTerminal.toLowerCase()) ||
                        terminal.location.toLowerCase().includes(searchTerminal.toLowerCase()) ||
                        terminal.employee.toLowerCase().includes(searchTerminal.toLowerCase())
                      )
                      .map((terminal) => (
                      <Card key={terminal.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${
                                terminal.isOnline ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <CardTitle className="text-lg">{terminal.name}</CardTitle>
                            </div>
                            <Badge 
                              variant={terminal.isActive ? 'default' : 'secondary'}
                              className={terminal.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                            >
                              {terminal.isActive ? 'نشط' : 'معطل'}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">الكود</p>
                              <p className="text-sm text-gray-900">{terminal.code}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">الموقع</p>
                              <p className="text-sm text-gray-900 flex items-center">
                                <MapPin className="h-3 w-3 ml-1" />
                                {terminal.location}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">عنوان IP</p>
                              <p className="text-sm text-gray-900 font-mono">{terminal.ipAddress}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">الحالة</p>
                              <div className="flex items-center">
                                {terminal.isOnline ? (
                                  <Wifi className="h-4 w-4 text-green-600 ml-1" />
                                ) : (
                                  <WifiOff className="h-4 w-4 text-red-600 ml-1" />
                                )}
                                <span className={`text-sm ${terminal.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                  {terminal.isOnline ? 'متصل' : 'منقطع'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-600">آخر نشاط</p>
                            <p className="text-sm text-gray-900 flex items-center">
                              <Clock className="h-3 w-3 ml-1" />
                              {terminal.lastActivity}
                            </p>
                          </div>

                          <div className="space-y-3 pt-4 border-t">
                            {/* أزرار الوصول للنقطة */}
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  const shareUrl = `${window.location.origin}/pos/share/${branchId}/${terminal.id}`;
                                  navigator.clipboard.writeText(shareUrl);
                                  alert('تم نسخ رابط المشاركة');
                                }}
                              >
                                <Share2 className="h-3 w-3 ml-1" />
                                رابط المشاركة
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  window.open(`/pos/pro/${branchId}/${terminal.id}`, '_blank');
                                }}
                              >
                                <Monitor className="h-3 w-3 ml-1" />
                                دخول للنقطة
                              </Button>
                            </div>
                            
                            {/* أزرار الإدارة */}
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleEditTerminal(terminal)}
                              >
                                <Edit className="h-3 w-3 ml-1" />
                                تعديل
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!terminal.isOnline}
                                className="w-full"
                                onClick={() => handleRestartTerminal(terminal.id)}
                              >
                                <RefreshCw className="h-3 w-3 ml-1" />
                                إعادة تشغيل
                              </Button>
                            </div>
                            
                            {/* زر الحذف منفصل */}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => handleDeleteTerminal(terminal.id)}
                            >
                              <Trash2 className="h-3 w-3 ml-1" />
                              حذف المحطة
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/pos-sales`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">مبيعات نقاط البيع</h1>
                    <p className="text-gray-600 mt-2">عرض وتتبع جميع مبيعات نقاط البيع</p>
                  </div>
                  
                  {/* إحصائيات مبيعات اليوم */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">مبيعات اليوم</p>
                            <p className="text-2xl font-bold text-gray-900">1,245 ر.س</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">عدد المعاملات</p>
                            <p className="text-2xl font-bold text-gray-900">23</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">متوسط المعاملة</p>
                            <p className="text-2xl font-bold text-gray-900">54 ر.س</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">المنتجات المباعة</p>
                            <p className="text-2xl font-bold text-gray-900">67</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* فلاتر البحث */}
                  <Card className="shadow-lg border-0 mb-6">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                      <CardTitle className="flex items-center">
                        <Filter className="h-5 w-5 ml-2" />
                        فلاتر البحث والتصفية
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="relative">
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="رقم الفاتورة..."
                            className="pr-10"
                          />
                        </div>
                        
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="المحطة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع المحطات</SelectItem>
                            <SelectItem value="MAIN-001">المحطة الرئيسية</SelectItem>
                            <SelectItem value="SEC-001">المحطة الثانوية</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="طريقة الدفع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الطرق</SelectItem>
                            <SelectItem value="cash">نقدي</SelectItem>
                            <SelectItem value="card">بطاقة</SelectItem>
                            <SelectItem value="transfer">تحويل</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input type="date" className="text-right" />
                        
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Search className="h-4 w-4 ml-2" />
                          بحث
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* جدول المبيعات */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Receipt className="h-5 w-5 ml-2" />
                          قائمة المبيعات
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 ml-2" />
                            تصدير
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 ml-2" />
                            تحديث
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr className="text-right">
                              <th className="p-4 text-sm font-semibold text-gray-900">رقم الفاتورة</th>
                              <th className="p-4 text-sm font-semibold text-gray-900">التاريخ والوقت</th>
                              <th className="p-4 text-sm font-semibold text-gray-900">المحطة</th>
                              <th className="p-4 text-sm font-semibold text-gray-900">العميل</th>
                              <th className="p-4 text-sm font-semibold text-gray-900">المبلغ الإجمالي</th>
                              <th className="p-4 text-sm font-semibold text-gray-900">طريقة الدفع</th>
                              <th className="p-4 text-sm font-semibold text-gray-900">الحالة</th>
                              <th className="p-4 text-sm font-semibold text-gray-900">العمليات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {[
                              {
                                id: "INV-2025-001",
                                date: "2025-06-18",
                                time: "14:30",
                                terminal: "MAIN-001",
                                customer: "فاطمة الحزمي",
                                total: "125.50",
                                paymentMethod: "بطاقة",
                                status: "مكتملة"
                              },
                              {
                                id: "INV-2025-002",
                                date: "2025-06-18",
                                time: "14:15",
                                terminal: "SEC-001",
                                customer: "أحمد محمد",
                                total: "89.75",
                                paymentMethod: "نقدي",
                                status: "مكتملة"
                              },
                              {
                                id: "INV-2025-003",
                                date: "2025-06-18",
                                time: "13:45",
                                terminal: "MAIN-001",
                                customer: "سارة علي",
                                total: "234.00",
                                paymentMethod: "تحويل",
                                status: "ملغية"
                              },
                              {
                                id: "INV-2025-004",
                                date: "2025-06-18",
                                time: "13:20",
                                terminal: "MAIN-001",
                                customer: "محمد الخالد",
                                total: "67.25",
                                paymentMethod: "بطاقة",
                                status: "مكتملة"
                              }
                            ].map((sale, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                  <div className="font-medium text-blue-600">{sale.id}</div>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm text-gray-900">{sale.date}</div>
                                  <div className="text-xs text-gray-500">{sale.time}</div>
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {sale.terminal}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm text-gray-900">{sale.customer}</div>
                                </td>
                                <td className="p-4">
                                  <div className="text-lg font-semibold text-gray-900">{sale.total} ر.س</div>
                                </td>
                                <td className="p-4">
                                  <Badge 
                                    variant="outline"
                                    className={
                                      sale.paymentMethod === 'نقدي' ? 'bg-green-50 text-green-700 border-green-200' :
                                      sale.paymentMethod === 'بطاقة' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                      'bg-orange-50 text-orange-700 border-orange-200'
                                    }
                                  >
                                    {sale.paymentMethod}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <Badge 
                                    variant={sale.status === 'مكتملة' ? 'default' : 'destructive'}
                                    className={
                                      sale.status === 'مكتملة' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }
                                  >
                                    {sale.status}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex space-x-2 space-x-reverse">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Printer className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* ترقيم الصفحات */}
                      <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="text-sm text-gray-500">
                          عرض 1-4 من 23 معاملة
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          <Button variant="outline" size="sm" disabled>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                            1
                          </Button>
                          <Button variant="outline" size="sm">
                            2
                          </Button>
                          <Button variant="outline" size="sm">
                            3
                          </Button>
                          <Button variant="outline" size="sm">
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Route>














            {/* صفحة فئات الأصناف */}
            <Route path={`/branch/${branchId}/product-categories`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">فئات الأصناف</h1>
                    <p className="text-gray-600 mt-2">إدارة وتنظيم فئات الأصناف في الفرع</p>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة فئة جديدة
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input placeholder="البحث في الفئات..." className="w-64" />
                      <Button variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="h-6 w-6 text-blue-600" />
                            <CardTitle>المواد الغذائية</CardTitle>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>عدد الأصناف:</span>
                            <span className="font-semibold">45</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>قيمة المخزون:</span>
                            <span className="font-semibold">25,400 ر.س</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>الفئات الفرعية:</span>
                            <span className="font-semibold">8</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="h-6 w-6 text-green-600" />
                            <CardTitle>الأجهزة الإلكترونية</CardTitle>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>عدد الأصناف:</span>
                            <span className="font-semibold">23</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>قيمة المخزون:</span>
                            <span className="font-semibold">156,800 ر.س</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>الفئات الفرعية:</span>
                            <span className="font-semibold">5</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="h-6 w-6 text-purple-600" />
                            <CardTitle>الملابس والأزياء</CardTitle>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>عدد الأصناف:</span>
                            <span className="font-semibold">67</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>قيمة المخزون:</span>
                            <span className="font-semibold">89,200 ر.س</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>الفئات الفرعية:</span>
                            <span className="font-semibold">12</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="h-6 w-6 text-orange-600" />
                            <CardTitle>أدوات المنزل</CardTitle>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>عدد الأصناف:</span>
                            <span className="font-semibold">34</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>قيمة المخزون:</span>
                            <span className="font-semibold">45,600 ر.س</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>الفئات الفرعية:</span>
                            <span className="font-semibold">6</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="h-6 w-6 text-red-600" />
                            <CardTitle>مستلزمات السيارات</CardTitle>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>عدد الأصناف:</span>
                            <span className="font-semibold">28</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>قيمة المخزون:</span>
                            <span className="font-semibold">78,900 ر.س</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>الفئات الفرعية:</span>
                            <span className="font-semibold">4</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="h-6 w-6 text-pink-600" />
                            <CardTitle>مستحضرات التجميل</CardTitle>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>عدد الأصناف:</span>
                            <span className="font-semibold">52</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>قيمة المخزون:</span>
                            <span className="font-semibold">67,300 ر.س</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>الفئات الفرعية:</span>
                            <span className="font-semibold">9</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </Route>





            <Route path={`/branch/${branchId}/barcodes`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">باركود الأصناف</h1>
                    <p className="text-gray-600 mt-2">إدارة وطباعة باركود الأصناف</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>إنشاء باركود جديد</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">اختر الصنف</label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر صنف" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="p001">ابو طرحة</SelectItem>
                                <SelectItem value="p002">جهاز كمبيوتر محمول</SelectItem>
                                <SelectItem value="p003">قميص قطني رجالي</SelectItem>
                                <SelectItem value="p004">كرسي مكتب دوار</SelectItem>
                                <SelectItem value="p005">إطارات سيارة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">نوع الباركود</label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="نوع الباركود" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="code128">Code 128</SelectItem>
                                <SelectItem value="ean13">EAN-13</SelectItem>
                                <SelectItem value="qr">QR Code</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">حجم الطباعة</label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="حجم الطباعة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">صغير (3x2 سم)</SelectItem>
                                <SelectItem value="medium">متوسط (5x3 سم)</SelectItem>
                                <SelectItem value="large">كبير (7x4 سم)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">عدد النسخ</label>
                            <Input type="number" defaultValue="1" min="1" max="100" />
                          </div>
                          <div className="flex space-x-2">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <ScanBarcode className="ml-2 h-4 w-4" />
                              إنشاء باركود
                            </Button>
                            <Button variant="outline">
                              <Printer className="ml-2 h-4 w-4" />
                              طباعة
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>معاينة الباركود</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                          <ScanBarcode className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">معاينة الباركود</h3>
                          <p className="text-gray-600">اختر صنف لإنشاء الباركود</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>باركود الأصناف المحفوظة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="border rounded-lg p-4 text-center">
                          <div className="mb-2">
                            <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center">
                              <ScanBarcode className="h-8 w-8 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-sm font-medium">ابو طرحة</p>
                          <p className="text-xs text-gray-500">P001</p>
                          <Button size="sm" variant="outline" className="mt-2">
                            <Printer className="h-3 w-3 ml-1" />
                            طباعة
                          </Button>
                        </div>
                        <div className="border rounded-lg p-4 text-center">
                          <div className="mb-2">
                            <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center">
                              <ScanBarcode className="h-8 w-8 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-sm font-medium">جهاز كمبيوتر محمول</p>
                          <p className="text-xs text-gray-500">P002</p>
                          <Button size="sm" variant="outline" className="mt-2">
                            <Printer className="h-3 w-3 ml-1" />
                            طباعة
                          </Button>
                        </div>
                        <div className="border rounded-lg p-4 text-center">
                          <div className="mb-2">
                            <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center">
                              <ScanBarcode className="h-8 w-8 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-sm font-medium">قميص قطني رجالي</p>
                          <p className="text-xs text-gray-500">P003</p>
                          <Button size="sm" variant="outline" className="mt-2">
                            <Printer className="h-3 w-3 ml-1" />
                            طباعة
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/categories`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">تصنيفات الأصناف</h1>
                    <p className="text-gray-600 mt-2">إدارة التصنيفات الهرمية للأصناف</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>شجرة التصنيفات</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <ChevronDown className="h-4 w-4" />
                              <FolderOpen className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">المواد الغذائية</span>
                            </div>
                            <div className="ml-6 space-y-1">
                              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <ChevronRight className="h-4 w-4" />
                                <Folder className="h-4 w-4 text-green-600" />
                                <span>مشروبات</span>
                              </div>
                              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <ChevronRight className="h-4 w-4" />
                                <Folder className="h-4 w-4 text-green-600" />
                                <span>حلويات</span>
                              </div>
                              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <ChevronRight className="h-4 w-4" />
                                <Folder className="h-4 w-4 text-green-600" />
                                <span>معلبات</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <ChevronRight className="h-4 w-4" />
                              <Folder className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">الأجهزة الإلكترونية</span>
                            </div>
                            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <ChevronRight className="h-4 w-4" />
                              <Folder className="h-4 w-4 text-orange-600" />
                              <span className="font-medium">الملابس والأزياء</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>تفاصيل التصنيف: المواد الغذائية</CardTitle>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Plus className="h-4 w-4 ml-1" />
                                إضافة تصنيف فرعي
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 ml-1" />
                                تعديل
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">اسم التصنيف</label>
                                <Input value="المواد الغذائية" readOnly />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">كود التصنيف</label>
                                <Input value="FOOD001" readOnly />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">التصنيف الأساسي</label>
                                <Input value="بدون" readOnly />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">حالة التصنيف</label>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">نشط</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">الوصف</label>
                              <textarea className="w-full p-2 border rounded-md" rows={3} readOnly>
جميع أنواع المواد الغذائية والمشروبات والحلويات والمعلبات
                              </textarea>
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">التصنيفات الفرعية</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Folder className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium">مشروبات</span>
                                    </div>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">15 صنف</span>
                                  </div>
                                </div>
                                <div className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Folder className="h-4 w-4 text-green-600" />
                                      <span className="font-medium">حلويات</span>
                                    </div>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">23 صنف</span>
                                  </div>
                                </div>
                                <div className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Folder className="h-4 w-4 text-purple-600" />
                                      <span className="font-medium">معلبات</span>
                                    </div>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">7 أصناف</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </Route>

            {/* صفحات المشتريات */}
            <Route path={`/branch/${branchId}/purchases`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">فواتير المشتريات</h1>
                    <p className="text-gray-600 mt-2">إدارة جميع فواتير المشتريات في الفرع</p>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة فاتورة جديدة
                      </Button>
                      <Button variant="outline">
                        <Upload className="ml-2 h-4 w-4" />
                        استيراد فواتير
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="المورد" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الموردين</SelectItem>
                          <SelectItem value="supplier1">مورد أ</SelectItem>
                          <SelectItem value="supplier2">مورد ب</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="البحث في الفواتير..." className="w-64" />
                      <Button variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>قائمة فواتير المشتريات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-3">رقم الفاتورة</th>
                              <th className="text-right p-3">المورد</th>
                              <th className="text-right p-3">التاريخ</th>
                              <th className="text-right p-3">المبلغ الإجمالي</th>
                              <th className="text-right p-3">حالة الدفع</th>
                              <th className="text-right p-3">المبلغ المدفوع</th>
                              <th className="text-right p-3">المتبقي</th>
                              <th className="text-right p-3">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">PUR-001</td>
                              <td className="p-3">شركة التوريد الذهبي</td>
                              <td className="p-3">2025-06-17</td>
                              <td className="p-3">15,000.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مدفوع بالكامل</span>
                              </td>
                              <td className="p-3">15,000.00 ر.س</td>
                              <td className="p-3">0.00 ر.س</td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">PUR-002</td>
                              <td className="p-3">مؤسسة الخير للتجارة</td>
                              <td className="p-3">2025-06-16</td>
                              <td className="p-3">8,500.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">مدفوع جزئي</span>
                              </td>
                              <td className="p-3">5,000.00 ر.س</td>
                              <td className="p-3">3,500.00 ر.س</td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">PUR-003</td>
                              <td className="p-3">شركة النجم الساطع</td>
                              <td className="p-3">2025-06-15</td>
                              <td className="p-3">12,750.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">غير مدفوع</span>
                              </td>
                              <td className="p-3">0.00 ر.س</td>
                              <td className="p-3">12,750.00 ر.س</td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/goods-receipt`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">سند إدخال بضاعة</h1>
                    <p className="text-gray-600 mt-2">إنشاء سند إدخال بضاعة جديد للمخزن</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>بيانات السند</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium mb-2">رقم السند</label>
                              <Input value="GR-2025-001" readOnly />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">التاريخ</label>
                              <Input type="date" defaultValue="2025-06-17" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">المورد</label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المورد" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="supplier1">شركة التوريد الذهبي</SelectItem>
                                  <SelectItem value="supplier2">مؤسسة الخير للتجارة</SelectItem>
                                  <SelectItem value="supplier3">شركة النجم الساطع</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">نوع الإدخال</label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="نوع الإدخال" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="purchase">شراء</SelectItem>
                                  <SelectItem value="transfer">نقل من فرع آخر</SelectItem>
                                  <SelectItem value="return">إرجاع من عميل</SelectItem>
                                  <SelectItem value="adjustment">تسوية مخزون</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">الأصناف</h3>
                              <Button size="sm">
                                <Plus className="h-4 w-4 ml-1" />
                                إضافة صنف
                              </Button>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-right p-3">الصنف</th>
                                    <th className="text-right p-3">الكمية</th>
                                    <th className="text-right p-3">الوحدة</th>
                                    <th className="text-right p-3">سعر الوحدة</th>
                                    <th className="text-right p-3">الإجمالي</th>
                                    <th className="text-right p-3">إجراءات</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b">
                                    <td className="p-3">
                                      <Select>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="اختر الصنف" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="item1">ابو طرحة</SelectItem>
                                          <SelectItem value="item2">جهاز كمبيوتر محمول</SelectItem>
                                          <SelectItem value="item3">قميص قطني رجالي</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className="p-3">
                                      <Input type="number" placeholder="الكمية" />
                                    </td>
                                    <td className="p-3">
                                      <Input value="قطعة" readOnly />
                                    </td>
                                    <td className="p-3">
                                      <Input type="number" placeholder="السعر" />
                                    </td>
                                    <td className="p-3">
                                      <span className="font-medium">0.00 ر.س</span>
                                    </td>
                                    <td className="p-3">
                                      <Button size="sm" variant="outline" className="text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">ملاحظات</label>
                              <textarea 
                                className="w-full p-2 border rounded-md" 
                                rows={3} 
                                placeholder="أدخل أي ملاحظات حول سند الإدخال..."
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>ملخص السند</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>عدد الأصناف:</span>
                              <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                              <span>إجمالي الكمية:</span>
                              <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                              <span>المبلغ الفرعي:</span>
                              <span className="font-semibold">0.00 ر.س</span>
                            </div>
                            <div className="flex justify-between">
                              <span>الضريبة (15%):</span>
                              <span className="font-semibold">0.00 ر.س</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between text-lg font-bold">
                                <span>الإجمالي النهائي:</span>
                                <span>0.00 ر.س</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 space-y-2">
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                              <Package className="ml-2 h-4 w-4" />
                              حفظ السند
                            </Button>
                            <Button variant="outline" className="w-full">
                              <Printer className="ml-2 h-4 w-4" />
                              طباعة
                            </Button>
                            <Button variant="outline" className="w-full">
                              مسح النموذج
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/goods-receipt-list`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">قائمة سندات إدخال البضاعة</h1>
                    <p className="text-gray-600 mt-2">عرض وإدارة جميع سندات إدخال البضاعة في الفرع</p>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="ml-2 h-4 w-4" />
                        سند إدخال جديد
                      </Button>
                      <Button variant="outline">
                        <Upload className="ml-2 h-4 w-4" />
                        استيراد سندات
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="نوع الإدخال" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الأنواع</SelectItem>
                          <SelectItem value="purchase">شراء</SelectItem>
                          <SelectItem value="transfer">نقل</SelectItem>
                          <SelectItem value="return">إرجاع</SelectItem>
                          <SelectItem value="adjustment">تسوية</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="البحث في السندات..." className="w-64" />
                      <Button variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>قائمة سندات الإدخال</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-3">رقم السند</th>
                              <th className="text-right p-3">التاريخ</th>
                              <th className="text-right p-3">نوع الإدخال</th>
                              <th className="text-right p-3">المورد</th>
                              <th className="text-right p-3">عدد الأصناف</th>
                              <th className="text-right p-3">إجمالي الكمية</th>
                              <th className="text-right p-3">القيمة الإجمالية</th>
                              <th className="text-right p-3">الحالة</th>
                              <th className="text-right p-3">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">GR-2025-001</td>
                              <td className="p-3">2025-06-17</td>
                              <td className="p-3">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">شراء</span>
                              </td>
                              <td className="p-3">شركة التوريد الذهبي</td>
                              <td className="p-3">5</td>
                              <td className="p-3">150</td>
                              <td className="p-3">15,000.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مؤكد</span>
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">GR-2025-002</td>
                              <td className="p-3">2025-06-16</td>
                              <td className="p-3">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">نقل</span>
                              </td>
                              <td className="p-3">فرع الرياض</td>
                              <td className="p-3">3</td>
                              <td className="p-3">75</td>
                              <td className="p-3">8,500.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">قيد المراجعة</span>
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">GR-2025-003</td>
                              <td className="p-3">2025-06-15</td>
                              <td className="p-3">
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">إرجاع</span>
                              </td>
                              <td className="p-3">عميل محمد أحمد</td>
                              <td className="p-3">2</td>
                              <td className="p-3">10</td>
                              <td className="p-3">1,200.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مؤكد</span>
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/purchase-returns`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">مرتجعات المشتريات</h1>
                    <p className="text-gray-600 mt-2">إدارة مرتجعات المشتريات للموردين</p>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة مرتجع جديد
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="المورد" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الموردين</SelectItem>
                          <SelectItem value="supplier1">مورد أ</SelectItem>
                          <SelectItem value="supplier2">مورد ب</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="البحث في المرتجعات..." className="w-64" />
                      <Button variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>قائمة مرتجعات المشتريات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-3">رقم المرتجع</th>
                              <th className="text-right p-3">المورد</th>
                              <th className="text-right p-3">التاريخ</th>
                              <th className="text-right p-3">سبب الإرجاع</th>
                              <th className="text-right p-3">قيمة المرتجع</th>
                              <th className="text-right p-3">الحالة</th>
                              <th className="text-right p-3">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">RET-001</td>
                              <td className="p-3">شركة التوريد الذهبي</td>
                              <td className="p-3">2025-06-17</td>
                              <td className="p-3">بضاعة معيبة</td>
                              <td className="p-3">2,500.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">قيد المراجعة</span>
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Route>

            {/* صفحات المبيعات */}
            <Route path={`/branch/${branchId}/sales`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">فواتير المبيعات</h1>
                    <p className="text-gray-600 mt-2">إدارة جميع فواتير المبيعات في الفرع</p>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="ml-2 h-4 w-4" />
                        فاتورة مبيعات جديدة
                      </Button>
                      <Button variant="outline">
                        <Upload className="ml-2 h-4 w-4" />
                        استيراد فواتير
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="العميل" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع العملاء</SelectItem>
                          <SelectItem value="client1">عميل أ</SelectItem>
                          <SelectItem value="client2">عميل ب</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="البحث في الفواتير..." className="w-64" />
                      <Button variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>قائمة فواتير المبيعات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-3">رقم الفاتورة</th>
                              <th className="text-right p-3">العميل</th>
                              <th className="text-right p-3">التاريخ</th>
                              <th className="text-right p-3">المبلغ الإجمالي</th>
                              <th className="text-right p-3">حالة الدفع</th>
                              <th className="text-right p-3">المبلغ المدفوع</th>
                              <th className="text-right p-3">المتبقي</th>
                              <th className="text-right p-3">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">SAL-001</td>
                              <td className="p-3">محمد أحمد</td>
                              <td className="p-3">2025-06-17</td>
                              <td className="p-3">1,200.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مدفوع بالكامل</span>
                              </td>
                              <td className="p-3">1,200.00 ر.س</td>
                              <td className="p-3">0.00 ر.س</td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">SAL-002</td>
                              <td className="p-3">فاطمة الحزمي</td>
                              <td className="p-3">2025-06-16</td>
                              <td className="p-3">850.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">مدفوع جزئي</span>
                              </td>
                              <td className="p-3">500.00 ر.س</td>
                              <td className="p-3">350.00 ر.س</td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/goods-issue`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">سند صرف بضاعة</h1>
                    <p className="text-gray-600 mt-2">إنشاء سند صرف بضاعة جديد من المخزن</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>بيانات السند</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium mb-2">رقم السند</label>
                              <Input value="GI-2025-001" readOnly />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">التاريخ</label>
                              <Input type="date" defaultValue="2025-06-17" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">العميل/الجهة</label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر العميل" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="client1">محمد أحمد</SelectItem>
                                  <SelectItem value="client2">فاطمة الحزمي</SelectItem>
                                  <SelectItem value="client3">شركة النور</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">نوع الصرف</label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="نوع الصرف" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sale">بيع</SelectItem>
                                  <SelectItem value="transfer">نقل لفرع آخر</SelectItem>
                                  <SelectItem value="damage">تلف</SelectItem>
                                  <SelectItem value="sample">عينة</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">الأصناف</h3>
                              <Button size="sm">
                                <Plus className="h-4 w-4 ml-1" />
                                إضافة صنف
                              </Button>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-right p-3">الصنف</th>
                                    <th className="text-right p-3">الكمية المتاحة</th>
                                    <th className="text-right p-3">الكمية المطلوبة</th>
                                    <th className="text-right p-3">الوحدة</th>
                                    <th className="text-right p-3">سعر الوحدة</th>
                                    <th className="text-right p-3">الإجمالي</th>
                                    <th className="text-right p-3">إجراءات</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b">
                                    <td className="p-3">
                                      <Select>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="اختر الصنف" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="item1">ابو طرحة</SelectItem>
                                          <SelectItem value="item2">جهاز كمبيوتر محمول</SelectItem>
                                          <SelectItem value="item3">قميص قطني رجالي</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-medium">150</span>
                                    </td>
                                    <td className="p-3">
                                      <Input type="number" placeholder="الكمية" />
                                    </td>
                                    <td className="p-3">
                                      <Input value="قطعة" readOnly />
                                    </td>
                                    <td className="p-3">
                                      <Input type="number" placeholder="السعر" />
                                    </td>
                                    <td className="p-3">
                                      <span className="font-medium">0.00 ر.س</span>
                                    </td>
                                    <td className="p-3">
                                      <Button size="sm" variant="outline" className="text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">ملاحظات</label>
                              <textarea 
                                className="w-full p-2 border rounded-md" 
                                rows={3} 
                                placeholder="أدخل أي ملاحظات حول سند الصرف..."
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>ملخص السند</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>عدد الأصناف:</span>
                              <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                              <span>إجمالي الكمية:</span>
                              <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                              <span>المبلغ الفرعي:</span>
                              <span className="font-semibold">0.00 ر.س</span>
                            </div>
                            <div className="flex justify-between">
                              <span>الضريبة (15%):</span>
                              <span className="font-semibold">0.00 ر.س</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between text-lg font-bold">
                                <span>الإجمالي النهائي:</span>
                                <span>0.00 ر.س</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 space-y-2">
                            <Button className="w-full bg-red-600 hover:bg-red-700">
                              <Package className="ml-2 h-4 w-4" />
                              حفظ السند
                            </Button>
                            <Button variant="outline" className="w-full">
                              <Printer className="ml-2 h-4 w-4" />
                              طباعة
                            </Button>
                            <Button variant="outline" className="w-full">
                              مسح النموذج
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </Route>

            {/* صفحات إدارة المخزون */}
            <Route path={`/branch/${branchId}/inventory`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">حالة المخزون</h1>
                    <p className="text-gray-600 mt-2">عرض الوضع الحالي لجميع الأصناف في المخزن</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">إجمالي الأصناف</p>
                            <p className="text-2xl font-bold text-gray-900">247</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">قيمة المخزون</p>
                            <p className="text-2xl font-bold text-gray-900">456,780 ر.س</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Activity className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">أصناف منخفضة</p>
                            <p className="text-2xl font-bold text-gray-900">12</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <X className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">أصناف نافدة</p>
                            <p className="text-2xl font-bold text-gray-900">5</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>حالة المخزون التفصيلية</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Select>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="الفئة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">جميع الفئات</SelectItem>
                              <SelectItem value="low">منخفض</SelectItem>
                              <SelectItem value="empty">نافد</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input placeholder="البحث..." className="w-64" />
                          <Button variant="outline">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-3">كود الصنف</th>
                              <th className="text-right p-3">اسم الصنف</th>
                              <th className="text-right p-3">الفئة</th>
                              <th className="text-right p-3">الكمية الحالية</th>
                              <th className="text-right p-3">الحد الأدنى</th>
                              <th className="text-right p-3">سعر التكلفة</th>
                              <th className="text-right p-3">قيمة المخزون</th>
                              <th className="text-right p-3">الحالة</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">P001</td>
                              <td className="p-3">ابو طرحة</td>
                              <td className="p-3">المواد الغذائية</td>
                              <td className="p-3">150</td>
                              <td className="p-3">20</td>
                              <td className="p-3">8.50 ر.س</td>
                              <td className="p-3">1,275.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">متوفر</span>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">P003</td>
                              <td className="p-3">قميص قطني رجالي</td>
                              <td className="p-3">الملابس والأزياء</td>
                              <td className="p-3">2</td>
                              <td className="p-3">10</td>
                              <td className="p-3">45.00 ر.س</td>
                              <td className="p-3">90.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">منخفض</span>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">P006</td>
                              <td className="p-3">جهاز تليفون ذكي</td>
                              <td className="p-3">الأجهزة الإلكترونية</td>
                              <td className="p-3">0</td>
                              <td className="p-3">5</td>
                              <td className="p-3">1,200.00 ر.س</td>
                              <td className="p-3">0.00 ر.س</td>
                              <td className="p-3">
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">نافد</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/inventory-alerts`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">تنبيهات المخزون</h1>
                    <p className="text-gray-600 mt-2">متابعة التنبيهات والإشعارات المتعلقة بالمخزون</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="border-red-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-red-700">أصناف نافدة</CardTitle>
                          <div className="p-2 bg-red-100 rounded-lg">
                            <X className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-red-700 mb-2">5</div>
                        <p className="text-sm text-red-600">يتطلب إعادة تعبئة فورية</p>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-yellow-700">أصناف منخفضة</CardTitle>
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Activity className="h-5 w-5 text-yellow-600" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-yellow-700 mb-2">12</div>
                        <p className="text-sm text-yellow-600">أقل من الحد الأدنى</p>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-blue-700">أصناف قاربت على الانتهاء</CardTitle>
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-700 mb-2">8</div>
                        <p className="text-sm text-blue-600">بحاجة لمراقبة</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>قائمة التنبيهات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-red-800">صنف نافد من المخزون</h3>
                              <p className="text-sm text-red-700 mt-1">جهاز تليفون ذكي (P006) - الكمية: 0</p>
                              <p className="text-xs text-red-600 mt-2">منذ 3 ساعات</p>
                            </div>
                            <Button size="sm" variant="outline" className="text-red-600">
                              إجراء
                            </Button>
                          </div>
                        </div>

                        <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-yellow-800">كمية منخفضة</h3>
                              <p className="text-sm text-yellow-700 mt-1">قميص قطني رجالي (P003) - الكمية: 2 / الحد الأدنى: 10</p>
                              <p className="text-xs text-yellow-600 mt-2">منذ ساعة واحدة</p>
                            </div>
                            <Button size="sm" variant="outline" className="text-yellow-600">
                              إجراء
                            </Button>
                          </div>
                        </div>

                        <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-blue-800">يقترب من الحد الأدنى</h3>
                              <p className="text-sm text-blue-700 mt-1">كرسي مكتب دوار (P004) - الكمية: 12 / الحد الأدنى: 5</p>
                              <p className="text-xs text-blue-600 mt-2">منذ 6 ساعات</p>
                            </div>
                            <Button size="sm" variant="outline" className="text-blue-600">
                              مراقبة
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/inventory-count`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">جرد المخزون</h1>
                    <p className="text-gray-600 mt-2">إجراء جرد دوري للمخزون وتسوية الكميات</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>عملية الجرد الجديدة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium mb-2">رقم الجرد</label>
                              <Input value="INV-2025-001" readOnly />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">تاريخ الجرد</label>
                              <Input type="date" defaultValue="2025-06-17" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">نوع الجرد</label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="نوع الجرد" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="full">جرد شامل</SelectItem>
                                  <SelectItem value="partial">جرد جزئي</SelectItem>
                                  <SelectItem value="category">جرد حسب الفئة</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">المسؤول عن الجرد</label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المسؤول" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user1">أحمد محمد</SelectItem>
                                  <SelectItem value="user2">فاطمة الحزمي</SelectItem>
                                  <SelectItem value="user3">خالد السالم</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">أصناف الجرد</h3>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Upload className="h-4 w-4 ml-1" />
                                  استيراد
                                </Button>
                                <Button size="sm">
                                  <Plus className="h-4 w-4 ml-1" />
                                  إضافة صنف
                                </Button>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-right p-3">كود الصنف</th>
                                    <th className="text-right p-3">اسم الصنف</th>
                                    <th className="text-right p-3">الكمية في النظام</th>
                                    <th className="text-right p-3">الكمية الفعلية</th>
                                    <th className="text-right p-3">الفرق</th>
                                    <th className="text-right p-3">الحالة</th>
                                    <th className="text-right p-3">إجراءات</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b">
                                    <td className="p-3">P001</td>
                                    <td className="p-3">ابو طرحة</td>
                                    <td className="p-3">150</td>
                                    <td className="p-3">
                                      <Input type="number" placeholder="الكمية الفعلية" className="w-24" />
                                    </td>
                                    <td className="p-3">
                                      <span className="text-gray-500">-</span>
                                    </td>
                                    <td className="p-3">
                                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">قيد الجرد</span>
                                    </td>
                                    <td className="p-3">
                                      <Button size="sm" variant="outline">
                                        تأكيد
                                      </Button>
                                    </td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-3">P002</td>
                                    <td className="p-3">جهاز كمبيوتر محمول</td>
                                    <td className="p-3">45</td>
                                    <td className="p-3">
                                      <Input type="number" defaultValue="43" className="w-24" />
                                    </td>
                                    <td className="p-3">
                                      <span className="text-red-600 font-medium">-2</span>
                                    </td>
                                    <td className="p-3">
                                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">نقص</span>
                                    </td>
                                    <td className="p-3">
                                      <Button size="sm" variant="outline">
                                        تسوية
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>ملخص الجرد</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>إجمالي الأصناف:</span>
                              <span className="font-semibold">25</span>
                            </div>
                            <div className="flex justify-between">
                              <span>تم جردها:</span>
                              <span className="font-semibold text-green-600">12</span>
                            </div>
                            <div className="flex justify-between">
                              <span>قيد الجرد:</span>
                              <span className="font-semibold text-yellow-600">10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>بها فروقات:</span>
                              <span className="font-semibold text-red-600">3</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between">
                                <span>قيمة الفروقات:</span>
                                <span className="font-semibold text-red-600">-2,450.00 ر.س</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 space-y-2">
                            <Button className="w-full">
                              <Check className="ml-2 h-4 w-4" />
                              إنهاء الجرد
                            </Button>
                            <Button variant="outline" className="w-full">
                              <Printer className="ml-2 h-4 w-4" />
                              طباعة تقرير
                            </Button>
                            <Button variant="outline" className="w-full">
                              حفظ كمسودة
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle>عمليات الجرد السابقة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">INV-2025-001</p>
                                  <p className="text-sm text-gray-600">2025-06-10</p>
                                </div>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مكتمل</span>
                              </div>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">INV-2025-002</p>
                                  <p className="text-sm text-gray-600">2025-06-05</p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">قيد المراجعة</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/inventory-movement`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">حركة المخزون</h1>
                    <p className="text-gray-600 mt-2">تتبع جميع حركات الدخول والخروج للأصناف</p>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="نوع الحركة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الحركات</SelectItem>
                          <SelectItem value="in">دخول</SelectItem>
                          <SelectItem value="out">خروج</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="الفترة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">اليوم</SelectItem>
                          <SelectItem value="week">هذا الأسبوع</SelectItem>
                          <SelectItem value="month">هذا الشهر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input placeholder="البحث في الحركات..." className="w-64" />
                      <Button variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button variant="outline">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-3">التاريخ والوقت</th>
                              <th className="text-right p-3">نوع الحركة</th>
                              <th className="text-right p-3">رقم المرجع</th>
                              <th className="text-right p-3">الصنف</th>
                              <th className="text-right p-3">الكمية</th>
                              <th className="text-right p-3">الرصيد قبل</th>
                              <th className="text-right p-3">الرصيد بعد</th>
                              <th className="text-right p-3">المستخدم</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">2025-06-17 14:30</td>
                              <td className="p-3">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">دخول</span>
                              </td>
                              <td className="p-3">PUR-001</td>
                              <td className="p-3">ابو طرحة</td>
                              <td className="p-3 text-green-600">+50</td>
                              <td className="p-3">100</td>
                              <td className="p-3">150</td>
                              <td className="p-3">أحمد محمد</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">2025-06-17 13:15</td>
                              <td className="p-3">
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">خروج</span>
                              </td>
                              <td className="p-3">SAL-002</td>
                              <td className="p-3">جهاز كمبيوتر محمول</td>
                              <td className="p-3 text-red-600">-2</td>
                              <td className="p-3">47</td>
                              <td className="p-3">45</td>
                              <td className="p-3">فاطمة الحزمي</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">2025-06-17 11:45</td>
                              <td className="p-3">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">تسوية</span>
                              </td>
                              <td className="p-3">ADJ-001</td>
                              <td className="p-3">قميص قطني رجالي</td>
                              <td className="p-3 text-blue-600">-3</td>
                              <td className="p-3">5</td>
                              <td className="p-3">2</td>
                              <td className="p-3">خالد السالم</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="p-3">2025-06-16 16:20</td>
                              <td className="p-3">
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">نقل</span>
                              </td>
                              <td className="p-3">TRF-001</td>
                              <td className="p-3">كرسي مكتب دوار</td>
                              <td className="p-3 text-purple-600">-5</td>
                              <td className="p-3">17</td>
                              <td className="p-3">12</td>
                              <td className="p-3">أحمد محمد</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Route>

            <Route path={`/branch/${branchId}/inventory-transfer`}>
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">تحويل المخزون</h1>
                    <p className="text-gray-600 mt-2">نقل الأصناف بين الفروع المختلفة</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>سند تحويل جديد</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium mb-2">رقم سند التحويل</label>
                              <Input value="TRF-2025-001" readOnly />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">تاريخ التحويل</label>
                              <Input type="date" defaultValue="2025-06-17" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">الفرع المرسل</label>
                              <Input value="الفرع الرئيسي" readOnly />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">الفرع المستقبل</label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الفرع" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="branch2">فرع الرياض</SelectItem>
                                  <SelectItem value="branch3">فرع جدة</SelectItem>
                                  <SelectItem value="branch4">فرع الدمام</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">الأصناف المراد تحويلها</h3>
                              <Button size="sm">
                                <Plus className="h-4 w-4 ml-1" />
                                إضافة صنف
                              </Button>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-right p-3">الصنف</th>
                                    <th className="text-right p-3">الكمية المتاحة</th>
                                    <th className="text-right p-3">الكمية المحولة</th>
                                    <th className="text-right p-3">سعر التكلفة</th>
                                    <th className="text-right p-3">إجمالي التكلفة</th>
                                    <th className="text-right p-3">إجراءات</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b">
                                    <td className="p-3">
                                      <Select>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="اختر الصنف" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="item1">ابو طرحة</SelectItem>
                                          <SelectItem value="item2">جهاز كمبيوتر محمول</SelectItem>
                                          <SelectItem value="item3">قميص قطني رجالي</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-medium">150</span>
                                    </td>
                                    <td className="p-3">
                                      <Input type="number" placeholder="الكمية" className="w-20" />
                                    </td>
                                    <td className="p-3">
                                      <Input value="8.50" readOnly className="w-20" />
                                    </td>
                                    <td className="p-3">
                                      <span className="font-medium">0.00 ر.س</span>
                                    </td>
                                    <td className="p-3">
                                      <Button size="sm" variant="outline" className="text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">سبب التحويل</label>
                              <textarea 
                                className="w-full p-2 border rounded-md" 
                                rows={3} 
                                placeholder="أدخل سبب التحويل..."
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>ملخص التحويل</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>عدد الأصناف:</span>
                              <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                              <span>إجمالي الكمية:</span>
                              <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                              <span>إجمالي التكلفة:</span>
                              <span className="font-semibold">0.00 ر.س</span>
                            </div>
                          </div>

                          <div className="mt-6 space-y-2">
                            <Button className="w-full">
                              <Send className="ml-2 h-4 w-4" />
                              إرسال للموافقة
                            </Button>
                            <Button variant="outline" className="w-full">
                              <Printer className="ml-2 h-4 w-4" />
                              طباعة
                            </Button>
                            <Button variant="outline" className="w-full">
                              حفظ كمسودة
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle>عمليات التحويل الأخيرة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">TRF-001</p>
                                  <p className="text-sm text-gray-600">إلى فرع الرياض</p>
                                  <p className="text-sm text-gray-600">2025-06-15</p>
                                </div>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مكتمل</span>
                              </div>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">TRF-002</p>
                                  <p className="text-sm text-gray-600">إلى فرع جدة</p>
                                  <p className="text-sm text-gray-600">2025-06-12</p>
                                </div>
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">قيد المراجعة</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </Route>

            {/* Employee Management Routes */}
            <Route path={`/branch/${branchId}/employees`}>
              <BranchEmployees branchId={branchId ? parseInt(branchId) : 0} />
            </Route>
            <Route path={`/branch/${branchId}/employee-statement`}>
              <BranchEmployeeStatement branchId={branchId ? parseInt(branchId) : 0} />
            </Route>
            <Route path={`/branch/${branchId}/salaries`}>
              <BranchSalaries branchId={branchId ? parseInt(branchId) : 0} />
            </Route>
            {/* صفحات معلقة مؤقتاً - ملفات غير موجودة */}
            {/* <Route path={`/branch/${branchId}/allowances`}>
              <BranchAllowances branchId={branchId ? parseInt(branchId) : 0} />
            </Route>
            <Route path={`/branch/${branchId}/deductions`}>
              <BranchDeductions branchId={branchId ? parseInt(branchId) : 0} />
            </Route>
            <Route path={`/branch/${branchId}/attendance`}>
              <BranchAttendance branchId={branchId ? parseInt(branchId) : 0} />
            </Route>
            <Route path={`/branch/${branchId}/vacations`}>
              <BranchEmployeeVacations branchId={branchId ? parseInt(branchId) : 0} />
            </Route> */}

            {/* صفحة افتراضية */}
            <Route>
              <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-800">الصفحة غير موجودة</h2>
                <p className="text-gray-600 mt-2">الصفحة المطلوبة غير متوفرة في نظام الفرع</p>
                <Link href={`/branch/${branchId}`}>
                  <Button className="mt-4">العودة للوحة التحكم</Button>
                </Link>
              </div>
            </Route>
          </Switch>
        </div>
      </div>
    </div>

    {/* Add Terminal Dialog */}
    <Dialog open={showAddTerminalDialog} onOpenChange={setShowAddTerminalDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة محطة جديدة</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              اسم المحطة
            </Label>
            <Input
              id="name"
              placeholder="اسم المحطة"
              className="col-span-3"
              value={terminalForm.name}
              onChange={(e) => setTerminalForm({...terminalForm, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              الموقع
            </Label>
            <Input
              id="location"
              placeholder="موقع المحطة"
              className="col-span-3"
              value={terminalForm.location}
              onChange={(e) => setTerminalForm({...terminalForm, location: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employee" className="text-right">
              الموظف المختص
            </Label>
            <Select value={terminalForm.employee} onValueChange={(value) => setTerminalForm({...terminalForm, employee: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emp1">أحمد محمد</SelectItem>
                <SelectItem value="emp2">فاطمة علي</SelectItem>
                <SelectItem value="emp3">محمد حسن</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button variant="outline" onClick={() => setShowAddTerminalDialog(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSaveTerminal}>
            إضافة
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Terminal Dialog */}
    <Dialog open={showEditTerminalDialog} onOpenChange={setShowEditTerminalDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل المحطة</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              اسم المحطة
            </Label>
            <Input
              id="edit-name"
              placeholder="اسم المحطة"
              className="col-span-3"
              value={terminalForm.name}
              onChange={(e) => setTerminalForm({...terminalForm, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-location" className="text-right">
              الموقع
            </Label>
            <Input
              id="edit-location"
              placeholder="موقع المحطة"
              className="col-span-3"
              value={terminalForm.location}
              onChange={(e) => setTerminalForm({...terminalForm, location: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-employee" className="text-right">
              الموظف المختص
            </Label>
            <Select value={terminalForm.employee} onValueChange={(value) => setTerminalForm({...terminalForm, employee: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emp1">أحمد محمد</SelectItem>
                <SelectItem value="emp2">فاطمة علي</SelectItem>
                <SelectItem value="emp3">محمد حسن</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-status" className="text-right">
              حالة المحطة
            </Label>
            <Select value={terminalForm.status} onValueChange={(value) => setTerminalForm({...terminalForm, status: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر حالة المحطة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشطة</SelectItem>
                <SelectItem value="inactive">غير نشطة</SelectItem>
                <SelectItem value="maintenance">قيد الصيانة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button variant="outline" onClick={() => {
            setShowEditTerminalDialog(false);
            setSelectedTerminal(null);
          }}>
            إلغاء
          </Button>
          <Button onClick={handleSaveTerminal}>
            حفظ التعديلات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}