import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Save,
  X,
  Shield,
  Database,
  Monitor,
  Network,
  DollarSign,
  Percent,
  Clock,
  FileText,
  Lock,
  Unlock,
  AlertTriangle,
  BarChart3,
  Package,
  Users,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BranchSettings() {
  const [editingBranch, setEditingBranch] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['/api/branches'],
  });

  const { data: branchSettings, isLoading: settingsLoading } = useQuery({
    queryKey: [`/api/branches/${selectedBranch}/settings`],
    enabled: !!selectedBranch,
    queryFn: () => ({
      permissions: {
        canAddProducts: true,
        canEditProducts: true,
        canDeleteProducts: false,
        canProcessSales: true,
        canProcessReturns: true,
        canManageInventory: true,
        canViewReports: true,
        canExportData: false,
        canManageUsers: false,
        canChangeSettings: false
      },
      limits: {
        maxDailyTransactions: 1000,
        maxTransactionAmount: 50000,
        maxDiscountPercent: 20,
        maxCreditLimit: 100000,
        inventoryThreshold: 10
      },
      features: {
        enablePOS: true,
        enableInventoryTracking: true,
        enableCustomerLoyalty: false,
        enableBarcodeScanning: true,
        enablePrinting: true,
        enableBackup: true,
        enableNotifications: true,
        enableMultiCurrency: false
      },
      operatingHours: {
        monday: { open: '09:00', close: '21:00', isOpen: true },
        tuesday: { open: '09:00', close: '21:00', isOpen: true },
        wednesday: { open: '09:00', close: '21:00', isOpen: true },
        thursday: { open: '09:00', close: '21:00', isOpen: true },
        friday: { open: '14:00', close: '23:00', isOpen: true },
        saturday: { open: '09:00', close: '21:00', isOpen: true },
        sunday: { open: '09:00', close: '21:00', isOpen: false }
      },
      taxSettings: {
        defaultTaxRate: 15,
        enableTaxCalculation: true,
        taxRegistrationNumber: '',
        taxExemptItems: []
      },
      printerSettings: {
        receiptPrinter: '',
        labelPrinter: '',
        enableAutoPrint: false,
        receiptTemplate: 'standard'
      }
    })
  });

  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('فشل في تحديث الفرع');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setEditingBranch(null);
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الفرع بنجاح",
      });
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('فشل في إنشاء الفرع');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setShowAddForm(false);
      toast({
        title: "تم الإنشاء بنجاح",
        description: "تم إنشاء الفرع الجديد بنجاح",
      });
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('فشل في حذف الفرع');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الفرع بنجاح",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ branchId, settings }: { branchId: number; settings: any }) => {
      const response = await fetch(`/api/branches/${branchId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('فشل في تحديث الإعدادات');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${selectedBranch}/settings`] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم حفظ إعدادات الفرع بنجاح",
      });
    },
  });

  const BranchForm = ({ branch, onCancel }: { branch?: any; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      name: branch?.name || '',
      code: branch?.code || '',
      address: branch?.address || '',
      phone: branch?.phone || '',
      email: branch?.email || '',
      managerName: branch?.managerName || '',
      managerPhone: branch?.managerPhone || '',
      description: branch?.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (branch) {
        updateBranchMutation.mutate({ id: branch.id, data: formData });
      } else {
        createBranchMutation.mutate(formData);
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{branch ? 'تعديل الفرع' : 'إضافة فرع جديد'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم الفرع</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">رمز الفرع</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="managerName">اسم المدير</Label>
                <Input
                  id="managerName"
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="managerPhone">هاتف المدير</Label>
                <Input
                  id="managerPhone"
                  value={formData.managerPhone}
                  onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={updateBranchMutation.isPending || createBranchMutation.isPending}
              >
                <Save className="ml-2 h-4 w-4" />
                {branch ? 'تحديث' : 'إضافة'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  const PermissionsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            صلاحيات إدارة المنتجات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>إضافة منتجات جديدة</Label>
            <Switch defaultChecked={branchSettings?.permissions?.canAddProducts} />
          </div>
          <div className="flex items-center justify-between">
            <Label>تعديل المنتجات</Label>
            <Switch defaultChecked={branchSettings?.permissions?.canEditProducts} />
          </div>
          <div className="flex items-center justify-between">
            <Label>حذف المنتجات</Label>
            <Switch defaultChecked={branchSettings?.permissions?.canDeleteProducts} />
          </div>
          <div className="flex items-center justify-between">
            <Label>إدارة المخزون</Label>
            <Switch defaultChecked={branchSettings?.permissions?.canManageInventory} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            صلاحيات المبيعات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>معالجة المبيعات</Label>
            <Switch defaultChecked={branchSettings?.permissions?.canProcessSales} />
          </div>
          <div className="flex items-center justify-between">
            <Label>معالجة المرتجعات</Label>
            <Switch defaultChecked={branchSettings?.permissions?.canProcessReturns} />
          </div>
          <div className="flex items-center justify-between">
            <Label>عرض التقارير</Label>
            <Switch defaultChecked={branchSettings?.permissions?.canViewReports} />
          </div>
          <div className="flex items-center justify-between">
            <Label>تصدير البيانات</Label>
            <Switch defaultChecked={branchSettings?.permissions?.canExportData} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            صلاحيات إدارية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>إدارة المستخدمين</Label>
            <Switch defaultChecked={branchSettings?.permissions?.canManageUsers} />
          </div>
          <div className="flex items-center justify-between">
            <Label>تغيير الإعدادات</Label>
            <Switch defaultChecked={branchSettings?.permissions?.canChangeSettings} />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const LimitsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            حدود المعاملات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>الحد الأقصى للمعاملات اليومية</Label>
            <Input 
              type="number" 
              defaultValue={branchSettings?.limits?.maxDailyTransactions}
              placeholder="1000"
            />
          </div>
          <div>
            <Label>الحد الأقصى لقيمة المعاملة الواحدة</Label>
            <Input 
              type="number" 
              defaultValue={branchSettings?.limits?.maxTransactionAmount}
              placeholder="50000"
            />
          </div>
          <div>
            <Label>أقصى نسبة خصم مسموحة (%)</Label>
            <Input 
              type="number" 
              defaultValue={branchSettings?.limits?.maxDiscountPercent}
              placeholder="20"
            />
          </div>
          <div>
            <Label>الحد الائتماني الأقصى</Label>
            <Input 
              type="number" 
              defaultValue={branchSettings?.limits?.maxCreditLimit}
              placeholder="100000"
            />
          </div>
          <div>
            <Label>حد تنبيه المخزون</Label>
            <Input 
              type="number" 
              defaultValue={branchSettings?.limits?.inventoryThreshold}
              placeholder="10"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FeaturesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            الميزات الأساسية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>نظام نقاط البيع (POS)</Label>
            <Switch defaultChecked={branchSettings?.features?.enablePOS} />
          </div>
          <div className="flex items-center justify-between">
            <Label>تتبع المخزون</Label>
            <Switch defaultChecked={branchSettings?.features?.enableInventoryTracking} />
          </div>
          <div className="flex items-center justify-between">
            <Label>برنامج ولاء العملاء</Label>
            <Switch defaultChecked={branchSettings?.features?.enableCustomerLoyalty} />
          </div>
          <div className="flex items-center justify-between">
            <Label>قراءة الباركود</Label>
            <Switch defaultChecked={branchSettings?.features?.enableBarcodeScanning} />
          </div>
          <div className="flex items-center justify-between">
            <Label>الطباعة</Label>
            <Switch defaultChecked={branchSettings?.features?.enablePrinting} />
          </div>
          <div className="flex items-center justify-between">
            <Label>النسخ الاحتياطي التلقائي</Label>
            <Switch defaultChecked={branchSettings?.features?.enableBackup} />
          </div>
          <div className="flex items-center justify-between">
            <Label>الإشعارات</Label>
            <Switch defaultChecked={branchSettings?.features?.enableNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <Label>العملات المتعددة</Label>
            <Switch defaultChecked={branchSettings?.features?.enableMultiCurrency} />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OperatingHoursTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            ساعات العمل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {branchSettings?.operatingHours && Object.entries(branchSettings.operatingHours).map(([day, hours]: [string, any]) => (
            <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-20">
                <Label>{
                  day === 'monday' ? 'الاثنين' :
                  day === 'tuesday' ? 'الثلاثاء' :
                  day === 'wednesday' ? 'الأربعاء' :
                  day === 'thursday' ? 'الخميس' :
                  day === 'friday' ? 'الجمعة' :
                  day === 'saturday' ? 'السبت' : 'الأحد'
                }</Label>
              </div>
              <Switch defaultChecked={hours.isOpen} />
              {hours.isOpen && (
                <>
                  <Input type="time" defaultValue={hours.open} className="w-32" />
                  <span>إلى</span>
                  <Input type="time" defaultValue={hours.close} className="w-32" />
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const TaxSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            إعدادات الضرائب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>تفعيل حساب الضرائب</Label>
            <Switch defaultChecked={branchSettings?.taxSettings?.enableTaxCalculation} />
          </div>
          <div>
            <Label>نسبة الضريبة الافتراضية (%)</Label>
            <Input 
              type="number" 
              defaultValue={branchSettings?.taxSettings?.defaultTaxRate}
              placeholder="15"
            />
          </div>
          <div>
            <Label>رقم التسجيل الضريبي</Label>
            <Input 
              defaultValue={branchSettings?.taxSettings?.taxRegistrationNumber}
              placeholder="أدخل رقم التسجيل الضريبي"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">جاري تحميل إعدادات الفروع...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات التحكم بالفروع</h1>
          <p className="text-gray-600">إدارة شاملة وتحكم كامل في إعدادات وصلاحيات الفروع</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة فرع جديد
          </Button>
        </div>
      </div>

      {showAddForm && (
        <BranchForm onCancel={() => setShowAddForm(false)} />
      )}

      {/* قائمة اختيار الفرع للتحكم */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>اختر الفرع للتحكم في إعداداته</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedBranch?.toString()} onValueChange={(value) => setSelectedBranch(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر فرعاً" />
              </SelectTrigger>
              <SelectContent>
                {(branches as any[]).map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name} - {branch.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* إعدادات التحكم المفصلة */}
      {selectedBranch && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
            <TabsTrigger value="limits">الحدود</TabsTrigger>
            <TabsTrigger value="features">الميزات</TabsTrigger>
            <TabsTrigger value="hours">ساعات العمل</TabsTrigger>
            <TabsTrigger value="tax">الضرائب</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    حالة الفرع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>حالة التشغيل</span>
                    <Badge variant="default">
                      <CheckCircle className="ml-1 h-3 w-3" />
                      نشط
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>آخر تسجيل دخول</span>
                    <span className="text-sm text-gray-600">منذ 5 دقائق</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>المعاملات اليوم</span>
                    <span className="font-bold">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>قيمة المبيعات اليوم</span>
                    <span className="font-bold">15,750 ر.س</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    معلومات النظام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>إصدار النظام</span>
                    <span className="text-sm">v2.1.3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>آخر تحديث</span>
                    <span className="text-sm text-gray-600">2025-06-10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>مساحة التخزين المستخدمة</span>
                    <span className="text-sm">2.3 جيجا / 10 جيجا</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>آخر نسخة احتياطية</span>
                    <span className="text-sm text-green-600">اليوم 03:00</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    تنبيهات وإشعارات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">تنبيه مخزون</p>
                        <p className="text-xs text-gray-600">5 منتجات تحتاج إعادة تموين</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Database className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">تم النسخ الاحتياطي</p>
                        <p className="text-xs text-gray-600">تم إنشاء نسخة احتياطية بنجاح</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsTab />
          </TabsContent>

          <TabsContent value="limits">
            <LimitsTab />
          </TabsContent>

          <TabsContent value="features">
            <FeaturesTab />
          </TabsContent>

          <TabsContent value="hours">
            <OperatingHoursTab />
          </TabsContent>

          <TabsContent value="tax">
            <TaxSettingsTab />
          </TabsContent>

          {/* أزرار الحفظ والتحكم */}
          <div className="flex gap-4 pt-6 border-t">
            <Button 
              onClick={() => updateSettingsMutation.mutate({ 
                branchId: selectedBranch, 
                settings: branchSettings 
              })}
              disabled={updateSettingsMutation.isPending}
            >
              <Save className="ml-2 h-4 w-4" />
              حفظ الإعدادات
            </Button>
            <Button variant="outline" onClick={() => window.open(`/branch-app/${selectedBranch}`, '_blank')}>
              <Monitor className="ml-2 h-4 w-4" />
              فتح نظام الفرع
            </Button>
            <Button variant="outline">
              <Lock className="ml-2 h-4 w-4" />
              قفل الفرع مؤقتاً
            </Button>
            <Button variant="outline">
              <Database className="ml-2 h-4 w-4" />
              إنشاء نسخة احتياطية
            </Button>
          </div>
        </Tabs>
      )}

      {/* قائمة الفروع للإدارة السريعة */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">إدارة سريعة للفروع</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(branches as any[]).map((branch: any) => (
            <Card key={branch.id} className="relative">
              {editingBranch === branch.id ? (
                <BranchForm
                  branch={branch}
                  onCancel={() => setEditingBranch(null)}
                />
              ) : (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {branch.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedBranch(branch.id)}
                        >
                          <Settings className="h-4 w-4 ml-1" />
                          تحكم
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingBranch(branch.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteBranchMutation.mutate(branch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {branch.address}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {branch.phone}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">حالة التشغيل:</span>
                        <Badge variant="default">
                          <CheckCircle className="ml-1 h-3 w-3" />
                          نشط
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => window.open(`/branch-app/${branch.id}`, '_blank')}
                        >
                          <Monitor className="h-4 w-4 ml-1" />
                          فتح النظام
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}