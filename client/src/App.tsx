import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import VoiceNotes from "@/pages/VoiceNotes";
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
import Accounts from "@/pages/Accounts";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/voice-notes" component={VoiceNotes} />
        <Route path="/users" component={Users} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/clients" component={Clients} />
        <Route path="/cash-clients" component={Clients} />
        <Route path="/client-groups" component={Clients} />
        <Route path="/products" component={Products} />
        <Route path="/products/add" component={Products} />
        <Route path="/products/barcodes" component={ProductBarcodes} />
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
        <Route path="/sales-reports" component={Reports} />
        
        {/* إدارة المخزون */}
        <Route path="/inventory" component={Inventory} />
        <Route path="/inventory/count" component={InventoryCount} />
        <Route path="/inventory/movement" component={Inventory} />
        <Route path="/inventory/transfer" component={Inventory} />
        
        {/* الحسابات */}
        <Route path="/accounts" component={Accounts} />
        <Route path="/journal-entries" component={Accounts} />
        <Route path="/accounts-payable" component={Accounts} />
        <Route path="/accounts-receivable" component={Accounts} />
        
        {/* التقارير */}
        <Route path="/reports" component={Reports} />
        <Route path="/reports/sales" component={Reports} />
        <Route path="/reports/purchases" component={Reports} />
        <Route path="/reports/financial" component={Reports} />
        <Route path="/reports/inventory" component={Reports} />
        
        {/* الإعدادات */}
        <Route path="/settings" component={Settings} />
        <Route path="/settings/system" component={Settings} />
        <Route path="/settings/printing" component={Settings} />
        <Route path="/settings/taxes" component={Settings} />
        <Route path="/settings/backup" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
