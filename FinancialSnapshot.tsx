import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Download, 
  Copy, 
  Mail, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FinancialSnapshotProps {
  branchId?: number;
  companyWide?: boolean;
}

export default function FinancialSnapshot({ branchId, companyWide = false }: FinancialSnapshotProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 30000,
  });

  // Fetch recent sales
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
    staleTime: 30000,
  });

  // Fetch client payments
  const { data: clientPayments = [] } = useQuery({
    queryKey: ['/api/client-receipt-vouchers'],
    staleTime: 30000,
  });

  // Fetch supplier payments
  const { data: supplierPayments = [] } = useQuery({
    queryKey: ['/api/supplier-payment-vouchers'],
    staleTime: 30000,
  });

  const generateSnapshot = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('financial-snapshot-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: 600
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Generate unique snapshot ID
      const snapshotId = `snapshot-${Date.now()}`;
      const currentDate = new Date().toLocaleDateString('en-GB');
      
      // Create downloadable PDF
      const pdf = new jsPDF('l', 'mm', 'a4');
      pdf.setFontSize(18);
      pdf.text(`لقطة مالية ${companyWide ? 'للشركة' : `للفرع ${branchId}`} - ${currentDate}`, 148, 20, { align: 'center' });
      
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);
      
      // Generate shareable link
      const shareableUrl = `${window.location.origin}/snapshot/${snapshotId}`;
      setShareUrl(shareableUrl);
      
      pdf.save(`لقطة-مالية-${snapshotId}.pdf`);
    } catch (error) {
      console.error('Error generating snapshot:', error);
      alert('حدث خطأ أثناء إنشاء اللقطة المالية');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('تم نسخ الرابط بنجاح');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`لقطة مالية ${companyWide ? 'للشركة' : `للفرع ${branchId}`}`);
    const body = encodeURIComponent(`مرفق لقطة مالية محدثة:\n\n${shareUrl}\n\nتاريخ الإنشاء: ${new Date().toLocaleDateString('en-GB')}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`لقطة مالية ${companyWide ? 'للشركة' : `للفرع ${branchId}`}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`);
  };

  // Calculate financial metrics
  const totalSales = Array.isArray(sales) ? sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0) : 0;
  const totalClientPayments = Array.isArray(clientPayments) ? clientPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || 0), 0) : 0;
  const totalSupplierPayments = Array.isArray(supplierPayments) ? supplierPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || 0), 0) : 0;
  const netCashFlow = totalClientPayments - totalSupplierPayments;

  const currentDate = new Date().toLocaleDateString('en-GB');
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Snapshot Generation Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              <CardTitle>لقطة مالية سريعة</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={generateSnapshot}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'جاري الإنشاء...' : 'إنشاء لقطة'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {shareUrl && (
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">رابط المشاركة:</p>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                />
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={shareViaEmail}>
                  <Mail className="h-4 w-4 mr-1" />
                  بريد إلكتروني
                </Button>
                <Button variant="outline" size="sm" onClick={shareViaWhatsApp}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  واتساب
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Financial Snapshot Content */}
      <div id="financial-snapshot-content" className="bg-white p-6 rounded-lg border">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            لقطة مالية {companyWide ? 'للشركة' : `للفرع ${branchId}`}
          </h2>
          <p className="text-gray-600">
            {currentDate} - {currentTime}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">إجمالي المبيعات</p>
            <p className="text-xl font-bold text-blue-600">{totalSales.toFixed(2)} ر.س</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">المدفوعات الواردة</p>
            <p className="text-xl font-bold text-green-600">{totalClientPayments.toFixed(2)} ر.س</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <TrendingDown className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">المدفوعات الصادرة</p>
            <p className="text-xl font-bold text-orange-600">{totalSupplierPayments.toFixed(2)} ر.س</p>
          </div>
          
          <div className={`p-4 rounded-lg text-center ${netCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <BarChart3 className={`h-8 w-8 mx-auto mb-2 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <p className="text-sm text-gray-600">صافي التدفق النقدي</p>
            <p className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netCashFlow.toFixed(2)} ر.س
            </p>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المبيعات الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(sales) && sales.length > 0 ? (
                <div className="space-y-2">
                  {sales.slice(0, 3).map((sale: any) => (
                    <div key={sale.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">فاتورة #{sale.id}</span>
                      <span className="font-medium">{parseFloat(sale.total).toFixed(2)} ر.س</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد مبيعات حديثة</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المدفوعات الحديثة</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(clientPayments) && clientPayments.length > 0 ? (
                <div className="space-y-2">
                  {clientPayments.slice(0, 3).map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">سند #{payment.voucherNumber?.slice(-4)}</span>
                      <Badge variant={payment.status === 'received' ? 'default' : 'secondary'}>
                        {parseFloat(payment.amount).toFixed(2)} ر.س
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد مدفوعات حديثة</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
          تم إنشاء هذه اللقطة تلقائياً
        </div>
      </div>
    </div>
  );
}