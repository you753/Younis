import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, Users, UserCheck, UserX, CreditCard } from 'lucide-react';
import { insertClientSchema } from '@shared/schema';
import EnhancedEditForm from '@/components/forms/EnhancedEditForm';
import { useNotification } from '@/hooks/useNotification';
import { apiRequest } from '@/lib/queryClient';

export default function EnhancedClients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { success, error } = useNotification();

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Filter clients based on search
  const filteredClients = clients.filter((client: any) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.group?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalClients = clients.length;
  const activeClients = clients.filter((c: any) => c.status === 'active').length;
  const inactiveClients = clients.filter((c: any) => c.status === 'inactive').length;
  const totalBalance = clients.reduce((sum: number, c: any) => sum + parseFloat(c.openingBalance || 0), 0);

  // Form configuration
  const formFields = [
    { name: 'name', label: 'اسم العميل', type: 'text' as const, required: true, placeholder: 'أدخل اسم العميل' },
    { name: 'phone', label: 'رقم الهاتف', type: 'text' as const, required: true, placeholder: '05xxxxxxxx' },
    { name: 'email', label: 'البريد الإلكتروني', type: 'email' as const, placeholder: 'client@domain.com' },
    { name: 'address', label: 'العنوان', type: 'textarea' as const, placeholder: 'عنوان العميل' },
    { name: 'group', label: 'المجموعة', type: 'text' as const, placeholder: 'مجموعة العميل' },
    { name: 'openingBalance', label: 'الرصيد الافتتاحي', type: 'number' as const, placeholder: '0' },
    { name: 'creditLimit', label: 'حد الائتمان', type: 'number' as const, placeholder: '0' },
    { 
      name: 'accountType', 
      label: 'نوع الحساب', 
      type: 'select' as const, 
      options: [
        { value: 'cash', label: 'نقدي' },
        { value: 'credit', label: 'آجل' },
        { value: 'mixed', label: 'مختلط' }
      ]
    },
    { 
      name: 'status', 
      label: 'الحالة', 
      type: 'select' as const, 
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' }
      ]
    }
  ];

  const defaultValues = {
    name: '',
    phone: '',
    email: '',
    address: '',
    group: '',
    openingBalance: 0,
    creditLimit: 0,
    accountType: 'cash',
    status: 'active'
  };

  const handleEdit = (client: any) => {
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (clientId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    
    try {
      await apiRequest('DELETE', `/api/clients/${clientId}`, {});
      success('تم حذف العميل بنجاح');
      window.location.reload();
    } catch (err) {
      error('حدث خطأ أثناء حذف العميل');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    setTimeout(() => window.location.reload(), 500);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
      case 'inactive':
        return <Badge variant="destructive">غير نشط</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case 'cash':
        return <Badge variant="default">نقدي</Badge>;
      case 'credit':
        return <Badge variant="secondary">آجل</Badge>;
      case 'mixed':
        return <Badge className="bg-purple-100 text-purple-800">مختلط</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">جاري تحميل العملاء...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Statistics */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العملاء النشطين</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العملاء غير النشطين</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inactiveClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأرصدة</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <EnhancedEditForm
          title="العملاء"
          apiEndpoint="/api/clients"
          itemId={editingId}
          fields={formFields}
          schema={insertClientSchema}
          defaultValues={defaultValues}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Search and Clients List */}
      {!showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في العملاء..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'لا توجد عملاء يطابقون البحث' : 'لا توجد عملاء مُضافين'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم العميل</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المجموعة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع الحساب</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">حد الائتمان</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client: any) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          {client.email && (
                            <div className="text-sm text-gray-500">{client.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.group || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getAccountTypeBadge(client.accountType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(client.openingBalance || 0).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(client.creditLimit || 0).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(client.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(client)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(client.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}