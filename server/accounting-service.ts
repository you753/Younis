import { db } from './db';
import { 
  accounts, 
  accountCategories, 
  journalEntries, 
  journalEntryLines, 
  products, 
  sales, 
  purchases,
  inventoryMovements 
} from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

export class AccountingService {
  // إعداد الحسابات الأساسية للنظام
  static async initializeDefaultAccounts() {
    try {
      // التحقق من وجود الحسابات الأساسية
      const existingCategories = await db.select().from(accountCategories);
      if (existingCategories.length > 0) {
        return; // الحسابات موجودة بالفعل
      }

      // إنشاء فئات الحسابات الرئيسية
      const categories = [
        { name: 'الأصول', nameEn: 'Assets', code: '1', type: 'assets', level: 1 },
        { name: 'الخصوم', nameEn: 'Liabilities', code: '2', type: 'liabilities', level: 1 },
        { name: 'حقوق الملكية', nameEn: 'Equity', code: '3', type: 'equity', level: 1 },
        { name: 'الإيرادات', nameEn: 'Revenue', code: '4', type: 'revenue', level: 1 },
        { name: 'المصروفات', nameEn: 'Expenses', code: '5', type: 'expenses', level: 1 },
      ];

      for (const category of categories) {
        await db.insert(accountCategories).values(category);
      }

      // إنشاء الحسابات الأساسية
      const defaultAccounts = [
        // حسابات الأصول
        { name: 'المخزون', nameEn: 'Inventory', code: '1001', categoryId: 1, type: 'debit', description: 'حساب المخزون الرئيسي' },
        { name: 'العملاء', nameEn: 'Accounts Receivable', code: '1002', categoryId: 1, type: 'debit', description: 'مديونية العملاء' },
        { name: 'النقدية بالصندوق', nameEn: 'Cash in Hand', code: '1003', categoryId: 1, type: 'debit', description: 'النقدية في الصندوق' },
        { name: 'البنك', nameEn: 'Bank Account', code: '1004', categoryId: 1, type: 'debit', description: 'الحساب البنكي' },
        
        // حسابات الخصوم
        { name: 'الموردين', nameEn: 'Accounts Payable', code: '2001', categoryId: 2, type: 'credit', description: 'دائنية الموردين' },
        { name: 'الضرائب المستحقة', nameEn: 'Taxes Payable', code: '2002', categoryId: 2, type: 'credit', description: 'الضرائب المستحقة الدفع' },
        
        // حسابات الإيرادات
        { name: 'مبيعات', nameEn: 'Sales Revenue', code: '4001', categoryId: 4, type: 'credit', description: 'إيرادات المبيعات' },
        { name: 'خصومات مسموحة', nameEn: 'Sales Discounts', code: '4002', categoryId: 4, type: 'debit', description: 'خصومات المبيعات المسموحة' },
        
        // حسابات المصروفات
        { name: 'تكلفة البضاعة المباعة', nameEn: 'Cost of Goods Sold', code: '5001', categoryId: 5, type: 'debit', description: 'تكلفة البضاعة المباعة' },
        { name: 'مشتريات', nameEn: 'Purchases', code: '5002', categoryId: 5, type: 'debit', description: 'حساب المشتريات' },
      ];

      for (const account of defaultAccounts) {
        await db.insert(accounts).values(account);
      }

      console.log('تم إنشاء الحسابات الأساسية بنجاح');
    } catch (error) {
      console.error('خطأ في إنشاء الحسابات الأساسية:', error);
    }
  }

  // إنشاء قيد محاسبي للمبيعات
  static async createSaleJournalEntry(saleData: any) {
    try {
      const entryNumber = await this.generateEntryNumber();
      const totalAmount = parseFloat(saleData.total);
      const taxAmount = parseFloat(saleData.tax || '0');
      const discountAmount = parseFloat(saleData.discount || '0');
      const netAmount = totalAmount - discountAmount + taxAmount;

      // إنشاء قيد المبيعات
      const [journalEntry] = await db.insert(journalEntries).values({
        entryNumber,
        date: new Date().toISOString().split('T')[0],
        description: `فاتورة مبيعات رقم ${saleData.saleNumber || 'غير محدد'}`,
        referenceType: 'sale',
        referenceId: saleData.id,
        totalDebit: netAmount.toString(),
        totalCredit: netAmount.toString(),
        status: 'posted'
      }).returning();

      const lines = [];

      // مدين العميل أو النقدية
      if (saleData.clientId) {
        lines.push({
          journalEntryId: journalEntry.id,
          accountId: await this.getAccountByCode('1002'), // العملاء
          description: 'مديونية عميل',
          debitAmount: netAmount.toString(),
          creditAmount: '0'
        });
      } else {
        lines.push({
          journalEntryId: journalEntry.id,
          accountId: await this.getAccountByCode('1003'), // النقدية
          description: 'نقدية من المبيعات',
          debitAmount: netAmount.toString(),
          creditAmount: '0'
        });
      }

      // دائن المبيعات
      lines.push({
        journalEntryId: journalEntry.id,
        accountId: await this.getAccountByCode('4001'), // المبيعات
        description: 'إيرادات مبيعات',
        debitAmount: '0',
        creditAmount: totalAmount.toString()
      });

      // خصم مسموح (إن وجد)
      if (discountAmount > 0) {
        lines.push({
          journalEntryId: journalEntry.id,
          accountId: await this.getAccountByCode('4002'), // خصومات مسموحة
          description: 'خصم مسموح',
          debitAmount: discountAmount.toString(),
          creditAmount: '0'
        });
      }

      // ضريبة (إن وجدت)
      if (taxAmount > 0) {
        lines.push({
          journalEntryId: journalEntry.id,
          accountId: await this.getAccountByCode('2002'), // الضرائب المستحقة
          description: 'ضريبة مبيعات',
          debitAmount: '0',
          creditAmount: taxAmount.toString()
        });
      }

      // إدراج خطوط القيد
      for (const line of lines) {
        await db.insert(journalEntryLines).values(line);
      }

      // إنشاء قيد تكلفة البضاعة المباعة
      await this.createCOGSEntry(saleData.items, journalEntry.id);

      return journalEntry;
    } catch (error) {
      console.error('خطأ في إنشاء قيد المبيعات:', error);
      throw error;
    }
  }

  // إنشاء قيد تكلفة البضاعة المباعة
  static async createCOGSEntry(items: any[], parentEntryId: number) {
    try {
      let totalCOGS = 0;

      for (const item of items) {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        if (product.length > 0) {
          const costPrice = parseFloat(product[0].purchasePrice || '0');
          const itemCOGS = costPrice * item.quantity;
          totalCOGS += itemCOGS;
        }
      }

      if (totalCOGS > 0) {
        // مدين تكلفة البضاعة المباعة
        await db.insert(journalEntryLines).values({
          journalEntryId: parentEntryId,
          accountId: await this.getAccountByCode('5001'), // تكلفة البضاعة المباعة
          description: 'تكلفة البضاعة المباعة',
          debitAmount: totalCOGS.toString(),
          creditAmount: '0'
        });

        // دائن المخزون
        await db.insert(journalEntryLines).values({
          journalEntryId: parentEntryId,
          accountId: await this.getAccountByCode('1001'), // المخزون
          description: 'تخفيض المخزون',
          debitAmount: '0',
          creditAmount: totalCOGS.toString()
        });

        // تحديث رصيد حساب المخزون
        await this.updateAccountBalance('1001', -totalCOGS);
      }
    } catch (error) {
      console.error('خطأ في إنشاء قيد تكلفة البضاعة المباعة:', error);
    }
  }

  // إنشاء قيد محاسبي للمشتريات
  static async createPurchaseJournalEntry(purchaseData: any) {
    try {
      const entryNumber = await this.generateEntryNumber();
      const totalAmount = parseFloat(purchaseData.total);

      // إنشاء قيد المشتريات
      const [journalEntry] = await db.insert(journalEntries).values({
        entryNumber,
        date: new Date().toISOString().split('T')[0],
        description: `فاتورة مشتريات من مورد`,
        referenceType: 'purchase',
        referenceId: purchaseData.id,
        totalDebit: totalAmount.toString(),
        totalCredit: totalAmount.toString(),
        status: 'posted'
      }).returning();

      // مدين المخزون (أو المشتريات)
      await db.insert(journalEntryLines).values({
        journalEntryId: journalEntry.id,
        accountId: await this.getAccountByCode('1001'), // المخزون
        description: 'شراء بضاعة',
        debitAmount: totalAmount.toString(),
        creditAmount: '0'
      });

      // دائن المورد أو النقدية
      if (purchaseData.supplierId) {
        await db.insert(journalEntryLines).values({
          journalEntryId: journalEntry.id,
          accountId: await this.getAccountByCode('2001'), // الموردين
          description: 'دائنية مورد',
          debitAmount: '0',
          creditAmount: totalAmount.toString()
        });
      } else {
        await db.insert(journalEntryLines).values({
          journalEntryId: journalEntry.id,
          accountId: await this.getAccountByCode('1003'), // النقدية
          description: 'دفع نقدي للمشتريات',
          debitAmount: '0',
          creditAmount: totalAmount.toString()
        });
      }

      // تحديث رصيد حساب المخزون
      await this.updateAccountBalance('1001', totalAmount);

      return journalEntry;
    } catch (error) {
      console.error('خطأ في إنشاء قيد المشتريات:', error);
      throw error;
    }
  }

  // تحديث رصيد حساب معين
  static async updateAccountBalance(accountCode: string, amount: number) {
    try {
      const accountId = await this.getAccountByCode(accountCode);
      if (accountId) {
        await db.update(accounts)
          .set({ 
            balance: sql`${accounts.balance} + ${amount}` 
          })
          .where(eq(accounts.id, accountId));
      }
    } catch (error) {
      console.error('خطأ في تحديث رصيد الحساب:', error);
    }
  }

  // الحصول على ID حساب من خلال الكود
  static async getAccountByCode(code: string): Promise<number> {
    try {
      const account = await db.select().from(accounts).where(eq(accounts.code, code)).limit(1);
      return account.length > 0 ? account[0].id : 0;
    } catch (error) {
      console.error('خطأ في البحث عن الحساب:', error);
      return 0;
    }
  }

  // إنشاء رقم قيد تلقائي
  static async generateEntryNumber(): Promise<string> {
    try {
      const lastEntry = await db.select()
        .from(journalEntries)
        .orderBy(sql`${journalEntries.id} DESC`)
        .limit(1);

      const nextNumber = lastEntry.length > 0 ? 
        parseInt(lastEntry[0].entryNumber.replace('JE-', '')) + 1 : 1;

      return `JE-${nextNumber.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error('خطأ في إنشاء رقم القيد:', error);
      return `JE-${Date.now()}`;
    }
  }

  // إدارة المخزون التلقائية
  static async updateInventoryFromSale(items: any[]) {
    try {
      for (const item of items) {
        // تقليل كمية المنتج
        await db.update(products)
          .set({ 
            quantity: sql`${products.quantity} - ${item.quantity}` 
          })
          .where(eq(products.id, item.productId));

        // إنشاء حركة مخزون
        await db.insert(inventoryMovements).values({
          productId: item.productId,
          type: 'sale',
          quantity: -item.quantity,
          unitPrice: item.unitPrice,
          total: -(item.quantity * item.unitPrice),
          description: `بيع - فاتورة مبيعات`,
          date: new Date()
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث المخزون من المبيعات:', error);
      throw error;
    }
  }

  static async updateInventoryFromPurchase(items: any[]) {
    try {
      for (const item of items) {
        // زيادة كمية المنتج
        await db.update(products)
          .set({ 
            quantity: sql`${products.quantity} + ${item.quantity}` 
          })
          .where(eq(products.id, item.productId));

        // إنشاء حركة مخزون
        await db.insert(inventoryMovements).values({
          productId: item.productId,
          type: 'purchase',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          description: `شراء - فاتورة مشتريات`,
          date: new Date()
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث المخزون من المشتريات:', error);
      throw error;
    }
  }
}