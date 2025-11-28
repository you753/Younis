import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { 
  TreePine, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import type { AccountCategory, Account } from '@shared/schema';

interface AccountTreeNode {
  category: AccountCategory;
  accounts: Account[];
  expanded: boolean;
}

export default function ChartOfAccounts() {
  const { setCurrentPage } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage('شجرة الحسابات');
  }, [setCurrentPage]);

  // Fetch data
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/account-categories'],
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/accounts'],
  });

  // Organize data into tree structure
  const accountTree: AccountTreeNode[] = categories.map((category: AccountCategory) => ({
    category,
    accounts: accounts.filter((account: Account) => account.categoryId === category.id),
    expanded: expandedCategories[category.id] || false
  }));

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'assets': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'liabilities': return <CreditCard className="h-4 w-4 text-red-600" />;
      case 'equity': return <DollarSign className="h-4 w-4 text-purple-600" />;
      case 'revenue': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'expenses': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      default: return <TreePine className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryTypeLabel = (type: string) => {
    switch (type) {
      case 'assets': return 'أصول';
      case 'liabilities': return 'خصوم';
      case 'equity': return 'حقوق الملكية';
      case 'revenue': return 'إيرادات';
      case 'expenses': return 'مصروفات';
      default: return type;
    }
  };

  const getAccountTypeColor = (type: string) => {
    return type === 'debit' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (categoriesLoading || accountsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">شجرة الحسابات</h2>
          <p className="text-gray-600">إدارة الحسابات المحاسبية والتصنيفات</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="ml-2 h-4 w-4" />
                إضافة تصنيف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة تصنيف جديد</DialogTitle>
              </DialogHeader>
              <AddCategoryForm onClose={() => setIsAddCategoryOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة حساب
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة حساب جديد</DialogTitle>
              </DialogHeader>
              <AddAccountForm 
                categories={categories}
                onClose={() => setIsAddAccountOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {categories.map((category: AccountCategory) => {
          const categoryAccounts = accounts.filter((account: Account) => account.categoryId === category.id);
          const totalBalance = categoryAccounts.reduce((sum: number, account: Account) => 
            sum + parseFloat(account.balance || '0'), 0
          );

          return (
            <Card key={category.id} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">{categoryAccounts.length} حساب</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-lg font-bold text-gray-900">
                    {totalBalance.toLocaleString()} ر.س
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart of Accounts Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5" />
            دليل الحسابات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {accountTree.map((node) => (
              <div key={node.category.id} className="border border-gray-200 rounded-lg">
                {/* Category Header */}
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleCategory(node.category.id)}
                >
                  <div className="flex items-center gap-3">
                    {node.accounts.length > 0 ? (
                      expandedCategories[node.category.id] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                    
                    {getCategoryIcon(node.category.type)}
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {node.category.code} - {node.category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getCategoryTypeLabel(node.category.type)} • {node.accounts.length} حساب
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getCategoryTypeLabel(node.category.type)}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Accounts List */}
                {expandedCategories[node.category.id] && (
                  <div className="p-4 pt-0">
                    {node.accounts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>لا توجد حسابات في هذا التصنيف</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setSelectedCategory(node.category.id);
                            setIsAddAccountOpen(true);
                          }}
                        >
                          <Plus className="ml-2 h-4 w-4" />
                          إضافة حساب
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {node.accounts.map((account: Account) => (
                          <div 
                            key={account.id}
                            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {account.code}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{account.name}</h4>
                                <p className="text-sm text-gray-500">{account.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  {parseFloat(account.balance || '0').toLocaleString()} ر.س
                                </p>
                                <Badge 
                                  variant="secondary" 
                                  className={getAccountTypeColor(account.type)}
                                >
                                  {account.type === 'debit' ? 'مدين' : 'دائن'}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add Category Form Component
function AddCategoryForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/account-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/account-categories'] });
      toast({ title: 'تم إنشاء التصنيف بنجاح' });
      onClose();
    },
    onError: () => {
      toast({ title: 'خطأ في إنشاء التصنيف', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate({
      name,
      nameEn,
      code,
      type,
      level: 1,
      isActive: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>اسم التصنيف (عربي)</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>اسم التصنيف (إنجليزي)</Label>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>رمز التصنيف</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
        <div>
          <Label>نوع التصنيف</Label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger>
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assets">أصول</SelectItem>
              <SelectItem value="liabilities">خصوم</SelectItem>
              <SelectItem value="equity">حقوق الملكية</SelectItem>
              <SelectItem value="revenue">إيرادات</SelectItem>
              <SelectItem value="expenses">مصروفات</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit" disabled={createCategoryMutation.isPending}>
          {createCategoryMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء التصنيف'}
        </Button>
      </div>
    </form>
  );
}

// Add Account Form Component
function AddAccountForm({ categories, onClose }: { categories: AccountCategory[], onClose: () => void }) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create account');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({ title: 'تم إنشاء الحساب بنجاح' });
      onClose();
    },
    onError: () => {
      toast({ title: 'خطأ في إنشاء الحساب', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccountMutation.mutate({
      name,
      nameEn,
      code,
      categoryId: parseInt(categoryId),
      type,
      description,
      balance: '0.00',
      isActive: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>اسم الحساب (عربي)</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>اسم الحساب (إنجليزي)</Label>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>رمز الحساب</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
        <div>
          <Label>التصنيف</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category: AccountCategory) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.code} - {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>نوع الحساب</Label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger>
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debit">مدين</SelectItem>
              <SelectItem value="credit">دائن</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>الوصف</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit" disabled={createAccountMutation.isPending}>
          {createAccountMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
        </Button>
      </div>
    </form>
  );
}