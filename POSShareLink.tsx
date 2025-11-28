import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, 
  Copy, 
  ExternalLink, 
  QrCode,
  Store,
  Smartphone,
  Monitor,
  Globe,
  Users,
  Shield
} from "lucide-react";

export default function POSShareLink() {
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();

  // استخراج معرف الفرع واسمه من الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedBranchId = urlParams.get('branchId');
  const preSelectedBranchName = urlParams.get('branchName');

  // جلب الفروع
  const { data: branches = [] } = useQuery({
    queryKey: ["/api/branches"],
  });

  // تحديد الفرع المختار مسبقاً
  useEffect(() => {
    if (preSelectedBranchId) {
      setSelectedBranch(parseInt(preSelectedBranchId));
    }
  }, [preSelectedBranchId]);

  // إنشاء رابط نقاط البيع
  const generatePOSLink = (branchId: number) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/mobile-pos/${branchId}`;
  };

  // نسخ الرابط
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      toast({
        title: "تم نسخ الرابط بنجاح",
        description: "يمكنك الآن مشاركة الرابط مع أي شخص",
      });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      toast({
        title: "خطأ في النسخ",
        description: "لم يتم نسخ الرابط، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  // فتح الرابط في نافذة جديدة
  const openPOSLink = (branchId: number) => {
    const link = generatePOSLink(branchId);
    window.open(link, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <Share2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            مشاركة رابط نقاط البيع
            {preSelectedBranchName && (
              <span className="text-blue-600"> - {decodeURIComponent(preSelectedBranchName)}</span>
            )}
          </h1>
          <p className="text-gray-600 text-lg">أنشئ رابط مشاركة لنقاط البيع يمكن لأي شخص استخدامه</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <Globe className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">وصول مفتوح</h3>
              <p className="text-sm text-gray-600">لا يحتاج المستخدم لتسجيل دخول</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">متوافق مع الجوال</h3>
              <p className="text-sm text-gray-600">يعمل على جميع الأجهزة</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Shield className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">آمن ومحدود</h3>
              <p className="text-sm text-gray-600">وصول محدود لنقاط البيع فقط</p>
            </CardContent>
          </Card>
        </div>

        {/* Branch Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              اختر الفرع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(branches) && branches.map((branch: any) => (
                <Card 
                  key={branch.id} 
                  className={`cursor-pointer border-2 transition-all hover:shadow-lg ${
                    selectedBranch === branch.id 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setSelectedBranch(branch.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                        <p className="text-sm text-gray-500">كود: {branch.code}</p>
                      </div>
                      {selectedBranch === branch.id && (
                        <Badge className="bg-green-600">محدد</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Link Generation */}
        {selectedBranch && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                رابط نقاط البيع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generated Link */}
              <div>
                <Label htmlFor="pos-link">الرابط المولد</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="pos-link"
                    value={generatePOSLink(selectedBranch)}
                    readOnly
                    className="flex-1 bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(generatePOSLink(selectedBranch))}
                    className={`${copySuccess ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {copySuccess ? (
                      <>
                        <span className="mr-2">✓</span>
                        تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        نسخ
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => openPOSLink(selectedBranch)}
                  className="flex-1"
                  variant="outline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  فتح الرابط
                </Button>
                <Button
                  onClick={() => copyToClipboard(generatePOSLink(selectedBranch))}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  مشاركة الرابط
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">تعليمات الاستخدام:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• انسخ الرابط وشاركه مع الموظفين أو العملاء</li>
                  <li>• الرابط يعمل على أي جهاز بدون تسجيل دخول</li>
                  <li>• يمكن للمستخدم إضافة منتجات وإتمام عمليات البيع</li>
                  <li>• جميع العمليات محفوظة في النظام تلقائياً</li>
                </ul>
              </div>

              {/* Device Compatibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">الهواتف الذكية</h4>
                    <p className="text-sm text-green-700">متوافق مع جميع الهواتف</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">أجهزة الحاسوب</h4>
                    <p className="text-sm text-blue-700">يعمل على جميع المتصفحات</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedBranch && (
          <div className="text-center py-12">
            <Users className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">اختر فرعاً لإنشاء الرابط</h3>
            <p className="text-gray-400">حدد الفرع الذي تريد إنشاء رابط نقاط البيع له</p>
          </div>
        )}
      </div>
    </div>
  );
}