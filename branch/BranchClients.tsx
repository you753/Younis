import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Star, DollarSign, TrendingUp, Search, Plus, Eye, FileText, Download, Phone, Mail, MapPin, Printer, Edit } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface BranchClientsProps {
  branchId?: number;
}

export default function BranchClients({ branchId }: BranchClientsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // وظيفة طباعة كشف الحساب
  const printAccountStatement = (client: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب العميل - ${client.name}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            margin: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .client-info {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            padding: 15px;
            background-color: #f9f9f9;
          }
          .balance-summary {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            padding: 15px;
          }
          .transactions {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .transactions th, .transactions td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          .transactions th {
            background-color: #f5f5f5;
          }
          .debit { color: #d32f2f; }
          .credit { color: #388e3c; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>كشف حساب العميل</h1>
          <h2>${client.name}</h2>
          <p>كود العميل: ${client.code}</p>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}</p>
        </div>
        
        <div class="client-info">
          <h3>معلومات العميل:</h3>
          <p><strong>الاسم:</strong> ${client.name}</p>
          <p><strong>الهاتف:</strong> ${client.phone}</p>
          <p><strong>البريد الإلكتروني:</strong> ${client.email}</p>
          <p><strong>العنوان:</strong> ${client.address}</p>
          <p><strong>شخص الاتصال:</strong> ${client.contactPerson}</p>
          <p><strong>مندوب المبيعات:</strong> ${client.salesRepresentative}</p>
        </div>
        
        <div class="balance-summary">
          <h3>ملخص الحساب:</h3>
          <p><strong>الرصيد الافتتاحي:</strong> ${client.openingBalance.toLocaleString('en-US')} ريال</p>
          <p><strong>إجمالي المبيعات:</strong> ${client.totalSales.toLocaleString('en-US')} ريال</p>
          <p><strong class="debit">الرصيد الحالي:</strong> ${client.balance.toLocaleString('en-US')} ريال</p>
          <p><strong>حد الائتمان:</strong> ${client.creditLimit.toLocaleString('en-US')} ريال</p>
          <p><strong>شروط الدفع:</strong> ${client.paymentTerms}</p>
          <p><strong>معدل الخصم:</strong> ${client.discountRate}%</p>
        </div>
        
        <table class="transactions">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>رقم الفاتورة</th>
              <th>البيان</th>
              <th>مدين</th>
              <th>دائن</th>
              <th>الرصيد</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2025-01-01</td>
              <td>افتتاحي</td>
              <td>رصيد افتتاحي</td>
              <td class="debit">${client.openingBalance.toLocaleString('en-US')}</td>
              <td>-</td>
              <td>${client.openingBalance.toLocaleString('en-US')}</td>
            </tr>
            <tr>
              <td>${client.lastSaleDate}</td>
              <td>INV-001</td>
              <td>فاتورة مبيعات</td>
              <td class="debit">${(client.totalSales * 0.6).toLocaleString('en-US')}</td>
              <td>-</td>
              <td>${(client.openingBalance + client.totalSales * 0.6).toLocaleString('en-US')}</td>
            </tr>
            <tr>
              <td>${client.lastSaleDate}</td>
              <td>REC-001</td>
              <td>سند قبض</td>
              <td>-</td>
              <td class="credit">${(client.totalSales * 0.4).toLocaleString('en-US')}</td>
              <td class="debit">${client.balance.toLocaleString('en-US')}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 40px; text-align: center;" class="no-print">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1565C0; color: white; border: none; border-radius: 5px; cursor: pointer;">طباعة</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">إغلاق</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // بيانات تجريبية شاملة للعملاء
  const clients = [
    {
      id: 1,
      name: 'شركة النور التجارية المحدودة',
      code: 'CLI001',
      phone: '0556789012',
      email: 'info@alnoor.com',
      address: 'حي النهضة، شارع الملك عبد العزيز، الرياض',
      group: 'شركات',
      balance: 25000,
      openingBalance: 15000,
      totalSales: 125000,
      lastSaleDate: '2025-07-16',
      isActive: true,
      rating: 4.8,
      paymentTerms: '30 يوم',
      creditLimit: 50000,
      contactPerson: 'محمد النور',
      salesRepresentative: 'أحمد سالم',
      discountRate: 5,
      taxNumber: '123456789012345'
    },
    {
      id: 2,
      name: 'مؤسسة البركة للتجارة العامة',
      code: 'CLI002',
      phone: '0567890123',
      email: 'sales@albaraka.com',
      address: 'حي الملز، طريق الدائري الشرقي، الرياض',
      group: 'مؤسسات',
      balance: 18500,
      openingBalance: 8000,
      totalSales: 98000,
      lastSaleDate: '2025-07-15',
      isActive: true,
      rating: 4.5,
      paymentTerms: '15 يوم',
      creditLimit: 30000,
      contactPerson: 'عبد الله البركة',
      salesRepresentative: 'فاطمة أحمد',
      discountRate: 3,
      taxNumber: '987654321098765'
    },
    {
      id: 3,
      name: 'متجر الإلكترونيات الحديثة',
      code: 'CLI003',
      phone: '0578901234',
      email: 'orders@modern-electronics.com',
      address: 'حي العليا، مجمع الحاسوب، الرياض',
      group: 'تجزئة',
      balance: 12300,
      openingBalance: 5000,
      totalSales: 75000,
      lastSaleDate: '2025-07-14',
      isActive: true,
      rating: 4.2,
      paymentTerms: 'فوري',
      creditLimit: 20000,
      contactPerson: 'سارة الحديثة',
      salesRepresentative: 'محمد علي',
      discountRate: 2,
      taxNumber: '456789123456789'
    },
    {
      id: 4,
      name: 'شركة الأعمال المتكاملة',
      code: 'CLI004',
      phone: '0589012345',
      email: 'procurement@integrated-business.com',
      address: 'حي الوزارات، برج الأعمال، الرياض',
      group: 'شركات',
      balance: 32000,
      openingBalance: 20000,
      totalSales: 185000,
      lastSaleDate: '2025-07-13',
      isActive: true,
      rating: 4.9,
      paymentTerms: '45 يوم',
      creditLimit: 75000,
      contactPerson: 'خالد المتكامل',
      salesRepresentative: 'نورا يوسف',
      discountRate: 7,
      taxNumber: '789123456789123'
    },
    {
      id: 5,
      name: 'مكتبة العلم والمعرفة',
      code: 'CLI005',
      phone: '0590123456',
      email: 'info@knowledge-library.com',
      address: 'حي الجامعة، شارع التعليم، الرياض',
      group: 'تعليمية',
      balance: 5200,
      openingBalance: 2000,
      totalSales: 45000,
      lastSaleDate: '2025-07-12',
      isActive: false,
      rating: 3.8,
      paymentTerms: '7 أيام',
      creditLimit: 10000,
      contactPerson: 'أمينة العلم',
      salesRepresentative: 'عبد الرحمن خالد',
      discountRate: 1,
      taxNumber: '321654987321654'
    }
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'all' || client.group === filterGroup;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && client.isActive) ||
                         (filterStatus === 'inactive' && !client.isActive);
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const { currentPage, setCurrentPage, pageCount, paginatedData: paginatedClients, startIndex, endIndex } = usePagination({
    data: filteredClients,
    itemsPerPage: 10,
    resetTriggers: [searchTerm, filterGroup, filterStatus]
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        ✓ نشط
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        ✗ غير نشط
      </Badge>
    );
  };

  const getGroupBadge = (group: string) => {
    const groupColors: { [key: string]: string } = {
      'شركات': 'bg-blue-100 text-blue-800',
      'مؤسسات': 'bg-purple-100 text-purple-800',
      'تجزئة': 'bg-green-100 text-green-800',
      'تعليمية': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={`${groupColors[group] || 'bg-gray-100 text-gray-800'} hover:${groupColors[group] || 'bg-gray-100'}`}>
        {group}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-gray-600 mr-1">{rating}</span>
      </div>
    );
  };

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.isActive).length;
  const totalBalance = clients.reduce((sum, client) => sum + client.balance, 0);
  const totalSales = clients.reduce((sum, client) => sum + client.totalSales, 0);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>
          <p className="text-gray-600">إدارة قاعدة بيانات العملاء - رقم الفرع: {branchId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-blue-600">{totalClients}</p>
                <p className="text-xs text-blue-600">{activeClients} عميل نشط</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المديونية</p>
                <p className="text-2xl font-bold text-red-600">{totalBalance.toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-red-600">مستحقة التحصيل</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-green-600">{totalSales.toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-green-600">المبيعات التراكمية</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التقييم</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(clients.reduce((sum, c) => sum + c.rating, 0) / clients.length).toFixed(1)}
                </p>
                <p className="text-xs text-yellow-600">من 5.0 نجوم</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في العملاء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل المجموعات</option>
            <option value="شركات">شركات</option>
            <option value="مؤسسات">مؤسسات</option>
            <option value="تجزئة">تجزئة</option>
            <option value="تعليمية">تعليمية</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            تقرير العملاء
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            عميل جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-white border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">قائمة العملاء</CardTitle>
            <div className="text-sm text-gray-600">
              عرض {filteredClients.length} من أصل {clients.length} عميل
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right p-4 font-semibold text-gray-800">معلومات العميل</th>
                  <th className="text-right p-4 font-semibold text-gray-800">التواصل</th>
                  <th className="text-right p-4 font-semibold text-gray-800">المجموعة</th>
                  <th className="text-right p-4 font-semibold text-gray-800">الرصيد الحالي</th>
                  <th className="text-right p-4 font-semibold text-gray-800">إجمالي المبيعات</th>
                  <th className="text-right p-4 font-semibold text-gray-800">شروط الدفع</th>
                  <th className="text-right p-4 font-semibold text-gray-800">التقييم</th>
                  <th className="text-right p-4 font-semibold text-gray-800">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-800">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map((client, index) => (
                  <tr key={client.id} className="border-b hover:bg-blue-50/30 transition-colors bg-white">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-blue-600">{client.code}</div>
                      <div className="text-xs text-gray-500">{client.contactPerson}</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {client.address.slice(0, 30)}...
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getGroupBadge(client.group)}
                      <div className="text-xs text-gray-500 mt-1">
                        مندوب: {client.salesRepresentative}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-lg text-red-600">
                        {client.balance.toLocaleString('en-US')} ريال
                      </div>
                      <div className="text-xs text-gray-500">
                        افتتاحي: {client.openingBalance.toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-lg text-green-600">
                        {client.totalSales.toLocaleString('en-US')} ريال
                      </div>
                      <div className="text-xs text-gray-500">
                        آخر بيع: {client.lastSaleDate}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{client.paymentTerms}</div>
                      <div className="text-xs text-gray-500">
                        حد ائتماني: {client.creditLimit.toLocaleString('en-US')} ريال
                      </div>
                      <div className="text-xs text-blue-600">
                        خصم: {client.discountRate}%
                      </div>
                    </td>
                    <td className="p-4">
                      {getRatingStars(client.rating)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(client.isActive)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="عرض التفاصيل">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50" 
                          title="تعديل العميل"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0" 
                          title="طباعة كشف الحساب"
                          onClick={() => printAccountStatement(client)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="كشف حساب">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="تحميل PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-white border-t-2 border-gray-300">
                <tr className="font-bold">
                  <td className="p-4 text-gray-900" colSpan={3}>الإجمالي</td>
                  <td className="p-4 text-red-600 text-lg">
                    {filteredClients.reduce((sum, client) => sum + client.balance, 0).toLocaleString('en-US')} ريال
                  </td>
                  <td className="p-4 text-green-600 text-lg">
                    {filteredClients.reduce((sum, client) => sum + client.totalSales, 0).toLocaleString('en-US')} ريال
                  </td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملاء</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على عملاء يطابقون معايير البحث</p>
              <Button onClick={() => {setSearchTerm(''); setFilterGroup('all'); setFilterStatus('all');}}>
                مسح جميع الفلاتر
              </Button>
            </div>
          )}

          {filteredClients.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              totalItems={filteredClients.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              itemName="عميل"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}