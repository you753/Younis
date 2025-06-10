import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Monitor,
  Settings,
  Database,
  Wifi,
  Shield,
  HardDrive,
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface BranchSystemProps {
  branchId: number;
}

export default function BranchSystem({ branchId }: BranchSystemProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: systemData } = useQuery({
    queryKey: [`/api/branches/${branchId}/system`],
    queryFn: async () => {
      return {
        systemStatus: 'online',
        lastUpdate: '2025-06-10 20:33:25',
        serverInfo: {
          cpu: 45,
          memory: 62,
          storage: 38,
          uptime: '15 يوم، 8 ساعات'
        },
        services: [
          { name: 'خدمة المبيعات', status: 'running', port: 3001 },
          { name: 'خدمة المخزون', status: 'running', port: 3002 },
          { name: 'قاعدة البيانات', status: 'running', port: 5432 },
          { name: 'خدمة التقارير', status: 'stopped', port: 3003 }
        ],
        backups: [
          { date: '2025-06-10', time: '02:00', status: 'success', size: '245 MB' },
          { date: '2025-06-09', time: '02:00', status: 'success', size: '243 MB' },
          { date: '2025-06-08', time: '02:00', status: 'failed', size: '0 MB' }
        ],
        connections: {
          activeUsers: 8,
          totalSessions: 15,
          networkStatus: 'stable'
        }
      };
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'online':
      case 'success':
      case 'stable':
        return 'text-green-600 bg-green-100';
      case 'stopped':
      case 'offline':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'online':
      case 'success':
      case 'stable':
        return <CheckCircle className="h-4 w-4" />;
      case 'stopped':
      case 'offline':
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">نظام إدارة منفصل - الفرع {branchId}</h1>
          <p className="text-gray-600">مراقبة وإدارة النظام المنفصل للفرع</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`ml-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Settings className="ml-2 h-4 w-4" />
            إعدادات النظام
          </Button>
        </div>
      </div>

      {/* حالة النظام العامة */}
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-green-200 p-3 rounded-full">
                <Monitor className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900">النظام يعمل بشكل طبيعي</h3>
                <p className="text-green-700">آخر تحديث: {systemData?.lastUpdate}</p>
              </div>
            </div>
            <Badge className={getStatusColor(systemData?.systemStatus || 'offline')}>
              {systemData?.systemStatus === 'online' ? 'متصل' : 'غير متصل'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات الخادم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Monitor className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">استخدام المعالج</p>
                <p className="text-xl font-bold">{systemData?.serverInfo?.cpu || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">استخدام الذاكرة</p>
                <p className="text-xl font-bold">{systemData?.serverInfo?.memory || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <HardDrive className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">مساحة التخزين</p>
                <p className="text-xl font-bold">{systemData?.serverInfo?.storage || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">المستخدمين النشطين</p>
                <p className="text-xl font-bold">{systemData?.connections?.activeUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* حالة الخدمات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              حالة الخدمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemData?.services?.map((service: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-600">المنفذ: {service.port}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status === 'running' ? 'يعمل' : 'متوقف'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* النسخ الاحتياطية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              النسخ الاحتياطية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemData?.backups?.map((backup: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(backup.status)}`}>
                      {getStatusIcon(backup.status)}
                    </div>
                    <div>
                      <p className="font-medium">{backup.date}</p>
                      <p className="text-sm text-gray-600">{backup.time} - {backup.size}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(backup.status)}>
                    {backup.status === 'success' ? 'نجح' : 'فشل'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* معلومات الاتصال */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            معلومات الاتصال والشبكة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="bg-blue-200 p-3 rounded-full inline-block mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-900">المستخدمين النشطين</h3>
              <p className="text-2xl font-bold text-blue-700">{systemData?.connections?.activeUsers || 0}</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="bg-green-200 p-3 rounded-full inline-block mb-3">
                <Monitor className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-green-900">إجمالي الجلسات</h3>
              <p className="text-2xl font-bold text-green-700">{systemData?.connections?.totalSessions || 0}</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="bg-purple-200 p-3 rounded-full inline-block mb-3">
                <Wifi className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-purple-900">حالة الشبكة</h3>
              <p className="text-lg font-bold text-purple-700">
                {systemData?.connections?.networkStatus === 'stable' ? 'مستقرة' : 'غير مستقرة'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات الخادم */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            معلومات الخادم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">وقت التشغيل</label>
              <p className="text-lg font-medium">{systemData?.serverInfo?.uptime}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">إصدار النظام</label>
              <p className="text-lg font-medium">v2.1.3</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">آخر إعادة تشغيل</label>
              <p className="text-lg font-medium">2025-05-25 14:30:00</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">حالة النظام</label>
              <Badge className={getStatusColor(systemData?.systemStatus || 'offline')}>
                {systemData?.systemStatus === 'online' ? 'متصل ويعمل' : 'غير متصل'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}