import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Suppliers from "@/pages/Suppliers";
import Clients from "@/pages/Clients";
import Products from "@/pages/Products";
import Sales from "@/pages/Sales";
import Purchases from "@/pages/Purchases";
import Inventory from "@/pages/Inventory";
import Accounts from "@/pages/Accounts";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/users" component={Users} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/clients" component={Clients} />
        <Route path="/cash-clients" component={Clients} />
        <Route path="/client-groups" component={Clients} />
        <Route path="/products" component={Products} />
        <Route path="/products/add" component={Products} />
        <Route path="/product-discounts" component={Products} />
        <Route path="/product-categories" component={Products} />
        <Route path="/purchases" component={Purchases} />
        <Route path="/sales" component={Sales} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
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
