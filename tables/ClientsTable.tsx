import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, UserCheck, Plus } from 'lucide-react';
import type { Client } from '@shared/schema';

interface ClientsTableProps {
  onAddClient?: () => void;
}

export default function ClientsTable({ onAddClient }: ClientsTableProps) {
  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      success('تم حذف العميل بنجاح');
    },
    onError: () => {
      error('حدث خطأ أثناء حذف العميل');
    }
  });

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteClientMutation.mutate(id);
    }
  };

  const getGroupBadge = (group: string | null) => {
    if (!group) return <Badge variant="outline">غير محدد</Badge>;
    
    const groupMap = {
      vip: { label: 'عملاء مميزون', variant: 'default' as const },
      regular: { label: 'عملاء عاديون', variant: 'secondary' as const },
      wholesale: { label: 'عملاء جملة', variant: 'outline' as const }
    };
    
    const groupInfo = groupMap[group as keyof typeof groupMap] || { label: group, variant: 'outline' as const };
    return <Badge variant={groupInfo.variant}>{groupInfo.label}</Badge>;
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملاء</h3>
          <p className="text-gray-500">قم بإضافة العملاء من النموذج أعلاه</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">قائمة العملاء</h3>
        {onAddClient && (
          <Button 
            onClick={onAddClient}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة عميل
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم العميل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم الهاتف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                البريد الإلكتروني
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المجموعة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الرصيد
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {client.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getGroupBadge(client.group)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 arabic-numbers">
                  {formatCurrency(client.balance || '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(client.id)}
                    disabled={deleteClientMutation.isPending}
                    className="text-red-600 hover:text-red-900 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
