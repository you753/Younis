import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Percent,
  Crown,
  Target,
  TrendingUp
} from 'lucide-react';

interface ClientGroup {
  id: number;
  name: string;
  description: string;
  discount: number;
  clientsCount: number;
  totalPurchases: number;
  isVip: boolean;
  color: string;
  minPurchaseAmount: number;
}

export default function ClientGroups() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ClientGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([
    {
      id: 1,
      name: 'العملاء المميزين',
      description: 'عملاء بمشتريات عالية وولاء للمتجر',
      discount: 15,
      clientsCount: 25,
      totalPurchases: 45000,
      isVip: true,
      color: 'bg-purple-100 text-purple-800',
      minPurchaseAmount: 10000
    },
    {
      id: 2,
      name: 'عملاء الجملة',
      description: 'عملاء يشترون بكميات كبيرة',
      discount: 10,
      clientsCount: 18,
      totalPurchases: 32000,
      isVip: false,
      color: 'bg-blue-100 text-blue-800',
      minPurchaseAmount: 5000
    },
    {
      id: 3,
      name: 'العملاء العاديين',
      description: 'عملاء بمشتريات منتظمة',
      discount: 5,
      clientsCount: 150,
      totalPurchases: 75000,
      isVip: false,
      color: 'bg-green-100 text-green-800',
      minPurchaseAmount: 0
    },
    {
      id: 4,
      name: 'عملاء الذهب',
      description: 'أعلى مستوى من العملاء المميزين',
      discount: 20,
      clientsCount: 8,
      totalPurchases: 28000,
      isVip: true,
      color: 'bg-yellow-100 text-yellow-800',
      minPurchaseAmount: 20000
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount: 0,
    minPurchaseAmount: 0,
    isVip: false
  });

  const handleAddGroup = () => {
    if (!formData.name) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ادخال اسم المجموعة",
        variant: "destructive"
      });
      return;
    }

    const colors = [
      'bg-red-100 text-red-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800',
      'bg-indigo-100 text-indigo-800'
    ];

    const newGroup: ClientGroup = {
      id: clientGroups.length + 1,
      name: formData.name,
      description: formData.description,
      discount: formData.discount,
      minPurchaseAmount: formData.minPurchaseAmount,
      isVip: formData.isVip,
      clientsCount: 0,
      totalPurchases: 0,
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    setClientGroups([...clientGroups, newGroup]);
    setFormData({ name: '', description: '', discount: 0, minPurchaseAmount: 0, isVip: false });
    setShowAddForm(false);
    
    toast({
      title: "تم الحفظ",
      description: "تم إضافة مجموعة العملاء بنجاح",
    });
  };

  const handleEditGroup = (group: ClientGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      discount: group.discount,
      minPurchaseAmount: group.minPurchaseAmount,
      isVip: group.isVip
    });
    setShowEditForm(true);
  };

  const handleUpdateGroup = () => {
    if (!editingGroup) return;

    setClientGroups(clientGroups.map(group => 
      group.id === editingGroup.id 
        ? { ...group, ...formData }
        : group
    ));
    
    setShowEditForm(false);
    setEditingGroup(null);
    setFormData({ name: '', description: '', discount: 0, minPurchaseAmount: 0, isVip: false });
    
    toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات المجموعة بنجاح",
    });
  };

  const handleDeleteGroup = (groupId: number) => {
    if (confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
      setClientGroups(clientGroups.filter(group => group.id !== groupId));
      toast({
        title: "تم الحذف",
        description: "تم حذف المجموعة بنجاح",
      });
    }
  };

  const filteredGroups = clientGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalGroups: clientGroups.length,
    vipGroups: clientGroups.filter(g => g.isVip).length,
    totalClients: clientGroups.reduce((sum, g) => sum + g.clientsCount, 0),
    averageDiscount: clientGroups.reduce((sum, g) => sum + g.discount, 0) / clientGroups.length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مجموعات العملاء</h1>
            <p className="text-gray-600">إدارة تصنيفات العملاء والخصومات</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة مجموعة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المجموعات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المجموعات المميزة</p>
                <p className="text-2xl font-bold text-purple-600">{stats.vipGroups}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalClients}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط الخصم</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averageDiscount.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="البحث في المجموعات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {group.isVip ? (
                      <Crown className="h-6 w-6 text-purple-600" />
                    ) : (
                      <Users className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {group.name}
                      {group.isVip && <Crown className="h-4 w-4 text-purple-500" />}
                    </CardTitle>
                    <Badge className={group.color}>
                      {group.discount}% خصم
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">{group.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Users className="h-4 w-4" />
                    <span>عدد العملاء</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{group.clientsCount}</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Percent className="h-4 w-4" />
                    <span>الخصم</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">{group.discount}%</div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">إجمالي المشتريات</div>
                <div className="text-lg font-semibold text-blue-600">{group.totalPurchases.toLocaleString()} ريال</div>
              </div>

              {group.minPurchaseAmount > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">الحد الأدنى للانضمام</div>
                  <div className="text-lg font-semibold text-yellow-600">{group.minPurchaseAmount.toLocaleString()} ريال</div>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-blue-600 hover:text-blue-900"
                  onClick={() => handleEditGroup(group)}
                >
                  <Edit className="h-4 w-4 ml-1" />
                  تعديل
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-green-600 hover:text-green-900"
                  onClick={() => toast({
                    title: "إضافة عميل",
                    description: "سيتم تطوير هذه الميزة قريباً"
                  })}
                >
                  <UserPlus className="h-4 w-4 ml-1" />
                  إضافة عميل
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Group Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مجموعة عملاء جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">اسم المجموعة *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="مثال: العملاء المميزين"
              />
            </div>
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="وصف المجموعة وخصائصها"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">نسبة الخصم (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minAmount">الحد الأدنى للانضمام</Label>
                <Input
                  id="minAmount"
                  type="number"
                  min="0"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({...formData, minPurchaseAmount: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isVip"
                type="checkbox"
                checked={formData.isVip}
                onChange={(e) => setFormData({...formData, isVip: e.target.checked})}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <Label htmlFor="isVip" className="flex items-center gap-1">
                <Crown className="h-4 w-4 text-purple-500" />
                مجموعة مميزة (VIP)
              </Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleAddGroup}>
                حفظ المجموعة
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل مجموعة العملاء</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">اسم المجموعة *</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="مثال: العملاء المميزين"
              />
            </div>
            <div>
              <Label htmlFor="editDescription">الوصف</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="وصف المجموعة وخصائصها"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDiscount">نسبة الخصم (%)</Label>
                <Input
                  id="editDiscount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="editMinAmount">الحد الأدنى للانضمام</Label>
                <Input
                  id="editMinAmount"
                  type="number"
                  min="0"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({...formData, minPurchaseAmount: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="editIsVip"
                type="checkbox"
                checked={formData.isVip}
                onChange={(e) => setFormData({...formData, isVip: e.target.checked})}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <Label htmlFor="editIsVip" className="flex items-center gap-1">
                <Crown className="h-4 w-4 text-purple-500" />
                مجموعة مميزة (VIP)
              </Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleUpdateGroup}>
                حفظ التغييرات
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditForm(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}