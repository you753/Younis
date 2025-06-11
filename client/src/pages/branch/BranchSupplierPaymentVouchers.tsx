import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  FileText, 
  Calendar,
  DollarSign,
  User,
  Edit,
  Eye,
  Download
} from 'lucide-react';

interface BranchSupplierPaymentVouchersProps {
  branchId: number;
}

interface PaymentVoucher {
  id: number;
  voucherNumber: string;
  supplierId: number;
  supplierName: string;
  amount: string | number;
  paymentDate: string;
  paymentMethod: string;
  notes: string | null;
  status: 'pending' | 'paid' | 'cancelled';
}

export default function BranchSupplierPaymentVouchers({ branchId }: BranchSupplierPaymentVouchersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: paymentVouchers = [], isLoading } = useQuery<PaymentVoucher[]>({
    queryKey: ['/api/supplier-payment-vouchers'],
    enabled: true
  });

  const filteredVouchers = paymentVouchers.filter(voucher =>
    voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوع';
      case 'pending':
        return 'في الانتظار';
      case 'cancelled':
        return 'ملغي';
      default:
        return 'غير محدد';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">سندات صرف الموردين</h1>
            <p className="text-gray-600">إدارة سندات صرف موردي الفرع {branchId}</p>
          </div>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => alert('سيتم إضافة وظيفة إنشاء سند صرف قريباً')}
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة سند صرف جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في سندات الصرف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredVouchers.length} سند
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVouchers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سندات صرف</h3>
              <p className="text-gray-500 mb-6">لم يتم العثور على أي سندات صرف مطابقة للبحث</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة أول سند صرف
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredVouchers.map((voucher) => (
                <Card key={voucher.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">سند رقم {voucher.voucherNumber}</h3>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(voucher.status)}>
                                {getStatusText(voucher.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{voucher.supplierName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span>{parseFloat(String(voucher.amount || '0')).toFixed(2)} ر.س</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{voucher.paymentDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>{voucher.paymentMethod}</span>
                          </div>
                        </div>

                        {voucher.notes && (
                          <div className="mt-2 text-sm text-gray-500">
                            <strong>ملاحظات:</strong> {voucher.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}