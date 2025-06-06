import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Suppliers from "@/pages/Suppliers";
import Clients from "@/pages/Clients";
import Products from "@/pages/Products";
import ProductBarcodes from "@/pages/ProductBarcodes";
import ProductCategories from "@/pages/ProductCategories";
import Sales from "@/pages/Sales";
import SalesReturns from "@/pages/SalesReturns";
import Quotes from "@/pages/Quotes";
import Purchases from "@/pages/Purchases";
import PurchaseReturns from "@/pages/PurchaseReturns";
import Inventory from "@/pages/Inventory";
import InventoryCount from "@/pages/InventoryCount";
import InventoryMovement from "@/pages/InventoryMovement";
import InventoryTransfer from "@/pages/InventoryTransfer";
import Accounts from "@/pages/Accounts";
import Reports from "@/pages/Reports";
import SalesReports from "@/pages/reports/SalesReports";
import PurchasesReports from "@/pages/reports/PurchasesReports";
import InventoryReports from "@/pages/reports/InventoryReports";
import FinancialReports from "@/pages/reports/FinancialReports";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";
import Employees from "@/pages/Employees";
import Deductions from "@/pages/Deductions";
import Salaries from "@/pages/Salaries";
import TaxCalculator from "@/pages/TaxCalculator";
import Profile from "@/pages/Profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <div className="h-8 w-8 animate-spin border-2 border-white border-t-transparent rounded-full" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">المحاسب الأعظم</h1>
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل دخول، عرض صفحات المصادقة
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="*" component={Login} />
      </Switch>
    );
  }

  // إذا كان المستخدم مسجل دخول، عرض النظام الكامل
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/users" component={Users} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/suppliers/add" component={Suppliers} />
        <Route path="/supplier-categories" component={Suppliers} />
        <Route path="/supplier-evaluation" component={Suppliers} />
        <Route path="/clients" component={Clients} />
        <Route path="/cash-clients" component={Clients} />
        <Route path="/client-groups" component={Clients} />
        <Route path="/client-accounts" component={Clients} />
        <Route path="/products" component={Products} />
        <Route path="/products/add" component={Products} />
        <Route path="/products/edit/:id" component={Products} />
        <Route path="/products/barcodes" component={ProductBarcodes} />
        <Route path="/inventory/barcodes" component={ProductBarcodes} />
        <Route path="/product-categories" component={ProductCategories} />
        
        {/* المشتريات */}
        <Route path="/purchases" component={Purchases} />
        <Route path="/purchase-returns" component={PurchaseReturns} />
        <Route path="/purchase-orders" component={Purchases} />
        <Route path="/purchase-reports" component={Reports} />
        
        {/* المبيعات */}
        <Route path="/sales" component={Sales} />
        <Route path="/sales-returns" component={SalesReturns} />
        <Route path="/quotes" component={Quotes} />
        <Route path="/tax-calculator" component={TaxCalculator} />
        <Route path="/sales-reports" component={Reports} />
        
        {/* إدارة المخزون */}
        <Route path="/inventory" component={Inventory} />
        <Route path="/inventory-count" component={InventoryCount} />
        <Route path="/inventory-movement" component={InventoryMovement} />
        <Route path="/inventory-transfer" component={InventoryTransfer} />
        
        {/* الحسابات */}
        <Route path="/accounts" component={Accounts} />
        <Route path="/journal-entries" component={Accounts} />
        <Route path="/accounts-payable" component={Accounts} />
        <Route path="/accounts-receivable" component={Accounts} />
        
        {/* الموظفين */}
        <Route path="/employees" component={Employees} />
        <Route path="/deductions" component={Deductions} />
        <Route path="/salaries" component={Salaries} />
        <Route path="/attendance" component={Employees} />
        <Route path="/holidays" component={Employees} />
        <Route path="/performance" component={Employees} />
        
        {/* التقارير */}
        <Route path="/reports" component={Reports} />
        <Route path="/reports/sales" component={SalesReports} />
        <Route path="/reports/purchases" component={PurchasesReports} />
        <Route path="/reports/inventory" component={InventoryReports} />
        <Route path="/reports/financial" component={FinancialReports} />
        <Route path="/reports/clients" component={Reports} />
        <Route path="/reports/suppliers" component={Reports} />
        <Route path="/reports/employees" component={Reports} />
        
        {/* الإعدادات */}
        <Route path="/settings" component={Settings} />
        <Route path="/settings/general" component={Settings} />
        <Route path="/settings/company" component={Settings} />
        <Route path="/settings/users" component={Settings} />
        <Route path="/settings/system" component={Settings} />
        <Route path="/settings/backup" component={Settings} />
        <Route path="/settings/security" component={Settings} />
        <Route path="/settings/system" component={Settings} />
        <Route path="/settings/printing" component={Settings} />
        <Route path="/settings/taxes" component={Settings} />
        <Route path="/settings/backup" component={Settings} />
        
        {/* الملف الشخصي */}
        <Route path="/profile" component={Profile} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OnboardingProvider>
          <Toaster />
          <Router />
        </OnboardingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
