import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FolderOpen, Eye, Edit, Trash2 } from 'lucide-react';

export default function ProductCategories() {
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setCurrentPage('فئات الأصناف');
  }, [setCurrentPage]);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/product-categories'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  if (isLoading) {
    return <div className="p-6">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FolderOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">فئات الأصناف</h2>
              <p className="text-gray-600">إدارة وتصنيف فئات المنتجات</p>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            إضافة فئة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">إجمالي الفئات</p>
                <p className="text-2xl font-bold text-indigo-700">0</p>
              </div>
              <div className="bg-indigo-200 p-3 rounded-full">
                <FolderOpen className="h-6 w-6 text-indigo-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-blue-700">{Array.isArray(products) ? products.length : 0}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <FolderOpen className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">فئات نشطة</p>
                <p className="text-2xl font-bold text-green-700">0</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <FolderOpen className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة فئات الأصناف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">كود الفئة</TableHead>
                  <TableHead className="text-right">اسم الفئة</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">عدد المنتجات</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    لا توجد فئات أصناف حالياً
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}