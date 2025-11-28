import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Monitor,
  Power,
  PowerOff,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
  Home,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Share2
} from "lucide-react";

interface POSTerminal {
  id: number;
  name: string;
  code: string;
  location: string;
  isActive: boolean;
  isOnline: boolean;
  lastActivity: string;
  ipAddress: string;
  model: string;
  serialNumber: string;
  version: string;
}

export default function POSTerminals() {
  const { branchId } = useParams();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState<POSTerminal | null>(null);
  const [newTerminal, setNewTerminal] = useState({
    name: '',
    code: '',
    location: '',
    ipAddress: '',
    model: '',
    serialNumber: ''
  });

  // بيانات وهمية للمحطات (يمكن استبدالها بـ API حقيقي)
  const terminals: POSTerminal[] = [
    {
      id: 1,
      name: "محطة الكاشير الرئيسي",
      code: "MAIN-001",
      location: "المدخل الرئيسي",
      isActive: true,
      isOnline: true,
      lastActivity: "منذ دقيقتين",
      ipAddress: "192.168.1.100",
      model: "TouchScreen Pro",
      serialNumber: "TS-001-2024",
      version: "v2.1.5"
    },
    {
      id: 2,
      name: "محطة الكاشير الثانوي",
      code: "SEC-001",
      location: "الطابق الثاني",
      isActive: true,
      isOnline: false,
      lastActivity: "منذ 15 دقيقة",
      ipAddress: "192.168.1.101",
      model: "TouchScreen Lite",
      serialNumber: "TS-002-2024",
      version: "v2.1.3"
    },
    {
      id: 3,
      name: "محطة التوصيل السريع",
      code: "FAST-001",
      location: "منطقة التوصيل",
      isActive: false,
      isOnline: false,
      lastActivity: "منذ ساعتين",
      ipAddress: "192.168.1.102",
      model: "Mobile Terminal",
      serialNumber: "MT-001-2024",
      version: "v2.0.8"
    }
  ];

  const filteredTerminals = terminals.filter(terminal =>
    terminal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    terminal.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    terminal.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTerminal = () => {
    console.log('Adding terminal:', newTerminal);
    setShowAddDialog(false);
    setNewTerminal({
      name: '',
      code: '',
      location: '',
      ipAddress: '',
      model: '',
      serialNumber: ''
    });
  };

  const handleEditTerminal = (terminal: POSTerminal) => {
    setEditingTerminal(terminal);
    setNewTerminal({
      name: terminal.name,
      code: terminal.code,
      location: terminal.location,
      ipAddress: terminal.ipAddress,
      model: terminal.model,
      serialNumber: terminal.serialNumber
    });
  };

  const handleUpdateTerminal = () => {
    console.log('Updating terminal:', editingTerminal?.id, newTerminal);
    setEditingTerminal(null);
    setNewTerminal({
      name: '',
      code: '',
      location: '',
      ipAddress: '',
      model: '',
      serialNumber: ''
    });
  };

  const toggleTerminalStatus = (id: number) => {
    console.log('Toggling terminal status:', id);
  };

  const restartTerminal = (id: number) => {
    console.log('Restarting terminal:', id);
  };

  console.log('تحميل POSTerminals.tsx - المسار الخطأ');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* شريط علوي */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">إدارة المحطات</h1>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                فرع {branchId}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-3 w-3 ml-1" />
                {terminals.filter(t => t.isOnline).length} محطة متصلة
              </Badge>
              <Button 
                onClick={() => window.location.href = `/pos-share-link?branchId=${branchId}&branchName=${encodeURIComponent('فرع رقم ' + branchId)}`}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Share2 className="h-4 w-4 ml-1" />
                مشاركة رابط نقاط البيع
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = `/branch/${branchId}`}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                العودة للفرع
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  <p className="text-2xl font-bold text-gray-900">{terminals.length}</p>
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
                  <p className="text-2xl font-bold text-green-600">{terminals.filter(t => t.isOnline).length}</p>
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
                  <p className="text-2xl font-bold text-orange-600">{terminals.filter(t => !t.isOnline).length}</p>
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
                  <p className="text-2xl font-bold text-red-600">{terminals.filter(t => !t.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* شريط البحث والأدوات */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 ml-2" />
                قائمة المحطات
              </CardTitle>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-white text-blue-600 hover:bg-blue-50"
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* قائمة المحطات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTerminals.map((terminal) => (
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">النموذج</p>
                    <p className="text-sm text-gray-900">{terminal.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">الإصدار</p>
                    <p className="text-sm text-gray-900">{terminal.version}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">آخر نشاط</p>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Clock className="h-3 w-3 ml-1" />
                    {terminal.lastActivity}
                  </p>
                </div>

                <div className="flex space-x-2 space-x-reverse pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTerminal(terminal)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restartTerminal(terminal.id)}
                    disabled={!terminal.isOnline}
                    className="flex-1"
                  >
                    <RefreshCw className="h-3 w-3 ml-1" />
                    إعادة تشغيل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTerminalStatus(terminal.id)}
                    className={`flex-1 ${
                      terminal.isActive 
                        ? 'border-red-300 text-red-600 hover:bg-red-50' 
                        : 'border-green-300 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {terminal.isActive ? (
                      <PowerOff className="h-3 w-3 ml-1" />
                    ) : (
                      <Power className="h-3 w-3 ml-1" />
                    )}
                    {terminal.isActive ? 'تعطيل' : 'تفعيل'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* نافذة إضافة محطة جديدة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة محطة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم المحطة</label>
                <Input
                  value={newTerminal.name}
                  onChange={(e) => setNewTerminal({...newTerminal, name: e.target.value})}
                  placeholder="محطة الكاشير الرئيسي"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">كود المحطة</label>
                <Input
                  value={newTerminal.code}
                  onChange={(e) => setNewTerminal({...newTerminal, code: e.target.value})}
                  placeholder="MAIN-001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الموقع</label>
              <Input
                value={newTerminal.location}
                onChange={(e) => setNewTerminal({...newTerminal, location: e.target.value})}
                placeholder="المدخل الرئيسي"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">عنوان IP</label>
                <Input
                  value={newTerminal.ipAddress}
                  onChange={(e) => setNewTerminal({...newTerminal, ipAddress: e.target.value})}
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">النموذج</label>
                <Input
                  value={newTerminal.model}
                  onChange={(e) => setNewTerminal({...newTerminal, model: e.target.value})}
                  placeholder="TouchScreen Pro"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الرقم التسلسلي</label>
              <Input
                value={newTerminal.serialNumber}
                onChange={(e) => setNewTerminal({...newTerminal, serialNumber: e.target.value})}
                placeholder="TS-001-2024"
              />
            </div>

            <div className="flex space-x-3 space-x-reverse pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddTerminal}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة المحطة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة تعديل المحطة */}
      <Dialog open={!!editingTerminal} onOpenChange={() => setEditingTerminal(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المحطة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم المحطة</label>
                <Input
                  value={newTerminal.name}
                  onChange={(e) => setNewTerminal({...newTerminal, name: e.target.value})}
                  placeholder="محطة الكاشير الرئيسي"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">كود المحطة</label>
                <Input
                  value={newTerminal.code}
                  onChange={(e) => setNewTerminal({...newTerminal, code: e.target.value})}
                  placeholder="MAIN-001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الموقع</label>
              <Input
                value={newTerminal.location}
                onChange={(e) => setNewTerminal({...newTerminal, location: e.target.value})}
                placeholder="المدخل الرئيسي"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">عنوان IP</label>
                <Input
                  value={newTerminal.ipAddress}
                  onChange={(e) => setNewTerminal({...newTerminal, ipAddress: e.target.value})}
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">النموذج</label>
                <Input
                  value={newTerminal.model}
                  onChange={(e) => setNewTerminal({...newTerminal, model: e.target.value})}
                  placeholder="TouchScreen Pro"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الرقم التسلسلي</label>
              <Input
                value={newTerminal.serialNumber}
                onChange={(e) => setNewTerminal({...newTerminal, serialNumber: e.target.value})}
                placeholder="TS-001-2024"
              />
            </div>

            <div className="flex space-x-3 space-x-reverse pt-4">
              <Button
                variant="outline"
                onClick={() => setEditingTerminal(null)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleUpdateTerminal}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4 ml-2" />
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}