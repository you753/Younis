import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Tags, 
  Edit,
  Trash2,
  Building
} from 'lucide-react';

interface BranchSupplierCategoriesProps {
  branchId: number;
}

const categories = [
  { id: 1, name: 'موردين أقمشة', description: 'موردين الأقمشة والخامات', suppliersCount: 5, isActive: true },
  { id: 2, name: 'موردين خيوط', description: 'موردين الخيوط والخامات المساعدة', suppliersCount: 3, isActive: true },
  { id: 3, name: 'موردين أزرار', description: 'موردين الأزرار والإكسسوارات', suppliersCount: 2, isActive: false },
];

export default function BranchSupplierCategories({ branchId }: BranchSupplierCategoriesProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tags className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">فئات الموردين</h1>
            <p className="text-gray-600">إدارة فئات موردي الفرع {branchId}</p>
          </div>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => alert('سيتم إضافة وظيفة إضافة فئة جديدة قريباً')}
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة فئة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في فئات الموردين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredCategories.length} فئة
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Tags className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فئات</h3>
              <p className="text-gray-500 mb-6">لم يتم العثور على أي فئات مطابقة للبحث</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة أول فئة
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Tags className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-500">{category.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="h-4 w-4" />
                            <span>{category.suppliersCount} مورد</span>
                          </div>
                          <Badge 
                            variant={category.isActive ? "default" : "secondary"}
                            className={category.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                          >
                            {category.isActive ? 'نشطة' : 'غير نشطة'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
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