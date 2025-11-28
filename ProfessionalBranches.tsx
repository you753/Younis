import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Building, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  MapPin, 
  Phone, 
  User, 
  DollarSign,
  TrendingUp,
  Users,
  Package,
  BarChart3,
  Settings,
  Star,
  Calendar,
  LogIn,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  city?: string;
  phone: string;
  manager?: string;
  managerName?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  isActive?: boolean;
  openingDate?: string;
  monthlyRevenue?: number;
  employeeCount?: number;
  productCount?: number;
  rating?: number;
  region?: string;
  type?: 'main' | 'branch' | 'warehouse';
  created_at?: string;
}

const mockBranches: Branch[] = [
  {
    id: 1,
    name: 'الفرع الرئيسي - الرياض',
    code: 'BR001',
    address: 'طريق الملك فهد، حي العليا',
    city: 'الرياض',
    phone: '011-234-5678',
    manager: 'أحمد السعيد',
    status: 'active',
    openingDate: '2020-01-15',
    monthlyRevenue: 450000,
    employeeCount: 25,
    productCount: 1200,
    rating: 4.8,
    region: 'وسط',
    type: 'main'
  },
  {
    id: 2,
    name: 'فرع جدة التجاري',
    code: 'BR002',
    address: 'شارع التحلية، حي الزهراء',
    city: 'جدة',
    phone: '012-345-6789',
    manager: 'فاطمة العتيبي',
    status: 'active',
    openingDate: '2021-03-20',
    monthlyRevenue: 320000,
    employeeCount: 18,
    productCount: 850,
    rating: 4.6,
    region: 'غرب',
    type: 'branch'
  },
  {
    id: 3,
    name: 'فرع الدمام الشرقي',
    code: 'BR003',
    address: 'طريق الظهران، حي الفيصلية',
    city: 'الدمام',
    phone: '013-456-7890',
    manager: 'محمد الخالدي',
    status: 'active',
    openingDate: '2021-08-10',
    monthlyRevenue: 280000,
    employeeCount: 15,
    productCount: 720,
    rating: 4.4,
    region: 'شرق',
    type: 'branch'
  },
  {
    id: 4,
    name: 'مستودع الرياض المركزي',
    code: 'WH001',
    address: 'المنطقة الصناعية الثانية',
    city: 'الرياض',
    phone: '011-567-8901',
    manager: 'خالد النصار',
    status: 'active',
    openingDate: '2020-06-01',
    monthlyRevenue: 0,
    employeeCount: 8,
    productCount: 2500,
    rating: 4.7,
    region: 'وسط',
    type: 'warehouse'
  },
  {
    id: 5,
    name: 'فرع أبها الجنوبي',
    code: 'BR004',
    address: 'شارع الملك عبدالعزيز',
    city: 'أبها',
    phone: '017-678-9012',
    manager: 'نورا العسيري',
    status: 'maintenance',
    openingDate: '2022-11-15',
    monthlyRevenue: 150000,
    employeeCount: 10,
    productCount: 450,
    rating: 4.2,
    region: 'جنوب',
    type: 'branch'
  }
];

export default function ProfessionalBranches() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // تحميل الفروع من قاعدة البيانات
  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
    retry: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    phone: '',
    manager: '',
    region: 'وسط',
    type: 'branch' as 'main' | 'branch' | 'warehouse'
  });

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (branch.manager || branch.managerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (branch.status === filterStatus) || (!branch.status && branch.isActive);
    const matchesRegion = filterRegion === 'all' || (branch.region === filterRegion);
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const totalRevenue = branches.reduce((sum, branch) => sum + (branch.monthlyRevenue ?? 0), 0);
  const totalEmployees = branches.reduce((sum, branch) => sum + (branch.employeeCount ?? 0), 0);
  const totalProducts = branches.reduce((sum, branch) => sum + (branch.productCount ?? 0), 0);
  const activeBranches = branches.filter(b => (b.status === 'active') || (b.isActive === true)).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'maintenance': return 'صيانة';
      default: return 'غير محدد';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'main': return 'رئيسي';
      case 'branch': return 'فرع';
      case 'warehouse': return 'مستودع';
      default: return 'غير محدد';
    }
  };

  // إضافة فرع جديد
  const addBranchMutation = useMutation({
    mutationFn: async (branchData: any) => {
      return await apiRequest('POST', '/api/branches', branchData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "تم إضافة الفرع",
        description: `تم إضافة ${newBranch.name} بنجاح`,
      });
      setNewBranch({
        name: '',
        code: '',
        address: '',
        city: '',
        phone: '',
        manager: '',
        region: 'وسط',
        type: 'branch'
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الفرع",
        variant: "destructive"
      });
    }
  });

  const handleAddBranch = () => {
    if (!newBranch.name || !newBranch.code || !newBranch.address) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    addBranchMutation.mutate(newBranch);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setIsEditDialogOpen(true);
  };

  // تحديث فرع
  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return await apiRequest('PUT', `/api/branches/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "تم تحديث الفرع",
        description: `تم تحديث ${editingBranch?.name} بنجاح`,
      });
      setEditingBranch(null);
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الفرع",
        variant: "destructive"
      });
    }
  });

  const handleUpdateBranch = () => {
    if (!editingBranch) return;
    updateBranchMutation.mutate({ id: editingBranch.id, data: editingBranch });
  };

  const handleDeleteBranch = (branch: Branch) => {
    setBranchToDelete(branch);
    setIsDeleteDialogOpen(true);
  };

  // حذف فرع
  const deleteBranchMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/branches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "تم حذف الفرع",
        description: `تم حذف ${branchToDelete?.name} بنجاح`,
      });
      setBranchToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      // عرض الرسالة المحددة من الـ API
      const errorMessage = error?.message || "حدث خطأ أثناء حذف الفرع";
      
      toast({
        title: "لا يمكن حذف الفرع",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsDeleteDialogOpen(false);
    }
  });

  const confirmDeleteBranch = () => {
    if (!branchToDelete) return;
    deleteBranchMutation.mutate(branchToDelete.id);
  };

  // دخول إلى نظام الفرع
  const handleBranchLogin = (branch: Branch) => {
    toast({
      title: "جاري الدخول...",
      description: `جاري فتح نظام ${branch.name}`,
    });
    
    setLocation(`/standalone-branch/${branch.id}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* الهيدر */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="h-8 w-8 text-amber-500" />
              إدارة الفروع المتقدمة
            </h1>
            <p className="text-gray-600 mt-2">نظام شامل لإدارة ومراقبة جميع الفروع والمستودعات</p>
          </div>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-black"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة فرع جديد
          </Button>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold">{totalRevenue.toLocaleString('en-US')} ر.س</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">الفروع النشطة</p>
                  <p className="text-2xl font-bold">{activeBranches} من {branches.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">إجمالي الموظفين</p>
                  <p className="text-2xl font-bold">{totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* شريط البحث والفلاتر */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في الفروع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="حالة الفرع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRegion} onValueChange={setFilterRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المناطق</SelectItem>
                  <SelectItem value="وسط">وسط</SelectItem>
                  <SelectItem value="غرب">غرب</SelectItem>
                  <SelectItem value="شرق">شرق</SelectItem>
                  <SelectItem value="جنوب">جنوب</SelectItem>
                  <SelectItem value="شمال">شمال</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                فلاتر متقدمة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* قائمة الفروع */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-amber-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 mb-1">{branch.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{branch.code}</Badge>
                      {branch.status && <Badge className={getStatusColor(branch.status)}>{getStatusText(branch.status)}</Badge>}
                      {!branch.status && branch.isActive && <Badge className="bg-green-100 text-green-800">نشط</Badge>}
                      {branch.type && <Badge variant="secondary">{getTypeText(branch.type)}</Badge>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{branch.address}{branch.city ? `, ${branch.city}` : ''}</span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  {(branch.manager || branch.managerName) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{branch.manager || branch.managerName}</span>
                    </div>
                  )}
                  {branch.openingDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>افتتح في: {new Date(branch.openingDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  )}
                </div>

                {branch.rating && (
                  <div className="flex items-center gap-1">
                    {renderStars(branch.rating)}
                    <span className="text-sm text-gray-600 mr-1">({branch.rating})</span>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Button 
                    size="sm" 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => handleBranchLogin(branch)}
                  >
                    <LogIn className="h-4 w-4 ml-1" />
                    دخول للفرع
                  </Button>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedBranch(branch);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      عرض
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditBranch(branch)}
                    >
                      <Edit3 className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteBranch(branch)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* نافذة تفاصيل الفرع */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Building className="h-6 w-6 text-amber-500" />
                {selectedBranch?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedBranch && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="performance">الأداء</TabsTrigger>
                  <TabsTrigger value="employees">الموظفين</TabsTrigger>
                  <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>معلومات أساسية</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><strong>الكود:</strong> {selectedBranch.code}</div>
                        <div><strong>العنوان:</strong> {selectedBranch.address}</div>
                        {selectedBranch.city && <div><strong>المدينة:</strong> {selectedBranch.city}</div>}
                        {selectedBranch.phone && <div><strong>الهاتف:</strong> {selectedBranch.phone}</div>}
                        {(selectedBranch.manager || selectedBranch.managerName) && <div><strong>المدير:</strong> {selectedBranch.manager || selectedBranch.managerName}</div>}
                        {selectedBranch.openingDate && <div><strong>تاريخ الافتتاح:</strong> {new Date(selectedBranch.openingDate).toLocaleDateString('en-GB')}</div>}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>إحصائيات سريعة</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><strong>الإيرادات الشهرية:</strong> {(selectedBranch.monthlyRevenue ?? 0).toLocaleString('en-US')} ر.س</div>
                        <div><strong>عدد الموظفين:</strong> {selectedBranch.employeeCount ?? 0}</div>
                        <div><strong>عدد المنتجات:</strong> {selectedBranch.productCount ?? 0}</div>
                        {selectedBranch.rating && <div><strong>التقييم:</strong> {selectedBranch.rating}/5</div>}
                        {selectedBranch.region && <div><strong>المنطقة:</strong> {selectedBranch.region}</div>}
                        {selectedBranch.type && <div><strong>النوع:</strong> {getTypeText(selectedBranch.type)}</div>}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="performance">
                  <Card>
                    <CardHeader>
                      <CardTitle>مؤشرات الأداء</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-gray-500 py-8">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        سيتم إضافة تقارير الأداء قريباً
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="employees">
                  <Card>
                    <CardHeader>
                      <CardTitle>إدارة الموظفين</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-gray-500 py-8">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        سيتم إضافة إدارة الموظفين قريباً
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>إعدادات الفرع</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-gray-500 py-8">
                        <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        سيتم إضافة إعدادات الفرع قريباً
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* نافذة إضافة فرع جديد - مُحسّنة للجوال */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto p-4 md:p-6" dir="rtl">
            <DialogHeader className="pb-2">
              <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                <Plus className="h-5 w-5 text-amber-500" />
                إضافة فرع جديد
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="name" className="text-xs md:text-sm">اسم الفرع *</Label>
                <Input
                  id="name"
                  placeholder="فرع الرياض"
                  className="h-9 text-sm"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="code" className="text-xs md:text-sm">كود الفرع *</Label>
                <Input
                  id="code"
                  placeholder="BR005"
                  className="h-9 text-sm"
                  value={newBranch.code}
                  onChange={(e) => setNewBranch({...newBranch, code: e.target.value})}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address" className="text-xs md:text-sm">العنوان *</Label>
                <Input
                  id="address"
                  placeholder="العنوان"
                  className="h-9 text-sm"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="city" className="text-xs md:text-sm">المدينة</Label>
                <Input
                  id="city"
                  placeholder="المدينة"
                  className="h-9 text-sm"
                  value={newBranch.city}
                  onChange={(e) => setNewBranch({...newBranch, city: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs md:text-sm">الهاتف</Label>
                <Input
                  id="phone"
                  placeholder="0500000000"
                  className="h-9 text-sm"
                  value={newBranch.phone}
                  onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="manager" className="text-xs md:text-sm">المدير</Label>
                <Input
                  id="manager"
                  placeholder="اسم المدير"
                  className="h-9 text-sm"
                  value={newBranch.manager}
                  onChange={(e) => setNewBranch({...newBranch, manager: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="region" className="text-xs md:text-sm">المنطقة</Label>
                <Select value={newBranch.region} onValueChange={(value) => setNewBranch({...newBranch, region: value})}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="وسط">وسط</SelectItem>
                    <SelectItem value="غرب">غرب</SelectItem>
                    <SelectItem value="شرق">شرق</SelectItem>
                    <SelectItem value="جنوب">جنوب</SelectItem>
                    <SelectItem value="شمال">شمال</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="type" className="text-xs md:text-sm">نوع الفرع</Label>
                <Select value={newBranch.type} onValueChange={(value: 'main' | 'branch' | 'warehouse') => setNewBranch({...newBranch, type: value})}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch">فرع</SelectItem>
                    <SelectItem value="main">رئيسي</SelectItem>
                    <SelectItem value="warehouse">مستودع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleAddBranch}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black h-9 text-sm"
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 h-9 text-sm"
              >
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* نافذة تعديل الفرع */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Edit3 className="h-6 w-6 text-amber-500" />
                تعديل الفرع
              </DialogTitle>
            </DialogHeader>
            
            {editingBranch && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">اسم الفرع *</Label>
                  <Input
                    id="edit-name"
                    value={editingBranch.name}
                    onChange={(e) => setEditingBranch({...editingBranch, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-code">كود الفرع *</Label>
                  <Input
                    id="edit-code"
                    value={editingBranch.code}
                    onChange={(e) => setEditingBranch({...editingBranch, code: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-address">العنوان *</Label>
                  <Input
                    id="edit-address"
                    value={editingBranch.address}
                    onChange={(e) => setEditingBranch({...editingBranch, address: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-city">المدينة</Label>
                  <Input
                    id="edit-city"
                    value={editingBranch.city}
                    onChange={(e) => setEditingBranch({...editingBranch, city: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone">رقم الهاتف</Label>
                  <Input
                    id="edit-phone"
                    value={editingBranch.phone}
                    onChange={(e) => setEditingBranch({...editingBranch, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-manager">مدير الفرع</Label>
                  <Input
                    id="edit-manager"
                    value={editingBranch.manager}
                    onChange={(e) => setEditingBranch({...editingBranch, manager: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-region">المنطقة</Label>
                  <Select value={editingBranch.region} onValueChange={(value) => setEditingBranch({...editingBranch, region: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="وسط">وسط</SelectItem>
                      <SelectItem value="غرب">غرب</SelectItem>
                      <SelectItem value="شرق">شرق</SelectItem>
                      <SelectItem value="جنوب">جنوب</SelectItem>
                      <SelectItem value="شمال">شمال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">حالة الفرع</Label>
                  <Select value={editingBranch.status} onValueChange={(value: 'active' | 'inactive' | 'maintenance') => setEditingBranch({...editingBranch, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="maintenance">صيانة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleUpdateBranch}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
              >
                <Edit3 className="h-4 w-4 ml-2" />
                حفظ التغييرات
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* نافذة تأكيد الحذف */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
                <Trash2 className="h-6 w-6" />
                تأكيد حذف الفرع
              </DialogTitle>
            </DialogHeader>
            
            {branchToDelete && (
              <div className="space-y-4 mt-4">
                <p className="text-gray-600">
                  هل أنت متأكد من حذف الفرع التالي؟
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800">{branchToDelete.name}</h3>
                  <p className="text-sm text-red-600">{branchToDelete.code} - {branchToDelete.address}</p>
                </div>
                
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={confirmDeleteBranch}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                نعم، احذف الفرع
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}