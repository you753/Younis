import { Request, Response } from 'express';
import { db } from './db';
import { 
  accountingTree, 
  journalEntries, 
  journalEntryDetails,
  branchAccountingSettings,
  consolidationReports,
  interBranchTransactions,
  branchBudgets,
  branchKpis,
  branchUsers,
  branches,
  sales,
  purchases,
  products
} from '@shared/schema';
import { eq, and, desc, sum, count, gte, lte, inArray } from 'drizzle-orm';

// خدمة إدارة المحاسبة للفروع
export class BranchAccountingService {
  
  // إنشاء شجرة الحسابات للفرع
  async createBranchChartOfAccounts(branchId: number, basedOnBranchId?: number) {
    try {
      let baseAccounts;
      
      if (basedOnBranchId) {
        // نسخ من فرع آخر
        baseAccounts = await db.select()
          .from(accountingTree)
          .where(eq(accountingTree.branchId, basedOnBranchId));
      } else {
        // نسخ من الحسابات المركزية
        baseAccounts = await db.select()
          .from(accountingTree)
          .where(eq(accountingTree.branchId, null));
      }

      const newAccounts = [];
      const accountMapping = new Map(); // لربط الحسابات القديمة بالجديدة

      // إنشاء الحسابات الرئيسية أولاً
      for (const account of baseAccounts.filter(acc => acc.level === 1)) {
        const newAccount = await db.insert(accountingTree)
          .values({
            code: `${branchId}-${account.code}`,
            name: account.name,
            nameEn: account.nameEn,
            level: account.level,
            accountType: account.accountType,
            isActive: account.isActive,
            isMain: account.isMain,
            branchId: branchId,
            consolidationAccountId: account.id,
            notes: `حساب منسوخ من ${account.name}`
          })
          .returning();
        
        accountMapping.set(account.id, newAccount[0].id);
        newAccounts.push(newAccount[0]);
      }

      // ثم إنشاء الحسابات الفرعية
      for (let level = 2; level <= 5; level++) {
        for (const account of baseAccounts.filter(acc => acc.level === level)) {
          const parentId = accountMapping.get(account.parentId);
          
          if (parentId) {
            const newAccount = await db.insert(accountingTree)
              .values({
                code: `${branchId}-${account.code}`,
                name: account.name,
                nameEn: account.nameEn,
                parentId: parentId,
                level: account.level,
                accountType: account.accountType,
                isActive: account.isActive,
                isMain: account.isMain,
                branchId: branchId,
                consolidationAccountId: account.id,
                notes: `حساب منسوخ من ${account.name}`
              })
              .returning();
            
            accountMapping.set(account.id, newAccount[0].id);
            newAccounts.push(newAccount[0]);
          }
        }
      }

      return { success: true, accounts: newAccounts };
    } catch (error) {
      console.error('خطأ في إنشاء شجرة الحسابات:', error);
      return { success: false, error: error.message };
    }
  }

  // إنشاء قيد محاسبي للفرع
  async createJournalEntry(branchId: number, entryData: {
    description: string;
    reference?: string;
    entries: Array<{
      accountId: number;
      debit: number;
      credit: number;
      description?: string;
    }>;
  }, userId: number) {
    try {
      // التحقق من توازن القيد
      const totalDebit = entryData.entries.reduce((sum, entry) => sum + entry.debit, 0);
      const totalCredit = entryData.entries.reduce((sum, entry) => sum + entry.credit, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return { 
          success: false, 
          error: 'القيد غير متوازن - مجموع المدين يجب أن يساوي مجموع الدائن' 
        };
      }

      // إنشاء القيد الرئيسي
      const journalEntry = await db.insert(journalEntries)
        .values({
          branchId: branchId,
          description: entryData.description,
          reference: entryData.reference,
          totalDebit: totalDebit,
          totalCredit: totalCredit,
          createdBy: userId,
          status: 'pending'
        })
        .returning();

      // إنشاء تفاصيل القيد
      const entryDetails = [];
      for (const entry of entryData.entries) {
        const detail = await db.insert(journalEntryDetails)
          .values({
            journalEntryId: journalEntry[0].id,
            accountId: entry.accountId,
            debit: entry.debit,
            credit: entry.credit,
            description: entry.description || entryData.description
          })
          .returning();
        
        entryDetails.push(detail[0]);

        // تحديث أرصدة الحسابات
        await this.updateAccountBalance(entry.accountId, entry.debit, entry.credit);
      }

      return { 
        success: true, 
        journalEntry: journalEntry[0],
        details: entryDetails 
      };
    } catch (error) {
      console.error('خطأ في إنشاء القيد المحاسبي:', error);
      return { success: false, error: error.message };
    }
  }

  // تحديث رصيد الحساب
  private async updateAccountBalance(accountId: number, debit: number, credit: number) {
    const account = await db.select()
      .from(accountingTree)
      .where(eq(accountingTree.id, accountId))
      .limit(1);

    if (account.length > 0) {
      const currentDebit = parseFloat(account[0].debitBalance || '0');
      const currentCredit = parseFloat(account[0].creditBalance || '0');

      await db.update(accountingTree)
        .set({
          debitBalance: (currentDebit + debit).toString(),
          creditBalance: (currentCredit + credit).toString()
        })
        .where(eq(accountingTree.id, accountId));
    }
  }

  // إنشاء تقرير تجميعي
  async generateConsolidationReport(
    reportType: 'income_statement' | 'balance_sheet' | 'cash_flow',
    period: 'monthly' | 'quarterly' | 'yearly',
    startDate: string,
    endDate: string,
    branchIds: number[],
    userId: number
  ) {
    try {
      const reportData = {
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
        branchBreakdown: [],
        accountSummary: []
      };

      // جمع بيانات كل فرع
      for (const branchId of branchIds) {
        const branchData = await this.getBranchFinancialData(branchId, startDate, endDate);
        reportData.branchBreakdown.push(branchData);
        reportData.totalRevenue += branchData.revenue;
        reportData.totalExpenses += branchData.expenses;
      }

      reportData.netIncome = reportData.totalRevenue - reportData.totalExpenses;

      // جمع ملخص الحسابات
      reportData.accountSummary = await this.getConsolidatedAccountSummary(branchIds, startDate, endDate);

      // حفظ التقرير
      const report = await db.insert(consolidationReports)
        .values({
          reportType,
          period,
          startDate,
          endDate,
          branchIds,
          reportData,
          generatedBy: userId,
          status: 'draft'
        })
        .returning();

      return { success: true, report: report[0] };
    } catch (error) {
      console.error('خطأ في إنشاء التقرير التجميعي:', error);
      return { success: false, error: error.message };
    }
  }

  // الحصول على البيانات المالية للفرع
  private async getBranchFinancialData(branchId: number, startDate: string, endDate: string) {
    // حساب الإيرادات من المبيعات
    const salesData = await db.select({
      total: sum(sales.total)
    })
    .from(sales)
    .where(
      and(
        eq(sales.branchId, branchId),
        gte(sales.date, startDate),
        lte(sales.date, endDate)
      )
    );

    // حساب المصروفات من المشتريات والمصروفات الأخرى
    const purchasesData = await db.select({
      total: sum(purchases.total)
    })
    .from(purchases)
    .where(
      and(
        gte(purchases.date, startDate),
        lte(purchases.date, endDate)
      )
    );

    const revenue = parseFloat(salesData[0]?.total || '0');
    const expenses = parseFloat(purchasesData[0]?.total || '0');

    // الحصول على اسم الفرع
    const branch = await db.select()
      .from(branches)
      .where(eq(branches.id, branchId))
      .limit(1);

    return {
      branchId,
      branchName: branch[0]?.name || `فرع ${branchId}`,
      revenue,
      expenses,
      netIncome: revenue - expenses
    };
  }

  // الحصول على ملخص الحسابات التجميعية
  private async getConsolidatedAccountSummary(branchIds: number[], startDate: string, endDate: string) {
    const accounts = await db.select()
      .from(accountingTree)
      .where(inArray(accountingTree.branchId, branchIds));

    const accountSummary = [];
    const consolidatedAccounts = new Map();

    // تجميع الحسابات حسب الحساب التجميعي
    for (const account of accounts) {
      const consolidationId = account.consolidationAccountId || account.id;
      
      if (!consolidatedAccounts.has(consolidationId)) {
        consolidatedAccounts.set(consolidationId, {
          accountCode: account.code.split('-')[1] || account.code, // إزالة رقم الفرع
          accountName: account.name,
          totalDebit: 0,
          totalCredit: 0,
          balance: 0
        });
      }

      const consolidated = consolidatedAccounts.get(consolidationId);
      consolidated.totalDebit += parseFloat(account.debitBalance || '0');
      consolidated.totalCredit += parseFloat(account.creditBalance || '0');
      consolidated.balance = consolidated.totalDebit - consolidated.totalCredit;
    }

    return Array.from(consolidatedAccounts.values());
  }

  // إنشاء معاملة بين الفروع
  async createInterBranchTransaction(transactionData: {
    fromBranchId: number;
    toBranchId: number;
    transactionType: string;
    amount: number;
    description: string;
    fromAccountId: number;
    toAccountId: number;
  }, userId: number) {
    try {
      // إنشاء رقم مرجعي فريد
      const referenceNumber = `IBT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const transaction = await db.insert(interBranchTransactions)
        .values({
          ...transactionData,
          referenceNumber,
          createdBy: userId
        })
        .returning();

      // إنشاء القيود المحاسبية المقابلة
      await this.createJournalEntry(transactionData.fromBranchId, {
        description: `تحويل إلى فرع: ${transactionData.description}`,
        reference: referenceNumber,
        entries: [{
          accountId: transactionData.fromAccountId,
          debit: 0,
          credit: transactionData.amount
        }]
      }, userId);

      await this.createJournalEntry(transactionData.toBranchId, {
        description: `تحويل من فرع: ${transactionData.description}`,
        reference: referenceNumber,
        entries: [{
          accountId: transactionData.toAccountId,
          debit: transactionData.amount,
          credit: 0
        }]
      }, userId);

      return { success: true, transaction: transaction[0] };
    } catch (error) {
      console.error('خطأ في إنشاء معاملة بين الفروع:', error);
      return { success: false, error: error.message };
    }
  }

  // حساب مؤشرات الأداء المالي للفرع
  async calculateBranchKPIs(branchId: number, reportDate: string) {
    try {
      const startOfMonth = new Date(reportDate);
      startOfMonth.setDate(1);
      const endOfMonth = new Date(reportDate);

      // حساب الإيرادات والمصروفات
      const salesData = await db.select({
        total: sum(sales.total),
        count: count(sales.id)
      })
      .from(sales)
      .where(
        and(
          eq(sales.branchId, branchId),
          gte(sales.date, startOfMonth.toISOString()),
          lte(sales.date, endOfMonth.toISOString())
        )
      );

      const revenue = parseFloat(salesData[0]?.total || '0');
      const transactionCount = salesData[0]?.count || 0;

      // حساب تكلفة البضاعة المباعة
      const inventoryValue = await db.select({
        total: sum(products.quantity * products.purchasePrice)
      })
      .from(products)
      .where(eq(products.branchId, branchId));

      const totalInventoryValue = parseFloat(inventoryValue[0]?.total || '0');

      // حساب المؤشرات
      const grossProfit = revenue * 0.3; // تقدير هامش الربح 30%
      const netProfit = grossProfit * 0.8; // تقدير صافي الربح 80% من الربح الإجمالي
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      const kpiData = {
        branchId,
        reportDate,
        totalRevenue: revenue,
        totalExpenses: revenue * 0.7, // تقدير المصروفات
        grossProfit,
        netProfit,
        profitMargin,
        returnOnAssets: totalInventoryValue > 0 ? (netProfit / totalInventoryValue) * 100 : 0,
        currentRatio: 1.5, // نسبة تقديرية
        inventoryTurnover: totalInventoryValue > 0 ? revenue / totalInventoryValue : 0,
        receivablesTurnover: 6, // نسبة تقديرية
        cashFlowFromOperations: netProfit * 1.1,
        budgetVariance: 0, // سيتم حسابها لاحقاً
        customerSatisfactionScore: 4.2,
        employeeProductivityIndex: transactionCount > 0 ? revenue / transactionCount : 0
      };

      const kpi = await db.insert(branchKpis)
        .values(kpiData)
        .returning();

      return { success: true, kpi: kpi[0] };
    } catch (error) {
      console.error('خطأ في حساب مؤشرات الأداء:', error);
      return { success: false, error: error.message };
    }
  }
}

// إنشاء مثيل من الخدمة
export const branchAccountingService = new BranchAccountingService();

// Routes للمحاسبة الفرعية
export async function handleBranchAccounting(req: Request, res: Response) {
  const { action } = req.params;
  const { branchId } = req.query;

  if (!branchId) {
    return res.status(400).json({ message: 'رقم الفرع مطلوب' });
  }

  try {
    switch (action) {
      case 'create-chart':
        const { basedOnBranchId } = req.body;
        const result = await branchAccountingService.createBranchChartOfAccounts(
          parseInt(branchId as string),
          basedOnBranchId ? parseInt(basedOnBranchId) : undefined
        );
        return res.json(result);

      case 'create-journal-entry':
        const { entryData } = req.body;
        const userId = req.session?.user?.id || 1;
        const entryResult = await branchAccountingService.createJournalEntry(
          parseInt(branchId as string),
          entryData,
          userId
        );
        return res.json(entryResult);

      case 'generate-consolidation':
        const { reportType, period, startDate, endDate, branchIds } = req.body;
        const reportResult = await branchAccountingService.generateConsolidationReport(
          reportType,
          period,
          startDate,
          endDate,
          branchIds,
          req.session?.user?.id || 1
        );
        return res.json(reportResult);

      case 'calculate-kpis':
        const { reportDate } = req.body;
        const kpiResult = await branchAccountingService.calculateBranchKPIs(
          parseInt(branchId as string),
          reportDate
        );
        return res.json(kpiResult);

      default:
        return res.status(400).json({ message: 'إجراء غير صحيح' });
    }
  } catch (error) {
    console.error('خطأ في معالجة طلب المحاسبة:', error);
    return res.status(500).json({ message: 'خطأ في الخادم' });
  }
}