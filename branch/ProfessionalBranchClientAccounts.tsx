import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Search, 
  UserCheck,
  CreditCard,
  Banknote,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';

interface ProfessionalBranchClientAccountsProps {
  branchId?: number;
}

export default function ProfessionalBranchClientAccounts({ branchId }: ProfessionalBranchClientAccountsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);

  // بيانات العملاء المحدثة مع الأرصدة
  const clients = [
    {
      id: 1,
      name: 'شركة النور التجارية',
      code: 'CLI001',
      phone: '0567537599',
      email: 'info@noor-trading.com',
      address: 'جدة البغدادية الشرقية',
      openingBalance: 0,
      currentBalance: 5000,
      status: 'نشط'
    },
    {
      id: 2,
      name: 'مؤسسة البركة',
      code: 'CLI002', 
      phone: '0501234567',
      email: 'info@albaraka.com',
      address: 'الرياض الملز',
      openingBalance: 8000,
      currentBalance: -2000,
      status: 'نشط'
    },
    {
      id: 3,
      name: 'متجر الهدى',
      code: 'CLI003',
      phone: '0559876543', 
      email: 'contact@alhuda.com',
      address: 'الدمام الفيصلية',
      openingBalance: 10000,
      currentBalance: 12500,
      status: 'نشط'
    },
    {
      id: 4,
      name: 'شركة الأمل للتجارة',
      code: 'CLI004',
      phone: '0512345678',
      email: 'sales@alamal.com',
      address: 'مكة العزيزية',
      openingBalance: 5000,
      currentBalance: 0,
      status: 'نشط'
    },
    {
      id: 5,
      name: 'مؤسسة الفجر',
      code: 'CLI005',
      phone: '0598765432',
      email: 'info@alfajr.com',
      address: 'المدينة الحرم',
      openingBalance: 15000,
      currentBalance: 22000,
      status: 'نشط'
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // إحصائيات العملاء
  const totalClients = clients.length;
  const totalOpeningBalance = clients.reduce((sum, client) => sum + client.openingBalance, 0);
  const totalCurrentBalance = clients.reduce((sum, client) => sum + client.currentBalance, 0);
  const debtorClients = clients.filter(client => client.currentBalance < 0).length;

  return (
    <div className="min-h-screen bg-white p-6">
      {/* العنوان الرئيسي */}
      <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-black" />
          <h1 className="text-3xl font-bold text-black">حسابات العملاء</h1>
        </div>
        <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-white text-black hover:bg-gray-100 shadow-lg px-6 py-3 rounded-lg font-bold border-2 border-black"
            >
              <Plus className="ml-2 h-5 w-5" />
              عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-3 border-yellow-400 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black font-bold text-xl">إضافة عميل جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <Input placeholder="اسم العميل" className="border-2 border-gray-300 focus:border-yellow-400" />
              <Input placeholder="رمز العميل" className="border-2 border-gray-300 focus:border-yellow-400" />
              <Input placeholder="رقم الهاتف" className="border-2 border-gray-300 focus:border-yellow-400" />
              <Input placeholder="البريد الإلكتروني" className="border-2 border-gray-300 focus:border-yellow-400" />
              <Input placeholder="العنوان" className="border-2 border-gray-300 focus:border-yellow-400" />
              <Input placeholder="الرصيد الافتتاحي" type="number" className="border-2 border-gray-300 focus:border-yellow-400" />
              <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-bold">
                حفظ العميل
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-3 border-yellow-400 shadow-xl">
          <CardContent className="p-6 text-center bg-gradient-to-br from-yellow-100 to-yellow-200">
            <Users className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-black mb-2">إجمالي العملاء</h3>
            <p className="text-3xl font-bold text-yellow-600">{totalClients}</p>
          </CardContent>
        </Card>

        <Card className="border-3 border-green-400 shadow-xl">
          <CardContent className="p-6 text-center bg-gradient-to-br from-green-100 to-green-200">
            <CreditCard className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-black mb-2">الأرصدة الافتتاحية</h3>
            <p className="text-2xl font-bold text-green-600">{totalOpeningBalance.toLocaleString()} ر.س</p>
          </CardContent>
        </Card>

        <Card className="border-3 border-blue-400 shadow-xl">
          <CardContent className="p-6 text-center bg-gradient-to-br from-blue-100 to-blue-200">
            <Banknote className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-black mb-2">الأرصدة الحالية</h3>
            <p className="text-2xl font-bold text-blue-600">{Math.abs(totalCurrentBalance).toLocaleString()} ر.س</p>
          </CardContent>
        </Card>

        <Card className="border-3 border-red-400 shadow-xl">
          <CardContent className="p-6 text-center bg-gradient-to-br from-red-100 to-red-200">
            <UserCheck className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-black mb-2">عملاء مدينون</h3>
            <p className="text-3xl font-bold text-red-600">{debtorClients}</p>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث */}
      <Card className="mb-8 border-3 border-yellow-400 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-500">
          <CardTitle className="text-black font-bold text-xl flex items-center gap-2">
            <Search className="h-6 w-6" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="البحث عن عميل بالاسم أو الرمز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 border-2 border-yellow-300 focus:border-yellow-500 rounded-lg text-lg py-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* قائمة العملاء */}
      <Card className="border-3 border-yellow-400 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-500">
          <CardTitle className="text-black font-bold text-xl">قائمة العملاء</CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-b-3 border-yellow-600">
                  <th className="px-6 py-4 text-center font-bold text-black text-lg border-r border-yellow-600">الرمز</th>
                  <th className="px-6 py-4 text-right font-bold text-black text-lg border-r border-yellow-600">اسم العميل</th>
                  <th className="px-6 py-4 text-center font-bold text-black text-lg border-r border-yellow-600">الهاتف</th>
                  <th className="px-6 py-4 text-center font-bold text-black text-lg border-r border-yellow-600">الرصيد الافتتاحي</th>
                  <th className="px-6 py-4 text-center font-bold text-black text-lg border-r border-yellow-600">الرصيد الحالي</th>
                  <th className="px-6 py-4 text-center font-bold text-black text-lg border-r border-yellow-600">الحالة</th>
                  <th className="px-6 py-4 text-center font-bold text-black text-lg">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
                  <tr key={client.id} className={`border-b hover:bg-yellow-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-100 text-black px-3 py-1 rounded-lg font-bold text-sm border border-gray-300">
                        {client.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <p className="font-bold text-black text-lg">{client.name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {client.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-black font-semibold">
                        <Phone className="h-4 w-4 text-gray-600" />
                        {client.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg px-4 py-2 inline-block">
                        <span className="font-bold text-yellow-700 text-lg">
                          {client.openingBalance.toLocaleString()} ر.س
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`rounded-lg px-4 py-2 inline-block border-2 ${
                        client.currentBalance >= 0 
                          ? 'bg-green-100 border-green-400' 
                          : 'bg-red-100 border-red-400'
                      }`}>
                        <span className={`font-bold text-lg ${
                          client.currentBalance >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {Math.abs(client.currentBalance).toLocaleString()} ر.س
                        </span>
                        <span className="text-xs block text-gray-600 font-normal">
                          {client.currentBalance >= 0 ? 'دائن' : 'مدين'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-green-100 text-green-800 border border-green-300 px-3 py-1 font-bold">
                        {client.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-md"
                          title="عرض"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-lg shadow-md"
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-md"
                          title="حذف"
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
        </CardContent>
      </Card>
    </div>
  );
}