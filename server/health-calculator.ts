import { db } from "./db";
import { branches, sales, products, clients } from "@shared/schema";
import { eq, sql, and, gte } from "drizzle-orm";

interface BranchHealthMetrics {
  healthScore: number;
  salesPerformance: number;
  inventoryHealth: number;
  customerSatisfaction: number;
}

export class BranchHealthCalculator {
  
  async calculateBranchHealth(branchId: number): Promise<BranchHealthMetrics> {
    const [salesMetrics, inventoryMetrics, customerMetrics] = await Promise.all([
      this.calculateSalesPerformance(branchId),
      this.calculateInventoryHealth(branchId),
      this.calculateCustomerSatisfaction(branchId)
    ]);

    // Calculate overall health score as weighted average
    const healthScore = (
      salesMetrics * 0.4 +
      inventoryMetrics * 0.3 +
      customerMetrics * 0.3
    );

    return {
      healthScore: Math.round(healthScore * 100) / 100,
      salesPerformance: Math.round(salesMetrics * 100) / 100,
      inventoryHealth: Math.round(inventoryMetrics * 100) / 100,
      customerSatisfaction: Math.round(customerMetrics * 100) / 100
    };
  }

  private async calculateSalesPerformance(branchId: number): Promise<number> {
    try {
      // Get sales data for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSales = await db
        .select({
          total: sql<number>`sum(${sales.total})::numeric`,
          count: sql<number>`count(*)::numeric`
        })
        .from(sales)
        .where(
          and(
            eq(sales.branchId, branchId),
            gte(sales.date, thirtyDaysAgo)
          )
        );

      const salesTotal = Number(recentSales[0]?.total || 0);
      const salesCount = Number(recentSales[0]?.count || 0);

      // Simple scoring based on sales volume and frequency
      // This can be enhanced with targets, comparisons, etc.
      let score = 0;
      
      if (salesCount > 0) {
        score += Math.min(salesCount / 20, 0.4); // Up to 40% for frequency
        score += Math.min(salesTotal / 10000, 0.6); // Up to 60% for volume
      }

      return Math.min(score, 1);
    } catch (error) {
      console.error('Error calculating sales performance:', error);
      return 0.5; // Default neutral score
    }
  }

  private async calculateInventoryHealth(branchId: number): Promise<number> {
    try {
      const inventory = await db
        .select({
          totalProducts: sql<number>`count(*)::numeric`,
          lowStockProducts: sql<number>`count(case when ${products.quantity} <= ${products.minQuantity} then 1 end)::numeric`,
          outOfStockProducts: sql<number>`count(case when ${products.quantity} = 0 then 1 end)::numeric`,
          avgStockLevel: sql<number>`avg(case when ${products.minQuantity} > 0 then ${products.quantity}::numeric / ${products.minQuantity}::numeric end)`
        })
        .from(products)
        .where(eq(products.branchId, branchId));

      const data = inventory[0];
      const totalProducts = Number(data?.totalProducts || 0);
      const lowStockProducts = Number(data?.lowStockProducts || 0);
      const outOfStockProducts = Number(data?.outOfStockProducts || 0);
      const avgStockLevel = Number(data?.avgStockLevel || 1);

      if (totalProducts === 0) return 0.8; // No products = neutral

      let score = 1;
      
      // Penalize for out of stock
      score -= (outOfStockProducts / totalProducts) * 0.5;
      
      // Penalize for low stock
      score -= (lowStockProducts / totalProducts) * 0.3;
      
      // Bonus for good average stock levels
      if (avgStockLevel > 2) {
        score += 0.1;
      }

      return Math.max(0, Math.min(score, 1));
    } catch (error) {
      console.error('Error calculating inventory health:', error);
      return 0.7; // Default good score
    }
  }

  private async calculateCustomerSatisfaction(branchId: number): Promise<number> {
    try {
      // Get customer engagement metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const customerMetrics = await db
        .select({
          uniqueCustomers: sql<number>`count(distinct ${sales.clientId})::numeric`,
          totalSales: sql<number>`count(*)::numeric`,
          avgSaleValue: sql<number>`avg(${sales.total})::numeric`
        })
        .from(sales)
        .where(
          and(
            eq(sales.branchId, branchId),
            gte(sales.date, thirtyDaysAgo)
          )
        );

      const data = customerMetrics[0];
      const uniqueCustomers = Number(data?.uniqueCustomers || 0);
      const totalSales = Number(data?.totalSales || 0);
      const avgSaleValue = Number(data?.avgSaleValue || 0);

      let score = 0.6; // Base satisfaction

      // Higher score for more unique customers
      if (uniqueCustomers > 0) {
        score += Math.min(uniqueCustomers / 50, 0.2);
      }

      // Higher score for repeat customers (lower ratio = more repeats)
      if (totalSales > 0 && uniqueCustomers > 0) {
        const repeatRatio = totalSales / uniqueCustomers;
        if (repeatRatio > 1.5) {
          score += 0.15;
        }
      }

      // Higher score for good average sale value
      if (avgSaleValue > 100) {
        score += 0.05;
      }

      return Math.min(score, 1);
    } catch (error) {
      console.error('Error calculating customer satisfaction:', error);
      return 0.75; // Default good score
    }
  }

  async updateAllBranchesHealth(): Promise<void> {
    try {
      const allBranches = await db.select({ id: branches.id }).from(branches);
      
      for (const branch of allBranches) {
        const metrics = await this.calculateBranchHealth(branch.id);
        
        await db
          .update(branches)
          .set({
            healthScore: metrics.healthScore.toString(),
            salesPerformance: metrics.salesPerformance.toString(),
            inventoryHealth: metrics.inventoryHealth.toString(),
            customerSatisfaction: metrics.customerSatisfaction.toString(),
            lastHealthUpdate: new Date()
          })
          .where(eq(branches.id, branch.id));
      }
    } catch (error) {
      console.error('Error updating branch health metrics:', error);
    }
  }
}

export const healthCalculator = new BranchHealthCalculator();