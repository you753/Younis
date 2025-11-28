import { db } from './db';
import { 
  branches,
  sales,
  purchases,
  products,
  clients,
  suppliers,
  employees,
  type Branch,
  type InsertBranch
} from '@shared/schema';
import { eq, sql, desc } from 'drizzle-orm';

// Database Storage Implementation for Branches
export class DatabaseStorage {
  // Branch Functions
  async getAllBranches(): Promise<Branch[]> {
    return await db.select().from(branches).orderBy(desc(branches.createdAt));
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const result = await db.select().from(branches).where(eq(branches.id, id));
    return result[0];
  }

  async createBranch(branchData: InsertBranch): Promise<Branch> {
    const result = await db.insert(branches).values({
      ...branchData,
      status: branchData.status || 'active',
      isActive: branchData.isActive ?? true
    }).returning();
    return result[0];
  }

  async updateBranch(id: number, branchData: Partial<InsertBranch>): Promise<Branch | undefined> {
    const result = await db.update(branches)
      .set(branchData)
      .where(eq(branches.id, id))
      .returning();
    return result[0];
  }

  async deleteBranch(id: number): Promise<boolean> {
    const result = await db.delete(branches).where(eq(branches.id, id));
    return true;
  }

  // Branch Financial Summary
  async getBranchFinancialSummary(branchId?: number): Promise<any> {
    const allBranches = branchId
      ? await db.select().from(branches).where(eq(branches.id, branchId))
      : await db.select().from(branches);

    const summaries = await Promise.all(allBranches.map(async (branch) => {
      // Get sales for branch
      const branchSales = await db.select().from(sales).where(eq(sales.branchId, branch.id));
      const totalSales = branchSales.reduce((sum, sale) => {
        const saleTotal = sale.items.reduce((itemSum: number, item: any) => 
          itemSum + (item.quantity * item.price), 0);
        return sum + saleTotal;
      }, 0);

      // Get purchases for branch
      const branchPurchases = await db.select().from(purchases).where(eq(purchases.branchId, branch.id));
      const totalPurchases = branchPurchases.reduce((sum, purchase) => {
        const purchaseTotal = purchase.items.reduce((itemSum: number, item: any) => 
          itemSum + (item.quantity * item.price), 0);
        return sum + purchaseTotal;
      }, 0);

      // Get expenses for branch (table doesn't exist yet in current schema)
      const totalExpenses = 0;

      // Get products for branch
      const branchProducts = await db.select().from(products).where(eq(products.branchId, branch.id));
      const inventoryValue = branchProducts.reduce((sum, product) => 
        sum + (product.quantity * (product.purchasePrice || 0)), 0);

      // Get clients for branch (clients table doesn't have branch_id in current schema)
      const branchClients: any[] = [];
      const totalClientDebt = 0;

      // Get suppliers for branch (suppliers table doesn't have branch_id in current schema)
      const branchSuppliers: any[] = [];
      const totalSupplierDebt = 0;

      // Get employees for branch
      const branchEmployees = await db.select().from(employees).where(eq(employees.branchId, branch.id));

      // Calculate metrics
      const grossProfit = totalSales - totalPurchases;
      const netProfit = grossProfit - totalExpenses;
      const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
      const averageSale = branchSales.length > 0 ? totalSales / branchSales.length : 0;

      return {
        branchId: branch.id,
        branchName: branch.name,
        branchCode: branch.code,
        branchManager: branch.manager,
        branchStatus: branch.status,
        branchOpeningDate: branch.openingDate,
        
        // Financial metrics
        totalSales,
        totalPurchases,
        totalExpenses,
        inventoryValue,
        grossProfit,
        netProfit,
        profitMargin,
        averageSale,
        
        // Counts
        salesCount: branchSales.length,
        purchasesCount: branchPurchases.length,
        productsCount: branchProducts.length,
        clientsCount: branchClients.length,
        suppliersCount: branchSuppliers.length,
        employeesCount: branchEmployees.length,
        
        // Balances
        totalClientDebt,
        totalSupplierDebt,
        
        // Growth indicators
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt
      };
    }));

    return summaries;
  }
}

export const dbStorage = new DatabaseStorage();
