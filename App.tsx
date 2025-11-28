import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import Calculator from "@/components/Calculator";

// الصفحات الأساسية الموجودة بالفعل
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";
import Suppliers from "@/pages/Suppliers";
import SimpleClients from "@/pages/SimpleClients";
import ProfessionalProducts from "@/pages/ProfessionalProducts";
import EditProduct from "@/pages/EditProduct";
import ProductCategories from "@/pages/ProductCategories";
import Sales from "@/pages/Sales";
import SalesReturns from "@/pages/SalesReturns";
import Quotes from "@/pages/Quotes";
import Purchases from "@/pages/Purchases";
import PurchaseReturns from "@/pages/PurchaseReturns";
import Inventory from "@/pages/Inventory";
import SimpleReports from "@/pages/SimpleReports";
import SalesReports from "@/pages/reports/SalesReports";
import EnhancedSalesReports from "@/pages/EnhancedSalesReports";

import StockValuationReport from "@/pages/reports/StockValuationReport";
import PurchaseReport from "@/pages/reports/PurchaseReport";
import ClientsReport from "@/pages/reports/ClientsReport";
import InventoryReport from "@/pages/reports/InventoryReport";
import StorageReport from "@/pages/reports/StorageReport";
import FinancialReport from "@/pages/reports/FinancialReport";

import SuppliersReport from "@/pages/reports/SuppliersReport";
import BranchesReport from "@/pages/reports/BranchesReport";
import BranchDetailReport from "@/pages/reports/BranchDetailReport";
import Employees from "@/pages/Employees";

import Salaries from "@/pages/Salaries";


import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Templates from "@/pages/Templates";
import SupplierAccountsNew from "@/pages/SupplierAccountsNew";
import SupplierAccountsSimple from "@/pages/SupplierAccountsSimple";
import ProfessionalSupplierAccounts from "@/pages/ProfessionalSupplierAccounts";
import CleanSupplierAccounts from "@/pages/CleanSupplierAccounts";
import SupplierAccountsStatement from "@/pages/SupplierAccountsStatement";



import CleanClientAccounts from "@/pages/CleanClientAccounts";
import UnifiedClientAccounts from "@/pages/UnifiedClientAccounts";
import ProfessionalClientReceiptVouchers from "@/pages/ProfessionalClientReceiptVouchers";
import SalesReceiptVoucher from "@/pages/SalesReceiptVoucher";
import ProductBarcodes from "@/pages/ProductBarcodes";
import SimpleGoodsReceiptVoucher from "@/pages/SimpleGoodsReceiptVoucher";
import GoodsIssue from "@/pages/GoodsIssue";
import GoodsReceipt from "@/pages/GoodsReceipt";
import TaxCalculator from "@/pages/TaxCalculator";
import TaxAccounts from "@/pages/TaxAccounts";
import InventoryOpeningBalances from "@/pages/InventoryOpeningBalances";
import InventoryMovement from "@/pages/InventoryMovement";
import InventoryTransfers from "@/pages/InventoryTransfers";
import ProfessionalBranches from "@/pages/ProfessionalBranches";
import OptimizedBranchSystem from "@/pages/OptimizedBranchSystem";
import MobileTestBranch from "@/pages/MobileTestBranch";


import NewEmployeeDebts from "@/pages/NewEmployeeDebts";

import SimpleHolidays from "@/pages/SimpleHolidays";
import SalesInvoicesUnified from "@/pages/SalesInvoicesUnified";
import DailyExpenses from "@/pages/DailyExpenses";
import AdvancedDeductions from "@/pages/AdvancedDeductions";
import SimpleEmployeeDeductions from "@/pages/SimpleEmployeeDeductions";
import EmployeeStatementPage from "@/pages/EmployeeStatementPage";

import YounisAccountStatement from "@/pages/YounisAccountStatement";
import BranchReports from "@/pages/BranchReports";
import BranchPermissions from "@/pages/branch/BranchPermissions";
import BranchPermissionsMain from "@/pages/BranchPermissionsMain";

import BranchApp from "@/components/layout/BranchApp";
import StandaloneBranchSystem from "@/pages/StandaloneBranchSystem";
import MobileBranchSystem from "@/pages/MobileBranchSystem";
import BranchLogin from "@/pages/BranchLogin";


// مكون منفصل لإدارة نظام الفروع مع hooks
function BranchSystemWrapper({ branchId }: { branchId: number }) {
  // استخدام النظام المعقد للجميع (جوال وكمبيوتر)
  return <StandaloneBranchSystem branchId={branchId} />;
}

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // استخدام useEffect لإعادة التوجيه بدون مشاكل React
  useEffect(() => {
    if (isLoading) return;
    
    // التحقق من الدخول المباشر من رابط الفروع
    const isDirectBranchAccess = localStorage.getItem('directBranchAccess') === 'true';
    const directBranchId = localStorage.getItem('directBranchId');
    const isDirectBranchPage = location.startsWith('/direct-branch/');
    
    // إذا كان المستخدم في وضع الفرع المباشر وحاول الذهاب لأي صفحة أخرى، أرجعه للفرع فوراً
    if (isDirectBranchAccess && directBranchId && !isDirectBranchPage) {
      // استخدام replace لمنع إضافة سجل جديد في التاريخ
      window.history.replaceState(null, '', `/direct-branch/${directBranchId}`);
      setLocation(`/direct-branch/${directBranchId}`);
      return;
    }
    
    // إذا لم يكن المستخدم مسجل دخول وليس في صفحات Login/Register أو صفحة دخول الفرع أو الفرع المباشر
    const isBranchLoginPage = location.startsWith('/branch-login/');
    if (!isAuthenticated && location !== '/login' && location !== '/register' && !isBranchLoginPage && !isDirectBranchPage) {
      setLocation('/login');
    }
    
    // إذا كان مسجل دخول وفي صفحة Login العادية، قم بإعادة التوجيه للصفحة الرئيسية
    if (isAuthenticated && (location === '/login' || location === '/register')) {
      // إذا كان دخول مباشر، توجه للفرع
      if (isDirectBranchAccess && directBranchId) {
        setLocation(`/standalone-branch/${directBranchId}`);
      } else {
        setLocation('/');
      }
    }
  }, [isLoading, isAuthenticated, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Switch>
      {/* صفحات تسجيل الدخول والتسجيل - خارج Layout */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* صفحة دخول الفروع المباشرة - خارج Layout */}
      <Route path="/branch-login/:branchId">
        {(params) => <BranchLogin branchId={parseInt(params.branchId || '1')} />}
      </Route>
      
      {/* رابط الفرع المباشر بدون تسجيل دخول - منفصل تماماً */}
      <Route path="/direct-branch/:branchId">
        {(params) => {
          // حفظ أن المستخدم في وضع الفرع المباشر
          localStorage.setItem('directBranchAccess', 'true');
          localStorage.setItem('directBranchId', params.branchId || '1');
          return <StandaloneBranchSystem branchId={parseInt(params.branchId || '1')} isDirectAccess={true} />;
        }}
      </Route>
      
      {/* نظام الفروع المستقل - خارج Layout - محمي بالمصادقة */}
      <Route path="/standalone-branch/:branchId*">
        {(params) => isAuthenticated ? <BranchSystemWrapper branchId={parseInt(params['branchId*']?.split('/')[0] || '117')} /> : null}
      </Route>
      
      {/* نظام الفروع المحسن للجوال - خارج Layout - محمي بالمصادقة */}
      <Route path="/optimized-branch/:branchId">
        {(params) => isAuthenticated ? <OptimizedBranchSystem branchId={parseInt(params.branchId || '1')} /> : null}
      </Route>
      
      {/* صفحة تجريبية للجوال - خارج Layout - محمي بالمصادقة */}
      <Route path="/mobile-test-branch">
        {() => isAuthenticated ? <MobileTestBranch /> : null}
      </Route>
      
      {/* باقي النظام داخل Layout - محمي بالمصادقة */}
      {isAuthenticated && (
      <Route>
        <Layout>
          <Switch>
        <Route path="/" component={Dashboard} />
        
        {/* الموردون والعملاء */}
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/suppliers/add" component={Suppliers} />
        <Route path="/supplier-categories" component={Suppliers} />
        <Route path="/supplier-evaluation" component={Suppliers} />
        <Route path="/supplier-payment-vouchers" component={Suppliers} />
        <Route path="/supplier-accounts" component={CleanSupplierAccounts} />
        <Route path="/supplier-accounts-statement" component={SupplierAccountsStatement} />
        
        <Route path="/clients" component={SimpleClients} />
        <Route path="/client-accounts" component={UnifiedClientAccounts} />
        <Route path="/client-receipt-vouchers" component={ProfessionalClientReceiptVouchers} />
        
        {/* المنتجات */}
        <Route path="/products" component={ProfessionalProducts} />
        <Route path="/products/add" component={ProfessionalProducts} />
        <Route path="/products/edit/:id" component={EditProduct} />
        <Route path="/product-categories" component={ProductCategories} />
        <Route path="/products/barcodes" component={ProductBarcodes} />
        
        {/* المبيعات */}
        <Route path="/sales" component={Sales} />
        <Route path="/sales-invoices" component={SalesInvoicesUnified} />
        <Route path="/goods-issue" component={GoodsIssue} />
        <Route path="/sales-returns" component={SalesReturns} />
        <Route path="/quotes" component={Quotes} />
        <Route path="/sales-receipt-vouchers" component={SalesReceiptVoucher} />
        <Route path="/tax-accounts" component={TaxAccounts} />
        <Route path="/tax-calculator" component={TaxCalculator} />
        
        {/* المشتريات */}
        <Route path="/purchases" component={Purchases} />
        <Route path="/purchase-returns" component={PurchaseReturns} />
        <Route path="/purchase-orders" component={Purchases} />
        <Route path="/goods-receipt" component={GoodsReceipt} />
        <Route path="/goods-receipt-voucher" component={SimpleGoodsReceiptVoucher} />
        
        {/* المخزون */}
        <Route path="/inventory" component={Inventory} />
        <Route path="/inventory-opening-balances" component={InventoryOpeningBalances} />
        <Route path="/inventory-movement" component={InventoryMovement} />
        <Route path="/inventory-transfers" component={InventoryTransfers} />
        
        {/* التقارير */}
        <Route path="/reports" component={SimpleReports} />
        <Route path="/reports/sales" component={SalesReports} />
        <Route path="/reports/sales-enhanced" component={EnhancedSalesReports} />
        <Route path="/reports/stock-valuation" component={StockValuationReport} />
        <Route path="/reports/purchases" component={PurchaseReport} />
        <Route path="/reports/clients" component={ClientsReport} />
        <Route path="/reports/inventory" component={InventoryReport} />
        <Route path="/reports/storage" component={StorageReport} />
        <Route path="/reports/financial" component={FinancialReport} />
        <Route path="/reports/suppliers" component={SuppliersReport} />
        <Route path="/reports/branches" component={BranchesReport} />
        <Route path="/reports/branch-detail" component={BranchDetailReport} />
        
        {/* الفروع */}
        <Route path="/branches" component={ProfessionalBranches} />
        <Route path="/branches/:branchId/permissions" component={BranchPermissions} />
        <Route path="/branches/:id">
          {(params) => {
            if (isAuthenticated) {
              setLocation(`/standalone-branch/${params.id}`);
              return null;
            }
            return null;
          }}
        </Route>
        <Route path="/branch-reports" component={BranchReports} />
        <Route path="/branch-permissions" component={BranchPermissionsMain} />


        
        {/* نظام الفروع المتقدم */}
        <Route path="/branch-app/:branchId/:section*">
          {(params) => <BranchApp branchId={parseInt(params.branchId || '1')} />}
        </Route>
        <Route path="/branch-app/:branchId">
          {(params) => <BranchApp branchId={parseInt(params.branchId || '1')} />}
        </Route>
        

        
        {/* الإعدادات والملف الشخصي */}
        <Route path="/settings" component={Settings} />
        <Route path="/profile" component={Profile} />
        
        {/* الموظفين */}
        <Route path="/employees" component={Employees} />
        <Route path="/employee-debts" component={() => <NewEmployeeDebts />} />
        <Route path="/deductions" component={SimpleEmployeeDeductions} />
        <Route path="/employee-statement" component={EmployeeStatementPage} />
        <Route path="/salaries" component={Salaries} />
        <Route path="/simple-holidays" component={SimpleHolidays} />
        
        {/* المصروفات اليومية */}
        <Route path="/daily-expenses" component={DailyExpenses} />


        <Route path="/younis-account" component={YounisAccountStatement} />
        
        {/* القوالب */}
        <Route path="/invoice-templates" component={Templates} />
        <Route path="/report-templates" component={Templates} />
        <Route path="/branch-templates" component={Templates} />
        

        
            {/* صفحة افتراضية */}
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
      )}
    </Switch>
    {/* إظهار الآلة الحاسبة فقط بعد تسجيل الدخول */}
    {isAuthenticated && <Calculator />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <OnboardingProvider>
            <AppContent />
            <Toaster />
          </OnboardingProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;