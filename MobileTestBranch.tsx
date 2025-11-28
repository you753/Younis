import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  DollarSign,
  ChevronLeft,
  Share2,
  Menu,
  X
} from 'lucide-react';

export default function MobileTestBranch() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // دالة مشاركة محسنة مع خيارات متعددة
  const shareBranchLink = () => {
    const branchUrl = `${window.location.origin}/mobile-test-branch`;
    
    // إذا كان الجهاز يدعم المشاركة المباشرة
    if (navigator.share) {
      navigator.share({
        title: 'نظام المحاسب الأعظم - فرع فاطمة الحزمي',
        text: 'جرب النظام المحسن للجوال مع واجهة سريعة ومبسطة',
        url: branchUrl
      }).then(() => {
        toast({
          title: "تم المشاركة! 🎉",
          description: "شارك الرابط بنجاح",
          duration: 2000,
        });
      }).catch(() => {
        // إذا فشلت المشاركة، انسخ الرابط
        copyToClipboard(branchUrl);
      });
    } else {
      // نسخ الرابط بطرق متعددة
      copyToClipboard(branchUrl);
    }
  };

  // دالة نسخ الرابط مع طرق احتياطية
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "تم نسخ الرابط! 📋",
          description: "جاهز للمشاركة في أي تطبيق",
          duration: 2000,
        });
      });
    } else {
      // طريقة احتياطية للجوال
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "تم نسخ الرابط! 📱",
        description: "جاهز للمشاركة (واتساب، تيليجرام، إلخ)",
        duration: 3000,
      });
    }
  };

  // أقسام مبسطة وسريعة
  const sections = [
    { id: 'dashboard', name: 'الرئيسية', icon: Home },
    { id: 'pos', name: 'نقاط البيع', icon: ShoppingCart },
    { id: 'products', name: 'المنتجات', icon: Package },
    { id: 'clients', name: 'العملاء', icon: Users },
    { id: 'reports', name: 'التقارير', icon: BarChart3 },
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
                  <Button 
                    variant="outline" 
                    className="h-16 flex-col bg-blue-50 border-blue-300 hover:bg-blue-100"
                    onClick={shareBranchLink}
                  >
                    <Share2 className="h-6 w-6 mb-2 text-blue-600" />
                    <span className="text-blue-700">مشاركة النظام</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* بطاقة المشاركة السريعة */}
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">شارك النظام مع الآخرين</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-blue-700 text-sm">
                  شارك هذا النظام المحسن للجوال مع الموظفين أو العملاء
                </p>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white justify-start"
                    onClick={() => {
                      const url = `${window.location.origin}/mobile-test-branch`;
                      const message = `جرب نظام المحاسب الأعظم المحسن للجوال:\n${url}`;
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    مشاركة عبر واتساب
                  </Button>
                  
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-white justify-start"
                    onClick={() => {
                      const url = `${window.location.origin}/mobile-test-branch`;
                      const message = `جرب نظام المحاسب الأعظم المحسن للجوال:\n${url}`;
                      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
                      window.open(telegramUrl, '_blank');
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    مشاركة عبر تيليجرام
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 justify-start"
                    onClick={shareBranchLink}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    نسخ الرابط للمشاركة
                  </Button>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs font-bold mb-1">الرابط المباشر:</p>
                  <div className="bg-gray-100 p-2 rounded text-xs break-all font-mono">
                    {window.location.origin}/mobile-test-branch
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const url = `${window.location.origin}/mobile-test-branch`;
                        const subject = 'نظام المحاسب الأعظم للجوال';
                        const body = `جرب النظام المحسن للجوال:\n\n${url}`;
                        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl);
                      }}
                    >
                      📧 إيميل
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={copyToClipboard.bind(null, `${window.location.origin}/mobile-test-branch`)}
                    >
                      📋 نسخ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات الفرع */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الفرع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>اسم الفرع:</strong> فاطمة الحزمي</div>
                  <div><strong>كود الفرع:</strong> 30</div>
                  <div><strong>المدير:</strong> أحمد السعدون</div>
                  <div><strong>المدينة:</strong> الرياض</div>
                  <div><strong>الحالة:</strong> <span className="text-green-600">نشط</span></div>
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
              <div className="space-y-4">
                <p>نظام نقاط البيع - جاهز للاستخدام</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  فتح نقطة بيع جديدة
                </Button>
              </div>
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
              <div className="space-y-3">
                <p>إدارة منتجات الفرع</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">عرض المنتجات</Button>
                  <Button variant="outline">إضافة منتج</Button>
                </div>
              </div>
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
              <div className="space-y-3">
                <p>إدارة عملاء الفرع</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">قائمة العملاء</Button>
                  <Button variant="outline">عميل جديد</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'reports':
        return (
          <Card>
            <CardHeader>
              <CardTitle>التقارير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p>تقارير الفرع المختلفة</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline">تقرير المبيعات</Button>
                  <Button variant="outline">تقرير المخزون</Button>
                  <Button variant="outline">تقرير العملاء</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

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
              <h1 className="font-bold text-lg">فاطمة الحزمي</h1>
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