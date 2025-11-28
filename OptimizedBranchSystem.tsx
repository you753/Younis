import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  Menu,
  X,
  DollarSign,
  TrendingUp,
  Star,
  Search,
  Bell,
  User,
  ChevronLeft,
  Share2,
  Monitor,
  ShoppingBag
} from 'lucide-react';

interface OptimizedBranchProps {
  branchId: number;
}

export default function OptimizedBranchSystem({ branchId }: OptimizedBranchProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // جلب البيانات مع تحسين للسرعة ومعالجة الأخطاء
  const { data: branch, isLoading, error } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 دقائق
  });

  // بيانات تجريبية في حالة عدم وجود الفرع
  const mockBranch = {
    id: branchId,
    name: `الفرع رقم ${branchId}`,
    code: `BR-${branchId}`,
    status: 'active',
    manager: 'مدير الفرع',
    city: 'الرياض'
  };

  const currentBranch = branch || mockBranch;

  // دالة مشاركة محسنة
  const shareBranchLink = () => {
    const branchUrl = `${window.location.origin}/optimized-branch/${branchId}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(branchUrl).then(() => {
        toast({
          title: "تم نسخ الرابط! 🚀",
          description: "رابط سريع ومحسن للجوال",
          duration: 2000,
        });
      });
    } else {
      // طريقة احتياطية للجوال
      const textArea = document.createElement('textarea');
      textArea.value = branchUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "تم نسخ الرابط! 📱",
        description: "جاهز للمشاركة",
      });
    }
  };

  // أقسام مبسطة وسريعة
  const sections = [
    { id: 'dashboard', name: 'الرئيسية', icon: Home },
    { id: 'pos', name: 'نقاط البيع', icon: Monitor },
    { id: 'sales', name: 'المبيعات', icon: ShoppingCart },
    { id: 'products', name: 'المنتجات', icon: Package },
    { id: 'clients', name: 'العملاء', icon: Users },
  ];

  // محتوى مبسط وسريع
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            {/* بطاقات سريعة ومحسنة */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">المبيعات اليوم</p>
                      <p className="text-2xl font-bold">12,450 ر.س</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">الطلبات</p>
                      <p className="text-2xl font-bold">28</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* إجراءات سريعة */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-16 flex-col">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    <span>بيع سريع</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col">
                    <Package className="h-6 w-6 mb-2" />
                    <span>إضافة منتج</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    <span>عميل جديد</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span>التقارير</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'pos':
        return (
          <Card>
            <CardHeader>
              <CardTitle>نقاط البيع</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                نظام نقاط البيع - قريباً
              </p>
            </CardContent>
          </Card>
        );
      case 'sales':
        return (
          <Card>
            <CardHeader>
              <CardTitle>المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                قائمة المبيعات - قريباً
              </p>
            </CardContent>
          </Card>
        );
      case 'products':
        return (
          <Card>
            <CardHeader>
              <CardTitle>المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                إدارة المنتجات - قريباً
              </p>
            </CardContent>
          </Card>
        );
      case 'clients':
        return (
          <Card>
            <CardHeader>
              <CardTitle>العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                إدارة العملاء - قريباً
              </p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-600 font-semibold">جاري تحميل الفرع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* رأس الصفحة المحسن للجوال */}
      <header className="bg-black text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 p-2 rounded-full">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{currentBranch.name}</h1>
              <p className="text-xs text-amber-300">نظام محسن للجوال</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={shareBranchLink}
              className="text-blue-400 hover:bg-blue-900"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = '/'}
              className="text-red-400 hover:bg-red-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-amber-400 hover:bg-amber-900 md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* قائمة التنقل السريع للجوال */}
        {isMobileMenuOpen && (
          <div className="mt-4 pb-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  className={`justify-start text-right h-12 ${
                    activeSection === section.id 
                      ? 'bg-amber-800 text-amber-300' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setActiveSection(section.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <section.icon className="h-5 w-5 ml-2" />
                  {section.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* التنقل السفلي للجوال */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
        <div className="grid grid-cols-5 gap-1">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              size="sm"
              className={`flex-col h-16 p-1 ${
                activeSection === section.id 
                  ? 'text-amber-600 bg-amber-50' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{section.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <main className="p-4 pb-20 md:pb-4">
        {renderContent()}
      </main>

      {/* الشريط الجانبي للأجهزة الكبيرة */}
      <div className="hidden md:flex">
        <nav className="fixed left-0 top-0 h-full w-64 bg-black text-white p-4">
          <div className="space-y-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                className={`w-full justify-start text-right ${
                  activeSection === section.id 
                    ? 'bg-amber-800 text-amber-300' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="h-5 w-5 ml-3" />
                {section.name}
              </Button>
            ))}
          </div>
        </nav>
        <div className="ml-64 flex-1">
          <main className="p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}