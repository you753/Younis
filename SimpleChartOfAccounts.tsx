import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { 
  TreePine, 
  ChevronRight, 
  ChevronDown,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';

interface AccountCategory {
  id: number;
  name: string;
  nameEn?: string;
  code: string;
  type: string;
  parentId?: number;
  level: number;
  isActive: boolean;
  createdAt: string;
}

interface Account {
  id: number;
  name: string;
  nameEn?: string;
  code: string;
  categoryId: number;
  type: string;
  balance: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export default function SimpleChartOfAccounts() {
  const { setCurrentPage } = useAppStore();
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setCurrentPage('شجرة الحسابات');
  }, [setCurrentPage]);

  // Fetch data using direct SQL queries to avoid schema issues
  const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['account-categories-sql'],
    queryFn: async () => {
      const response = await fetch('/api/sql-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'SELECT * FROM account_categories ORDER BY code'
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const { data: accountsData = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts-sql'],
    queryFn: async () => {
      const response = await fetch('/api/sql-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'SELECT * FROM accounts ORDER BY code'
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return response.json();
    },
  });

  const categories: AccountCategory[] = categoriesData;
  const accounts: Account[] = accountsData;

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
          <p className="text-gray-600">عرض الحسابات المحاسبية والتصنيفات</p>
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
            {categories.map((category) => {
              const categoryAccounts = accounts.filter((account: Account) => account.categoryId === category.id);
              
              return (
                <div key={category.id} className="border border-gray-200 rounded-lg">
                  {/* Category Header */}
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center gap-3">
                      {categoryAccounts.length > 0 ? (
                        expandedCategories[category.id] ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      
                      {getCategoryIcon(category.type)}
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {category.code} - {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getCategoryTypeLabel(category.type)} • {categoryAccounts.length} حساب
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getCategoryTypeLabel(category.type)}
                      </Badge>
                    </div>
                  </div>

                  {/* Accounts List */}
                  {expandedCategories[category.id] && (
                    <div className="p-4 pt-0">
                      {categoryAccounts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>لا توجد حسابات في هذا التصنيف</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {categoryAccounts.map((account: Account) => (
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
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}