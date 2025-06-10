import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BranchLayout from '@/components/layout/BranchLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  MapPin,
  User
} from 'lucide-react';

interface BranchClient {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  balance: string | null;
  createdAt: Date;
}

interface BranchClientsProps {
  params: { branchId: string };
}

export default function BranchClients({ params }: BranchClientsProps) {
  const branchId = parseInt(params.branchId);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // استرجاع عملاء الفرع
  const { data: clients = [], isLoading } = useQuery<BranchClient[]>({
    queryKey: [`/api/branches/${branchId}/clients`],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('فشل في جلب العملاء');
      return response.json();
    }
  });

  // تصفية العملاء
  const filteredClients = clients.filter(client => {
    return client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (client.phone || '').includes(searchTerm) ||
           (client.email || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  // حساب الإحصائيات
  const totalBalance = filteredClients.reduce((sum, client) => sum + parseFloat(client.balance || '0'), 0);
  const activeClients = filteredClients.filter(client => parseFloat(client.balance || '0') > 0);

  return (
    <BranchLayout branchId={branchId} title="إدارة العملاء">
      <div className="space-y-6">
        {/* شريط الأدوات */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              تصدير Excel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="ml-2 h-4 w-4" />
              إضافة عميل
            </Button>
          </div>
        </div>

        {/* إحصائيات العملاء */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي العملاء</p>
                  <p className="text-xl font-bold">{filteredClients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">عملاء نشطون</p>
                  <p className="text-xl font-bold text-green-600">{activeClients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي الأرصدة</p>
                  <p className="text-xl font-bold text-blue-600">{totalBalance.toFixed(2)} ر.س</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">لديهم هاتف</p>
                  <p className="text-xl font-bold text-orange-600">
                    {filteredClients.filter(c => c.phone).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* جدول العملاء */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              قائمة العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملاء</h3>
                <p className="text-gray-500 mb-4">لم يتم العثور على عملاء مطابقين للبحث</p>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة عميل جديد
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-4 font-medium text-gray-700">العميل</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">معلومات الاتصال</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">العنوان</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">الرصيد</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">تاريخ الإضافة</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => {
                      const balance = parseFloat(client.balance || '0');
                      const balanceColor = balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600';
                      
                      return (
                        <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{client.name}</div>
                              <div className="text-sm text-gray-500">ID: {client.id}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm space-y-1">
                              {client.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <span>{client.phone}</span>
                                </div>
                              )}
                              {client.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-gray-400" />
                                  <span>{client.email}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {client.address ? (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  <span>{client.address}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">غير محدد</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`font-medium ${balanceColor}`}>
                              {Math.abs(balance).toFixed(2)} ر.س
                              {balance > 0 && <span className="text-xs text-gray-500 block">دائن</span>}
                              {balance < 0 && <span className="text-xs text-gray-500 block">مدين</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {new Date(client.createdAt).toLocaleDateString('ar-SA')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BranchLayout>
  );
}