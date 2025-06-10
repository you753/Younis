import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Edit,
  Trash2
} from 'lucide-react';

interface BranchSuppliersProps {
  branchId: number;
}

export default function BranchSuppliers({ branchId }: BranchSuppliersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/suppliers`],
    queryFn: async () => {
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('فشل في جلب الموردين');
      return response.json();
    }
  });

  const filteredSuppliers = suppliers.filter((supplier: any) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموردين - الفرع {branchId}</h1>
          <p className="text-gray-600">إدارة موردي هذا الفرع</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            تصدير Excel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="ml-2 h-4 w-4" />
            إضافة مورد جديد
          </Button>
        </div>
      </div>

      {/* شريط البحث */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في الموردين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات الموردين */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الموردين</p>
                <p className="text-xl font-bold">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">موردين نشطين</p>
                <p className="text-xl font-bold text-green-600">
                  {suppliers.filter((s: any) => s.isActive !== false).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">موردين جدد</p>
                <p className="text-xl font-bold text-orange-600">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المشتريات</p>
                <p className="text-xl font-bold text-purple-600">45,200 ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الموردين */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            قائمة الموردين - فرع {branchId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد موردين في هذا الفرع</h3>
              <p className="text-gray-500 mb-4">ابدأ بإضافة موردين خاصين بهذا الفرع</p>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة مورد جديد
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSuppliers.map((supplier: any) => (
                <div key={supplier.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Truck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          {supplier.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{supplier.phone}</span>
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{supplier.email}</span>
                            </div>
                          )}
                          {supplier.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{supplier.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={supplier.isActive !== false ? "default" : "secondary"}>
                        {supplier.isActive !== false ? "نشط" : "غير نشط"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}