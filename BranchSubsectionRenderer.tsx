import React from 'react';




// استيراد صفحات النظام الرئيسي للمبيعات
import SalesInvoices from '@/pages/SalesInvoices';

import SalesReturns from '@/pages/SalesReturns';
import GoodsIssue from '@/pages/GoodsIssue';
import SalesReports from '@/pages/reports/SalesReports';
import TaxCalculator from '@/pages/TaxCalculator';





import Purchases from '@/pages/Purchases';
import PurchaseReturns from '@/pages/PurchaseReturns';
import SimpleGoodsReceiptVoucher from '@/pages/SimpleGoodsReceiptVoucher';
import GoodsReceipt from '@/pages/GoodsReceipt';

// استيراد صفحات التقارير المهنية للفروع
import BranchSuppliersReport from '@/pages/branch/reports/BranchSuppliersReport';
import BranchClientsReport from '@/pages/branch/reports/BranchClientsReport';
import BranchSalesReport from '@/pages/branch/reports/BranchSalesReport';
import BranchPurchasesReport from '@/pages/branch/reports/BranchPurchasesReport';

import BranchEmployeesReport from '@/pages/branch/reports/BranchEmployeesReport';
import BranchFinancialReport from '@/pages/branch/reports/BranchFinancialReport';
import BranchInventoryReport from '@/pages/branch/reports/BranchInventoryReport';
import BranchWarehouseReport from '@/pages/branch/reports/BranchWarehouseReport';
import BranchProductsReport from '@/pages/branch/reports/BranchProductsReport';

import BranchSales from '@/pages/branch/BranchSales';
import BranchInventory from '@/pages/branch/BranchInventory';
import BranchEmployeesProfessionalSimple from '@/pages/branch/BranchEmployeesProfessionalSimple';
import BranchSuppliersManagement from '@/pages/branch/BranchSuppliersManagement';
import BranchSupplierAccounts from '@/pages/branch/BranchSupplierAccounts';
import BranchSupplierPayments from '@/pages/branch/BranchSupplierPayments';
import BranchSupplierOrders from '@/pages/branch/BranchSupplierOrders';
import ProfessionalSupplierStatement from '@/pages/branch/ProfessionalSupplierStatement';
import EnhancedBranchClients from '@/pages/branch/EnhancedBranchClients';
import BranchClientAccounts from '@/pages/branch/BranchClientAccounts';
import ProfessionalClientStatement from '@/pages/branch/ProfessionalClientStatement';
import EnhancedBranchClientPayments from '@/pages/branch/EnhancedBranchClientPayments';
import BranchClientOrders from '@/pages/branch/BranchClientOrders';
import BranchProducts from '@/pages/branch/BranchProducts';
import BranchProductCategories from '@/pages/branch/BranchProductCategories';
import BranchProductBarcode from '@/pages/branch/BranchProductBarcode';
import BranchPriceQuote from '@/pages/branch/BranchPriceQuote';
import BranchGoodsIssue from '@/pages/branch/BranchGoodsIssue';
import BranchSalesReceiptVouchers from '@/pages/branch/BranchSalesReceiptVouchers';
import BranchWarehouse from '@/pages/branch/BranchWarehouse';
import BranchInventoryManagement from '@/pages/branch/BranchInventoryManagement';

import BranchInventoryAlerts from '@/pages/branch/BranchInventoryAlerts';
import BranchInventorySettings from '@/pages/branch/BranchInventorySettings';
import DeductionsSimple from '@/pages/DeductionsSimple';
import BranchAdvancedInventory from '@/pages/branch/BranchAdvancedInventory';
import BranchStockTransfer from '@/pages/branch/BranchStockTransfer';
import BranchInventoryStatus from '@/pages/branch/BranchInventoryStatus';
import NewInventoryStatus from '@/pages/branch/NewInventoryStatus';
import BranchInventoryCount from '@/pages/branch/BranchInventoryCount';
import BranchInventoryTransfers from '@/pages/branch/BranchInventoryTransfers';
import NewBranchTransfers from '@/pages/branch/NewBranchTransfers';
import BranchHolidays from '@/pages/branch/BranchHolidays';

import BranchEmployeeDebts from '@/pages/branch/BranchEmployeeDebts';
import BranchSalaries from '@/pages/branch/BranchSalaries';
import BranchEmployeeStatement from '@/pages/branch/BranchEmployeeStatement';
import BranchEmployeeDeductions from '@/pages/branch/BranchEmployeeDeductions';
import DeductionsList from '@/pages/branch/DeductionsList';
import BranchEmployeesLink from '@/pages/branch/BranchEmployeesLink';
import UltimateInventorySystem from '@/pages/branch/UltimateInventorySystem';
import BranchOpeningBalance from '@/pages/branch/BranchOpeningBalance';
import BranchDashboard from '@/pages/branch/BranchDashboard';
import BranchDailyExpenses from '@/pages/branch/BranchDailyExpenses';
import BranchPermissions from '@/pages/branch/BranchPermissions';
import ProtectedSection from '@/components/ProtectedSection';

// خريطة الأقسام الفرعية للصلاحيات
const SECTION_PERMISSIONS_MAP: Record<string, string> = {
  // الأصناف
  'products': 'products',
  'products-list': 'products',
  'products-categories': 'products',
  'products-barcode': 'products',
  
  // المبيعات
  'sales': 'sales',
  'sales-invoices': 'sales',
  'sales-new': 'sales',
  'new-sale': 'sales',
  'sales-quotes': 'sales',
  'price-quote': 'sales',
  'sales-returns': 'sales',
  'goods-issue': 'sales',
  'sales-receipt-vouchers': 'sales',
  'tax-calculator': 'sales',
  
  // المشتريات
  'purchases': 'purchases',
  'purchases-invoices': 'purchases',
  'goods-receipt': 'purchases',
  'purchases-orders': 'purchases',
  'purchases-returns': 'purchases',
  'purchases-receipts': 'purchases',
  
  // المخزون
  'inventory': 'inventory',
  'inventory-management': 'inventory',
  'inventory-status': 'inventory',
  'new-inventory-status': 'inventory',
  'inventory-alerts': 'inventory',
  'inventory-count': 'inventory',
  'inventory-transfers': 'inventory',
  'inventory-reports': 'inventory',
  'new-branch-transfers': 'inventory',
  'warehouse': 'inventory',
  'warehouse-management': 'inventory',
  'warehouse-transfers': 'inventory',
  'warehouse-inventory': 'inventory',
  'warehouse-locations': 'inventory',
  'advanced-inventory': 'inventory',
  'opening-balance': 'inventory',
  
  // العملاء
  'clients': 'clients',
  'clients-management': 'clients',
  'clients-accounts': 'clients',
  'clients-statement': 'clients',
  'clients-receipts': 'clients',
  'clients-orders': 'clients',
  
  // الموردين
  'suppliers': 'suppliers',
  'suppliers-management': 'suppliers',
  'suppliers-statement': 'suppliers',
  'suppliers-accounts': 'suppliers',
  'suppliers-payments': 'suppliers',
  'suppliers-orders': 'suppliers',
  
  // الموظفين
  'employees': 'employees',
  'employees-list': 'employees',
  'employees-management': 'employees',
  'employees-link': 'employees',
  'employees-debts': 'employees',
  'employees-deductions': 'employees',
  'employees-deductions-list': 'employees',
  'deductions-list': 'employees',
  'employees-holidays': 'employees',
  'employees-salaries': 'employees',
  'employees-reports': 'employees',
  'salaries': 'employees',
  'employee-statement': 'employees',
  'deductions': 'employees',
  'holidays': 'employees',
  
  // المصروفات اليومية
  'daily-expenses': 'expenses',
  'daily-expenses-management': 'expenses',
  
  // التقارير
  'reports': 'reports',
  'التقارير': 'reports',
  'reports-suppliers': 'reports',
  'reports-clients': 'reports',
  'reports-sales': 'reports',
  'reports-purchases': 'reports',
  'reports-products': 'reports',
  'reports-inventory': 'reports',
  'reports-employees': 'reports',
  'reports-financial': 'reports',
};

interface BranchSubsectionRendererProps {
  activeSection: string;
  branchId: number;
  setActiveSection?: (section: string) => void;
}

// دالة helper لتغليف الصفحات بالحماية
function withProtection(section: string, branchId: number, Component: React.ReactNode) {
  const permissionKey = SECTION_PERMISSIONS_MAP[section];
  
  if (permissionKey) {
    return (
      <ProtectedSection branchId={branchId} section={permissionKey}>
        {Component}
      </ProtectedSection>
    );
  }
  
  return Component;
}

export default function BranchSubsectionRenderer({ activeSection, branchId, setActiveSection }: BranchSubsectionRendererProps) {
  // صفحة تطوير مؤقتة
  const DevelopmentPage = ({ title }: { title: string }) => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">{title}</h2>
        <p className="text-gray-500">لم يتم تحديد صفحة للعرض</p>
      </div>
    </div>
  );

  // قسم لوحة التحكم الاحترافية
  if (activeSection === 'dashboard') {
    return <BranchDashboard branchId={branchId} />;
  }

  // أقسام الموردين
  if (activeSection === 'suppliers' || activeSection === 'suppliers-management') {
    return withProtection(activeSection, branchId, <BranchSuppliersManagement branchId={branchId} />);
  }
  if (activeSection === 'suppliers-statement') {
    return withProtection(activeSection, branchId, <ProfessionalSupplierStatement branchId={branchId} />);
  }
  if (activeSection === 'suppliers-accounts') {
    return withProtection(activeSection, branchId, <BranchSupplierAccounts branchId={branchId} />);
  }
  if (activeSection === 'suppliers-payments') {
    return withProtection(activeSection, branchId, <BranchSupplierPayments branchId={branchId} />);
  }
  if (activeSection === 'suppliers-orders') {
    return withProtection(activeSection, branchId, <BranchSupplierPayments branchId={branchId} />);
  }

  // أقسام العملاء
  if (activeSection === 'clients' || activeSection === 'clients-management') {
    return withProtection(activeSection, branchId, <EnhancedBranchClients branchId={branchId} />);
  }
  if (activeSection === 'clients-accounts') {
    return withProtection(activeSection, branchId, <BranchClientAccounts branchId={branchId} />);
  }
  if (activeSection === 'clients-statement') {
    return withProtection(activeSection, branchId, <ProfessionalClientStatement branchId={branchId} />);
  }
  if (activeSection === 'clients-receipts') {
    return withProtection(activeSection, branchId, <EnhancedBranchClientPayments branchId={branchId} />);
  }
  if (activeSection === 'clients-orders') {
    return withProtection(activeSection, branchId, <BranchClientOrders branchId={branchId} />);
  }

  // أقسام الأصناف
  if (activeSection === 'products' || activeSection === 'products-list') {
    return withProtection(activeSection, branchId, <BranchProducts branchId={branchId} />);
  }
  if (activeSection === 'products-categories') {
    return withProtection(activeSection, branchId, <BranchProductCategories branchId={branchId} />);
  }
  if (activeSection === 'products-barcode') {
    return withProtection(activeSection, branchId, <BranchProductBarcode branchId={branchId} />);
  }

  // أقسام المشتريات - نفس النظام الرئيسي
  if (activeSection === 'purchases' || activeSection === 'purchases-invoices') {
    return withProtection(activeSection, branchId, <Purchases branchId={branchId} />);
  }
  if (activeSection === 'goods-receipt') {
    return withProtection(activeSection, branchId, <GoodsReceipt branchId={branchId} />);
  }
  if (activeSection === 'purchases-orders') {
    return withProtection(activeSection, branchId, <Purchases branchId={branchId} />);
  }
  if (activeSection === 'purchases-returns') {
    return withProtection(activeSection, branchId, <PurchaseReturns />);
  }
  if (activeSection === 'purchases-receipts') {
    return withProtection(activeSection, branchId, <SimpleGoodsReceiptVoucher branchId={branchId} />);
  }

  // أقسام المبيعات - نظام احترافي
  if (activeSection === 'sales' || activeSection === 'sales-invoices') {
    return withProtection(activeSection, branchId, <BranchSales branchId={branchId} />);
  }
  if (activeSection === 'sales-new') {
    return withProtection(activeSection, branchId, (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">فاتورة مبيعات جديدة</h2>
        <p className="text-gray-600">فاتورة مبيعات جديدة قيد التطوير</p>
      </div>
    ));
  }
  if (activeSection === 'new-sale') {
    return withProtection(activeSection, branchId, (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">بيع جديد</h2>
        <p className="text-gray-600">البيع الجديد قيد التطوير</p>
      </div>
    ));
  }
  if (activeSection === 'sales-quotes' || activeSection === 'price-quote') {
    return withProtection(activeSection, branchId, <BranchPriceQuote branchId={branchId} />);
  }
  if (activeSection === 'sales-returns') {
    return withProtection(activeSection, branchId, <SalesReturns />);
  }
  if (activeSection === 'goods-issue') {
    return withProtection(activeSection, branchId, <BranchGoodsIssue branchId={branchId} />);
  }
  if (activeSection === 'sales-receipt-vouchers') {
    return withProtection(activeSection, branchId, <BranchSalesReceiptVouchers branchId={branchId} />);
  }

  if (activeSection === 'tax-calculator') {
    return withProtection(activeSection, branchId, <TaxCalculator />);
  }

  // أقسام المخزون
  if (activeSection === 'new-inventory-status') {
    return withProtection(activeSection, branchId, <NewInventoryStatus branchId={branchId} />);
  }

  if (activeSection === 'inventory-count') {
    return withProtection(activeSection, branchId, <BranchInventoryCount branchId={branchId} />);
  }
  if (activeSection === 'inventory-transfers') {
    return withProtection(activeSection, branchId, <BranchInventoryTransfers branchId={branchId} />);
  }
  if (activeSection === 'inventory-reports') {
    return withProtection(activeSection, branchId, <DevelopmentPage title="تقارير المخزون" />);
  }
  if (activeSection === 'inventory-alerts') {
    return withProtection(activeSection, branchId, <BranchInventoryAlerts branchId={branchId} />);
  }
  if (activeSection === 'inventory-settings') {
    return withProtection(activeSection, branchId, <BranchInventorySettings branchId={branchId} />);
  }
  if (activeSection === 'advanced-inventory') {
    return withProtection(activeSection, branchId, <BranchAdvancedInventory branchId={branchId} />);
  }


  // أقسام المخازن
  if (activeSection === 'warehouse' || activeSection === 'warehouse-management') {
    return withProtection(activeSection, branchId, <BranchWarehouse branchId={branchId} />);
  }
  if (activeSection === 'warehouse-transfers') {
    return withProtection(activeSection, branchId, <BranchStockTransfer branchId={branchId} />);
  }
  if (activeSection === 'warehouse-inventory') {
    return withProtection(activeSection, branchId, <BranchInventoryManagement branchId={branchId} />);
  }
  if (activeSection === 'warehouse-locations') {
    return withProtection(activeSection, branchId, <BranchWarehouse branchId={branchId} />);
  }

  // أقسام الموظفين - نظام جديد مطابق للنظام الرئيسي
  if (activeSection === 'employees' || activeSection === 'employees-management') {
    return withProtection(activeSection, branchId, <BranchEmployeesProfessionalSimple branchId={branchId} />);
  }
  if (activeSection === 'employee-statement') {
    return withProtection(activeSection, branchId, <BranchEmployeeStatement branchId={branchId} />);
  }
  if (activeSection === 'employees-debts') {
    return withProtection(activeSection, branchId, <BranchEmployeeDebts branchId={branchId} />);
  }

  if (activeSection === 'employees-deductions') {
    return withProtection(activeSection, branchId, <BranchEmployeeDeductions branchId={branchId} />);
  }

  if (activeSection === 'employees-deductions-list' || activeSection === 'deductions-list') {
    return withProtection(activeSection, branchId, <DeductionsList branchId={branchId} />);
  }

  if (activeSection === 'employees-holidays') {
    return withProtection(activeSection, branchId, <BranchHolidays branchId={branchId} />);
  }
  if (activeSection === 'employees-salaries') {
    return withProtection(activeSection, branchId, <BranchSalaries branchId={branchId} />);
  }
  if (activeSection === 'employees-link') {
    return withProtection(activeSection, branchId, <BranchEmployeesLink branchId={branchId} />);
  }
  if (activeSection === 'employees-reports') {
    return withProtection(activeSection, branchId, (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">تقارير الموظفين</h2>
        <p className="text-gray-600">تقارير الموظفين قيد التطوير</p>
      </div>
    ));
  }

  // أقسام التقارير - نظام ثابت
  if (activeSection === 'reports' || activeSection === 'التقارير') {
    return withProtection(activeSection, branchId, <BranchSuppliersReport branchId={branchId} />);
  }
  if (activeSection === 'reports-suppliers') {
    return withProtection(activeSection, branchId, <BranchSuppliersReport branchId={branchId} />);
  }
  if (activeSection === 'reports-clients') {
    return withProtection(activeSection, branchId, <BranchClientsReport branchId={branchId} />);
  }
  if (activeSection === 'reports-sales') {
    return withProtection(activeSection, branchId, <BranchSalesReport branchId={branchId} />);
  }
  if (activeSection === 'reports-purchases') {
    return withProtection(activeSection, branchId, <BranchPurchasesReport branchId={branchId} />);
  }
  if (activeSection === 'reports-products') {
    return withProtection(activeSection, branchId, <BranchProductsReport branchId={branchId} />);
  }
  if (activeSection === 'reports-inventory') {
    return withProtection(activeSection, branchId, <BranchWarehouseReport branchId={branchId} />);
  }
  if (activeSection === 'reports-employees') {
    return withProtection(activeSection, branchId, <BranchEmployeesReport branchId={branchId} />);
  }
  if (activeSection === 'reports-financial') {
    return withProtection(activeSection, branchId, <BranchFinancialReport branchId={branchId} />);
  }

  // أقسام المصروفات اليومية
  if (activeSection === 'daily-expenses' || activeSection === 'daily-expenses-management') {
    return withProtection(activeSection, branchId, <BranchDailyExpenses branchId={branchId} />);
  }

  // إعدادات الصلاحيات - تم نقلها للنظام الرئيسي
  // if (activeSection === 'branch-permissions') {
  //   return <BranchPermissions branchId={branchId} />;
  // }

  // نظام تحويل المخزون الجديد
  if (activeSection === 'new-branch-transfers') {
    return withProtection(activeSection, branchId, <NewBranchTransfers branchId={branchId} />);
  }

  // القسم الافتراضي
  return <DevelopmentPage title="صفحة غير محددة" />;
}