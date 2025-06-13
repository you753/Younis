import { 
  users, suppliers, clients, products, sales, purchases, employees, deductions, salaries, productCategories, quotes, salesReturns, purchaseReturns, supplierPaymentVouchers, clientReceiptVouchers, inventoryOpeningBalances, branches, invoiceTemplates, reportTemplates, companySettings, accountCategories, accounts, journalEntries, journalEntryLines,
  type User, type InsertUser,
  type Supplier, type InsertSupplier,
  type Client, type InsertClient,
  type Product, type InsertProduct,
  type Sale, type InsertSale,
  type Purchase, type InsertPurchase,
  type Employee, type InsertEmployee,
  type Deduction, type InsertDeduction,
  type Salary, type InsertSalary,
  type ProductCategory, type InsertProductCategory,
  type Quote, type InsertQuote,
  type SalesReturn, type InsertSalesReturn,
  type PurchaseReturn, type InsertPurchaseReturn,
  type SupplierPaymentVoucher, type InsertSupplierPaymentVoucher,
  type ClientReceiptVoucher, type InsertClientReceiptVoucher,
  type InventoryOpeningBalance, type InsertInventoryOpeningBalance,
  type Branch, type InsertBranch,
  type InvoiceTemplate, type InsertInvoiceTemplate,
  type ReportTemplate, type InsertReportTemplate,
  type CompanySettings, type InsertCompanySettings,
  type AccountCategory, type InsertAccountCategory,
  type Account, type InsertAccount,
  type JournalEntry, type InsertJournalEntry,
  type JournalEntryLine, type InsertJournalEntryLine
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Users (Authentication only)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Suppliers
  getSupplier(id: number): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Sales
  getAllSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;

  // Purchases
  getAllPurchases(): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;

  // Employees
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Deductions
  getDeduction(id: number): Promise<Deduction | undefined>;
  getAllDeductions(): Promise<Deduction[]>;
  getDeductionsByEmployeeId(employeeId: number): Promise<Deduction[]>;
  createDeduction(deduction: InsertDeduction): Promise<Deduction>;
  updateDeduction(id: number, deduction: Partial<InsertDeduction>): Promise<Deduction | undefined>;
  deleteDeduction(id: number): Promise<boolean>;

  // Salaries
  getSalary(id: number): Promise<Salary | undefined>;
  getAllSalaries(): Promise<Salary[]>;
  getSalariesByEmployeeId(employeeId: number): Promise<Salary[]>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined>;
  deleteSalary(id: number): Promise<boolean>;

  // Product Categories
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  getAllProductCategories(): Promise<ProductCategory[]>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  updateProductCategory(id: number, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined>;
  deleteProductCategory(id: number): Promise<boolean>;

  // Quotes
  getQuote(id: number): Promise<Quote | undefined>;
  getAllQuotes(): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;

  // Sales Returns
  getSalesReturn(id: number): Promise<SalesReturn | undefined>;
  getAllSalesReturns(): Promise<SalesReturn[]>;
  createSalesReturn(salesReturn: InsertSalesReturn): Promise<SalesReturn>;
  updateSalesReturn(id: number, salesReturn: Partial<InsertSalesReturn>): Promise<SalesReturn | undefined>;
  deleteSalesReturn(id: number): Promise<boolean>;

  // Purchase Returns
  getPurchaseReturn(id: number): Promise<PurchaseReturn | undefined>;
  getAllPurchaseReturns(): Promise<PurchaseReturn[]>;
  createPurchaseReturn(purchaseReturn: InsertPurchaseReturn): Promise<PurchaseReturn>;
  updatePurchaseReturn(id: number, purchaseReturn: Partial<InsertPurchaseReturn>): Promise<PurchaseReturn | undefined>;
  deletePurchaseReturn(id: number): Promise<boolean>;

  // Supplier Payment Vouchers
  getSupplierPaymentVoucher(id: number): Promise<SupplierPaymentVoucher | undefined>;
  getAllSupplierPaymentVouchers(): Promise<SupplierPaymentVoucher[]>;
  getSupplierPaymentVouchersBySupplierId(supplierId: number): Promise<SupplierPaymentVoucher[]>;
  createSupplierPaymentVoucher(voucher: InsertSupplierPaymentVoucher): Promise<SupplierPaymentVoucher>;
  updateSupplierPaymentVoucher(id: number, voucher: Partial<InsertSupplierPaymentVoucher>): Promise<SupplierPaymentVoucher | undefined>;
  deleteSupplierPaymentVoucher(id: number): Promise<boolean>;

  // Client Receipt Vouchers
  getClientReceiptVoucher(id: number): Promise<ClientReceiptVoucher | undefined>;
  getAllClientReceiptVouchers(): Promise<ClientReceiptVoucher[]>;
  getClientReceiptVouchersByClientId(clientId: number): Promise<ClientReceiptVoucher[]>;
  createClientReceiptVoucher(voucher: InsertClientReceiptVoucher): Promise<ClientReceiptVoucher>;
  updateClientReceiptVoucher(id: number, voucher: Partial<InsertClientReceiptVoucher>): Promise<ClientReceiptVoucher | undefined>;
  deleteClientReceiptVoucher(id: number): Promise<boolean>;

  // Inventory Opening Balances
  getInventoryOpeningBalance(id: number): Promise<InventoryOpeningBalance | undefined>;
  getAllInventoryOpeningBalances(): Promise<InventoryOpeningBalance[]>;
  getInventoryOpeningBalanceByProductId(productId: number): Promise<InventoryOpeningBalance | undefined>;
  createInventoryOpeningBalance(balance: InsertInventoryOpeningBalance): Promise<InventoryOpeningBalance>;
  updateInventoryOpeningBalance(id: number, balance: Partial<InsertInventoryOpeningBalance>): Promise<InventoryOpeningBalance | undefined>;
  deleteInventoryOpeningBalance(id: number): Promise<boolean>;

  // Branches
  getBranch(id: number): Promise<Branch | undefined>;
  getAllBranches(): Promise<Branch[]>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined>;
  deleteBranch(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalClients: number;
    totalSales: string;
    totalPurchases: string;
    inventoryValue: string;
  }>;

  // Invoice Templates
  getInvoiceTemplate(id: number): Promise<InvoiceTemplate | undefined>;
  getAllInvoiceTemplates(): Promise<InvoiceTemplate[]>;
  getInvoiceTemplatesByType(type: string): Promise<InvoiceTemplate[]>;
  getDefaultInvoiceTemplate(type: string): Promise<InvoiceTemplate | undefined>;
  createInvoiceTemplate(template: InsertInvoiceTemplate): Promise<InvoiceTemplate>;
  updateInvoiceTemplate(id: number, template: Partial<InsertInvoiceTemplate>): Promise<InvoiceTemplate | undefined>;
  deleteInvoiceTemplate(id: number): Promise<boolean>;
  setDefaultInvoiceTemplate(id: number, type: string): Promise<boolean>;

  // Report Templates
  getReportTemplate(id: number): Promise<ReportTemplate | undefined>;
  getAllReportTemplates(): Promise<ReportTemplate[]>;
  getReportTemplatesByType(type: string): Promise<ReportTemplate[]>;
  getDefaultReportTemplate(type: string): Promise<ReportTemplate | undefined>;
  createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate>;
  updateReportTemplate(id: number, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined>;
  deleteReportTemplate(id: number): Promise<boolean>;
  setDefaultReportTemplate(id: number, type: string): Promise<boolean>;

  // Company Settings
  getCompanySettings(): Promise<CompanySettings | undefined>;
  updateCompanySettings(settings: Partial<InsertCompanySettings>): Promise<CompanySettings>;

  // Accounting System
  // Account Categories
  getAccountCategory(id: number): Promise<AccountCategory | undefined>;
  getAllAccountCategories(): Promise<AccountCategory[]>;
  createAccountCategory(category: InsertAccountCategory): Promise<AccountCategory>;
  updateAccountCategory(id: number, category: Partial<InsertAccountCategory>): Promise<AccountCategory | undefined>;
  deleteAccountCategory(id: number): Promise<boolean>;

  // Accounts
  getAccount(id: number): Promise<Account | undefined>;
  getAllAccounts(): Promise<Account[]>;
  getAccountsByCategory(categoryId: number): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;

  // Journal Entries
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getAllJournalEntries(): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;

  // Journal Entry Lines
  getJournalEntryLines(journalEntryId: number): Promise<JournalEntryLine[]>;
  createJournalEntryLine(line: InsertJournalEntryLine): Promise<JournalEntryLine>;
  
  // Accounting Reports
  getTrialBalance(): Promise<any[]>;
  getBalanceSheet(): Promise<any>;
  getIncomeStatement(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  // Supplier methods
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return db.select().from(suppliers);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db.update(suppliers)
      .set(supplier)
      .where(eq(suppliers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Client methods  
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getAllClients(): Promise<Client[]> {
    return db.select().from(clients);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client).returning();
    return created;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updated] = await db.update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Sales methods
  async getAllSales(): Promise<Sale[]> {
    return db.select().from(sales).orderBy(desc(sales.id));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [created] = await db.insert(sales).values(sale).returning();
    return created;
  }

  // Purchase methods
  async getAllPurchases(): Promise<Purchase[]> {
    return db.select().from(purchases).orderBy(desc(purchases.id));
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [created] = await db.insert(purchases).values(purchase).returning();
    return created;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalClients: number;
    totalSales: string;
    totalPurchases: string;
    inventoryValue: string;
  }> {
    const clientsCount = await db.select({ count: sql<number>`count(*)` }).from(clients);
    const salesSum = await db.select({ total: sql<string>`coalesce(sum(${sales.total}), '0')` }).from(sales);
    const purchasesSum = await db.select({ total: sql<string>`coalesce(sum(${purchases.total}), '0')` }).from(purchases);
    const productsValue = await db.select({ 
      value: sql<string>`coalesce(sum(${products.quantity} * ${products.purchasePrice}), '0')` 
    }).from(products);

    return {
      totalClients: clientsCount[0]?.count || 0,
      totalSales: salesSum[0]?.total || "0.00",
      totalPurchases: purchasesSum[0]?.total || "0.00",
      inventoryValue: productsValue[0]?.value || "0.00"
    };
  }

  // Accounting System Implementation

  // Account Categories
  async getAccountCategory(id: number): Promise<AccountCategory | undefined> {
    const [category] = await db.select().from(accountCategories).where(eq(accountCategories.id, id));
    return category || undefined;
  }

  async getAllAccountCategories(): Promise<AccountCategory[]> {
    return db.select().from(accountCategories);
  }

  async createAccountCategory(category: InsertAccountCategory): Promise<AccountCategory> {
    const [created] = await db.insert(accountCategories).values(category).returning();
    return created;
  }

  async updateAccountCategory(id: number, category: Partial<InsertAccountCategory>): Promise<AccountCategory | undefined> {
    const [updated] = await db.update(accountCategories)
      .set(category)
      .where(eq(accountCategories.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAccountCategory(id: number): Promise<boolean> {
    const result = await db.delete(accountCategories).where(eq(accountCategories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Accounts
  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async getAllAccounts(): Promise<Account[]> {
    return db.select().from(accounts);
  }

  async getAccountsByCategory(categoryId: number): Promise<Account[]> {
    return db.select().from(accounts).where(eq(accounts.categoryId, categoryId));
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [created] = await db.insert(accounts).values(account).returning();
    return created;
  }

  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updated] = await db.update(accounts)
      .set(account)
      .where(eq(accounts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAccount(id: number): Promise<boolean> {
    const result = await db.delete(accounts).where(eq(accounts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Journal Entries
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    return db.select().from(journalEntries).orderBy(desc(journalEntries.id));
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [created] = await db.insert(journalEntries).values(entry).returning();
    return created;
  }

  async updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [updated] = await db.update(journalEntries)
      .set(entry)
      .where(eq(journalEntries.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Journal Entry Lines
  async getJournalEntryLines(journalEntryId: number): Promise<JournalEntryLine[]> {
    return db.select().from(journalEntryLines).where(eq(journalEntryLines.journalEntryId, journalEntryId));
  }

  async createJournalEntryLine(line: InsertJournalEntryLine): Promise<JournalEntryLine> {
    const [created] = await db.insert(journalEntryLines).values(line).returning();
    return created;
  }

  // Accounting Reports
  async getTrialBalance(): Promise<any[]> {
    const accountsWithBalances = await db.select({
      id: accounts.id,
      name: accounts.name,
      code: accounts.code,
      type: accounts.type,
      balance: accounts.balance
    }).from(accounts).where(eq(accounts.isActive, true));

    return accountsWithBalances.map(account => ({
      ...account,
      debitBalance: account.type === 'debit' ? parseFloat(account.balance || '0') : 0,
      creditBalance: account.type === 'credit' ? parseFloat(account.balance || '0') : 0
    }));
  }

  async getBalanceSheet(): Promise<any> {
    const assets = await db.select().from(accounts)
      .innerJoin(accountCategories, eq(accounts.categoryId, accountCategories.id))
      .where(eq(accountCategories.type, 'assets'));

    const liabilities = await db.select().from(accounts)
      .innerJoin(accountCategories, eq(accounts.categoryId, accountCategories.id))
      .where(eq(accountCategories.type, 'liabilities'));

    const equity = await db.select().from(accounts)
      .innerJoin(accountCategories, eq(accounts.categoryId, accountCategories.id))
      .where(eq(accountCategories.type, 'equity'));

    return {
      assets,
      liabilities,
      equity,
      totalAssets: assets.reduce((sum, account) => sum + parseFloat(account.accounts.balance || '0'), 0),
      totalLiabilities: liabilities.reduce((sum, account) => sum + parseFloat(account.accounts.balance || '0'), 0),
      totalEquity: equity.reduce((sum, account) => sum + parseFloat(account.accounts.balance || '0'), 0)
    };
  }

  async getIncomeStatement(): Promise<any> {
    const revenue = await db.select().from(accounts)
      .innerJoin(accountCategories, eq(accounts.categoryId, accountCategories.id))
      .where(eq(accountCategories.type, 'revenue'));

    const expenses = await db.select().from(accounts)
      .innerJoin(accountCategories, eq(accounts.categoryId, accountCategories.id))
      .where(eq(accountCategories.type, 'expenses'));

    const totalRevenue = revenue.reduce((sum, account) => sum + parseFloat(account.accounts.balance || '0'), 0);
    const totalExpenses = expenses.reduce((sum, account) => sum + parseFloat(account.accounts.balance || '0'), 0);

    return {
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses
    };
  }

  // Placeholder implementations for remaining methods - these would need full implementations
  async getEmployee(id: number): Promise<Employee | undefined> { return undefined; }
  async getAllEmployees(): Promise<Employee[]> { return []; }
  async createEmployee(employee: InsertEmployee): Promise<Employee> { throw new Error("Not implemented"); }
  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> { return undefined; }
  async deleteEmployee(id: number): Promise<boolean> { return false; }

  async getDeduction(id: number): Promise<Deduction | undefined> { return undefined; }
  async getAllDeductions(): Promise<Deduction[]> { return []; }
  async getDeductionsByEmployeeId(employeeId: number): Promise<Deduction[]> { return []; }
  async createDeduction(deduction: InsertDeduction): Promise<Deduction> { throw new Error("Not implemented"); }
  async updateDeduction(id: number, deduction: Partial<InsertDeduction>): Promise<Deduction | undefined> { return undefined; }
  async deleteDeduction(id: number): Promise<boolean> { return false; }

  async getSalary(id: number): Promise<Salary | undefined> { return undefined; }
  async getAllSalaries(): Promise<Salary[]> { return []; }
  async getSalariesByEmployeeId(employeeId: number): Promise<Salary[]> { return []; }
  async createSalary(salary: InsertSalary): Promise<Salary> { throw new Error("Not implemented"); }
  async updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined> { return undefined; }
  async deleteSalary(id: number): Promise<boolean> { return false; }

  async getProductCategory(id: number): Promise<ProductCategory | undefined> { return undefined; }
  async getAllProductCategories(): Promise<ProductCategory[]> { return []; }
  async createProductCategory(category: InsertProductCategory): Promise<ProductCategory> { throw new Error("Not implemented"); }
  async updateProductCategory(id: number, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined> { return undefined; }
  async deleteProductCategory(id: number): Promise<boolean> { return false; }

  async getQuote(id: number): Promise<Quote | undefined> { return undefined; }
  async getAllQuotes(): Promise<Quote[]> { return []; }
  async createQuote(quote: InsertQuote): Promise<Quote> { throw new Error("Not implemented"); }
  async updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined> { return undefined; }
  async deleteQuote(id: number): Promise<boolean> { return false; }

  async getSalesReturn(id: number): Promise<SalesReturn | undefined> { return undefined; }
  async getAllSalesReturns(): Promise<SalesReturn[]> { return []; }
  async createSalesReturn(salesReturn: InsertSalesReturn): Promise<SalesReturn> { throw new Error("Not implemented"); }
  async updateSalesReturn(id: number, salesReturn: Partial<InsertSalesReturn>): Promise<SalesReturn | undefined> { return undefined; }
  async deleteSalesReturn(id: number): Promise<boolean> { return false; }

  async getPurchaseReturn(id: number): Promise<PurchaseReturn | undefined> { return undefined; }
  async getAllPurchaseReturns(): Promise<PurchaseReturn[]> { return []; }
  async createPurchaseReturn(purchaseReturn: InsertPurchaseReturn): Promise<PurchaseReturn> { throw new Error("Not implemented"); }
  async updatePurchaseReturn(id: number, purchaseReturn: Partial<InsertPurchaseReturn>): Promise<PurchaseReturn | undefined> { return undefined; }
  async deletePurchaseReturn(id: number): Promise<boolean> { return false; }

  async getSupplierPaymentVoucher(id: number): Promise<SupplierPaymentVoucher | undefined> { return undefined; }
  async getAllSupplierPaymentVouchers(): Promise<SupplierPaymentVoucher[]> { return []; }
  async getSupplierPaymentVouchersBySupplierId(supplierId: number): Promise<SupplierPaymentVoucher[]> { return []; }
  async createSupplierPaymentVoucher(voucher: InsertSupplierPaymentVoucher): Promise<SupplierPaymentVoucher> { throw new Error("Not implemented"); }
  async updateSupplierPaymentVoucher(id: number, voucher: Partial<InsertSupplierPaymentVoucher>): Promise<SupplierPaymentVoucher | undefined> { return undefined; }
  async deleteSupplierPaymentVoucher(id: number): Promise<boolean> { return false; }

  async getClientReceiptVoucher(id: number): Promise<ClientReceiptVoucher | undefined> { return undefined; }
  async getAllClientReceiptVouchers(): Promise<ClientReceiptVoucher[]> { return []; }
  async getClientReceiptVouchersByClientId(clientId: number): Promise<ClientReceiptVoucher[]> { return []; }
  async createClientReceiptVoucher(voucher: InsertClientReceiptVoucher): Promise<ClientReceiptVoucher> { throw new Error("Not implemented"); }
  async updateClientReceiptVoucher(id: number, voucher: Partial<InsertClientReceiptVoucher>): Promise<ClientReceiptVoucher | undefined> { return undefined; }
  async deleteClientReceiptVoucher(id: number): Promise<boolean> { return false; }

  async getInventoryOpeningBalance(id: number): Promise<InventoryOpeningBalance | undefined> { return undefined; }
  async getAllInventoryOpeningBalances(): Promise<InventoryOpeningBalance[]> { return []; }
  async getInventoryOpeningBalanceByProductId(productId: number): Promise<InventoryOpeningBalance | undefined> { return undefined; }
  async createInventoryOpeningBalance(balance: InsertInventoryOpeningBalance): Promise<InventoryOpeningBalance> { throw new Error("Not implemented"); }
  async updateInventoryOpeningBalance(id: number, balance: Partial<InsertInventoryOpeningBalance>): Promise<InventoryOpeningBalance | undefined> { return undefined; }
  async deleteInventoryOpeningBalance(id: number): Promise<boolean> { return false; }

  async getBranch(id: number): Promise<Branch | undefined> { return undefined; }
  async getAllBranches(): Promise<Branch[]> { return []; }
  async createBranch(branch: InsertBranch): Promise<Branch> { throw new Error("Not implemented"); }
  async updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined> { return undefined; }
  async deleteBranch(id: number): Promise<boolean> { return false; }

  async getInvoiceTemplate(id: number): Promise<InvoiceTemplate | undefined> { return undefined; }
  async getAllInvoiceTemplates(): Promise<InvoiceTemplate[]> { return []; }
  async getInvoiceTemplatesByType(type: string): Promise<InvoiceTemplate[]> { return []; }
  async getDefaultInvoiceTemplate(type: string): Promise<InvoiceTemplate | undefined> { return undefined; }
  async createInvoiceTemplate(template: InsertInvoiceTemplate): Promise<InvoiceTemplate> { throw new Error("Not implemented"); }
  async updateInvoiceTemplate(id: number, template: Partial<InsertInvoiceTemplate>): Promise<InvoiceTemplate | undefined> { return undefined; }
  async deleteInvoiceTemplate(id: number): Promise<boolean> { return false; }
  async setDefaultInvoiceTemplate(id: number, type: string): Promise<boolean> { return false; }

  async getReportTemplate(id: number): Promise<ReportTemplate | undefined> { return undefined; }
  async getAllReportTemplates(): Promise<ReportTemplate[]> { return []; }
  async getReportTemplatesByType(type: string): Promise<ReportTemplate[]> { return []; }
  async getDefaultReportTemplate(type: string): Promise<ReportTemplate | undefined> { return undefined; }
  async createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate> { throw new Error("Not implemented"); }
  async updateReportTemplate(id: number, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined> { return undefined; }
  async deleteReportTemplate(id: number): Promise<boolean> { return false; }
  async setDefaultReportTemplate(id: number, type: string): Promise<boolean> { return false; }

  async getCompanySettings(): Promise<CompanySettings | undefined> { return undefined; }
  async updateCompanySettings(settings: Partial<InsertCompanySettings>): Promise<CompanySettings> { throw new Error("Not implemented"); }
}

export const storage = new DatabaseStorage();