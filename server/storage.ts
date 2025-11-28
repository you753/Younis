import { 
  users, suppliers, clients, products, sales, purchases, employees, holidays, deductions, salaries, productCategories, quotes, salesReturns, purchaseReturns, purchaseOrders, goodsReceiptVouchers, goodsIssueVouchers, supplierPaymentVouchers, clientReceiptVouchers, inventoryOpeningBalances, branches, withdrawalVouchers, accountingTree, posTerminals, posSales, branchTemplates, journalEntries, journalEntryDetails, clientOpeningBalances, dailyExpenses,
  type User, type InsertUser,
  type Supplier, type InsertSupplier,
  type Client, type InsertClient,
  type Product, type InsertProduct,
  type Sale, type InsertSale,
  type Purchase, type InsertPurchase,
  type Employee, type InsertEmployee,
  type Holiday, type InsertHoliday,
  type Deduction, type InsertDeduction,
  type Salary, type InsertSalary,
  type ProductCategory, type InsertProductCategory,
  type Quote, type InsertQuote,
  type SalesReturn, type InsertSalesReturn,
  type PurchaseReturn, type InsertPurchaseReturn,
  type PurchaseOrder, type InsertPurchaseOrder,
  type GoodsReceiptVoucher, type InsertGoodsReceiptVoucher,
  type GoodsIssueVoucher, type InsertGoodsIssueVoucher,
  type SupplierPaymentVoucher, type InsertSupplierPaymentVoucher,
  type ClientReceiptVoucher, type InsertClientReceiptVoucher,
  type InventoryOpeningBalance, type InsertInventoryOpeningBalance,
  type Branch, type InsertBranch,
  type WithdrawalVoucher, type InsertWithdrawalVoucher,
  type AccountingTree, type InsertAccountingTree,
  type PosTerminal, type InsertPosTerminal,
  type PosSale, type InsertPosSale,
  type BranchTemplate, type InsertBranchTemplate,
  type JournalEntry, type InsertJournalEntry,
  type JournalEntryDetail, type InsertJournalEntryDetail,
  type ClientOpeningBalance, type InsertClientOpeningBalance,
  type DailyExpense, type InsertDailyExpense
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
  getAllProducts(branchId?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Inventory Management
  processInventoryTransaction(productId: number, quantity: number, transactionType: 'sale' | 'purchase' | 'return' | 'adjustment' | 'return_purchase' | 'return_sale'): Promise<void>;
  autoRegisterProduct(productData: { name: string; code?: string; price?: string; barcode?: string }): Promise<Product>;

  // Balance Management
  updateSupplierBalance(supplierId: number, amount: number, operation: 'increase' | 'decrease'): Promise<void>;
  updateClientBalance(clientId: number, amount: number, operation: 'increase' | 'decrease'): Promise<void>;

  // Sales
  getSale(id: number): Promise<Sale | undefined>;
  getAllSales(branchId?: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined>;
  deleteSale(id: number): Promise<boolean>;

  // Purchases
  getPurchase(id: number): Promise<Purchase | undefined>;
  getAllPurchases(): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase | undefined>;

  // Employees
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Deductions
  getDeduction(id: number): Promise<Deduction | undefined>;
  getAllDeductions(): Promise<Deduction[]>;
  createDeduction(deduction: InsertDeduction): Promise<Deduction>;
  updateDeduction(id: number, deduction: Partial<InsertDeduction>): Promise<Deduction | undefined>;
  deleteDeduction(id: number): Promise<boolean>;

  // Salaries
  getSalary(id: number): Promise<Salary | undefined>;
  getAllSalaries(): Promise<Salary[]>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined>;
  deleteSalary(id: number): Promise<boolean>;

  // Product Categories
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  getAllProductCategories(branchId?: number): Promise<ProductCategory[]>;
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

  // Purchase Orders
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  getAllPurchaseOrders(): Promise<PurchaseOrder[]>;
  createPurchaseOrder(purchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, purchaseOrder: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: number): Promise<boolean>;

  // Goods Receipt Vouchers
  getGoodsReceiptVoucher(id: number): Promise<GoodsReceiptVoucher | undefined>;
  getAllGoodsReceiptVouchers(): Promise<GoodsReceiptVoucher[]>;
  createGoodsReceiptVoucher(voucher: InsertGoodsReceiptVoucher): Promise<GoodsReceiptVoucher>;
  updateGoodsReceiptVoucher(id: number, voucher: Partial<InsertGoodsReceiptVoucher>): Promise<GoodsReceiptVoucher | undefined>;
  deleteGoodsReceiptVoucher(id: number): Promise<boolean>;

  // Goods Issue Vouchers
  getGoodsIssueVoucher(id: number): Promise<GoodsIssueVoucher | undefined>;
  getAllGoodsIssueVouchers(branchId?: number): Promise<GoodsIssueVoucher[]>;
  createGoodsIssueVoucher(voucher: InsertGoodsIssueVoucher): Promise<GoodsIssueVoucher>;
  updateGoodsIssueVoucher(id: number, voucher: Partial<InsertGoodsIssueVoucher>): Promise<GoodsIssueVoucher | undefined>;
  deleteGoodsIssueVoucher(id: number): Promise<boolean>;

  // Supplier Payment Vouchers
  getSupplierPaymentVoucher(id: number): Promise<SupplierPaymentVoucher | undefined>;
  getAllSupplierPaymentVouchers(branchId?: number): Promise<SupplierPaymentVoucher[]>;
  getSupplierPaymentVouchersBySupplierId(supplierId: number): Promise<SupplierPaymentVoucher[]>;
  createSupplierPaymentVoucher(voucher: InsertSupplierPaymentVoucher): Promise<SupplierPaymentVoucher>;
  updateSupplierPaymentVoucher(id: number, voucher: Partial<InsertSupplierPaymentVoucher>): Promise<SupplierPaymentVoucher | undefined>;
  deleteSupplierPaymentVoucher(id: number): Promise<boolean>;

  // Client Receipt Vouchers
  getClientReceiptVoucher(id: number): Promise<ClientReceiptVoucher | undefined>;
  getAllClientReceiptVouchers(branchId?: number): Promise<ClientReceiptVoucher[]>;
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

  // Inventory Management
  updateProductQuantity(productId: number, quantity: number): Promise<Product | undefined>;
  addToInventory(productId: number, quantity: number, reason?: string, referenceType?: string, referenceId?: number, referenceNumber?: string): Promise<Product | undefined>;
  subtractFromInventory(productId: number, quantity: number, reason?: string, referenceType?: string, referenceId?: number, referenceNumber?: string): Promise<Product | undefined>;
  
  // Inventory Movements
  getInventoryMovements(): Promise<InventoryMovement[]>;
  getInventoryMovementsByProduct(productId: number): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  getInventoryMovementsByReference(referenceType: string, referenceId: number): Promise<InventoryMovement[]>;


  // Branches
  getBranch(id: number): Promise<Branch | undefined>;
  getAllBranches(): Promise<Branch[]>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined>;
  deleteBranch(id: number): Promise<boolean>;

  // Withdrawal Vouchers
  getWithdrawalVoucherById(id: number): Promise<WithdrawalVoucher | undefined>;
  getWithdrawalVouchers(): Promise<WithdrawalVoucher[]>;
  createWithdrawalVoucher(voucher: InsertWithdrawalVoucher): Promise<WithdrawalVoucher>;
  updateWithdrawalVoucher(id: number, voucher: Partial<InsertWithdrawalVoucher>): Promise<WithdrawalVoucher | undefined>;
  deleteWithdrawalVoucher(id: number): Promise<boolean>;
  approveWithdrawalVoucher(id: number, userId: number): Promise<WithdrawalVoucher | undefined>;

  // Accounting Tree
  getAccountingTreeNode(id: number): Promise<AccountingTree | undefined>;
  getAllAccountingTree(): Promise<AccountingTree[]>;
  getAccountingTreeByBranch(branchId: number): Promise<AccountingTree[]>;
  createAccountingTreeNode(node: InsertAccountingTree): Promise<AccountingTree>;
  updateAccountingTreeNode(id: number, node: Partial<InsertAccountingTree>): Promise<AccountingTree | undefined>;
  deleteAccountingTreeNode(id: number): Promise<boolean>;

  // POS Terminals
  getPosTerminal(id: number): Promise<PosTerminal | undefined>;
  getAllPosTerminals(): Promise<PosTerminal[]>;
  getPosTerminalsByBranch(branchId: number): Promise<PosTerminal[]>;
  createPosTerminal(terminal: InsertPosTerminal): Promise<PosTerminal>;
  updatePosTerminal(id: number, terminal: Partial<InsertPosTerminal>): Promise<PosTerminal | undefined>;
  deletePosTerminal(id: number): Promise<boolean>;

  // POS Sales
  getPosSale(id: number): Promise<PosSale | undefined>;
  getAllPosSales(): Promise<PosSale[]>;
  getPosSalesByBranch(branchId: number): Promise<PosSale[]>;
  createPosSale(sale: InsertPosSale): Promise<PosSale>;
  updatePosSale(id: number, sale: Partial<InsertPosSale>): Promise<PosSale | undefined>;
  deletePosSale(id: number): Promise<boolean>;

  // Branch Templates
  getBranchTemplate(id: number): Promise<BranchTemplate | undefined>;
  getAllBranchTemplates(): Promise<BranchTemplate[]>;
  getBranchTemplatesByBranch(branchId: number): Promise<BranchTemplate[]>;
  createBranchTemplate(template: InsertBranchTemplate): Promise<BranchTemplate>;
  updateBranchTemplate(id: number, template: Partial<InsertBranchTemplate>): Promise<BranchTemplate | undefined>;
  deleteBranchTemplate(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalClients: number;
    totalSales: string;
    totalPurchases: string;
    inventoryValue: string;
  }>;

  // Accounting Tree
  getAccountingTree(branchId?: number): Promise<AccountingTree[]>;
  getAccountingTreeById(id: number): Promise<AccountingTree | undefined>;
  createAccountingTreeNode(node: InsertAccountingTree): Promise<AccountingTree>;
  updateAccountingTreeNode(id: number, node: Partial<InsertAccountingTree>): Promise<AccountingTree | undefined>;
  deleteAccountingTreeNode(id: number): Promise<boolean>;
  getAccountingTreeByType(accountType: string, branchId?: number): Promise<AccountingTree[]>;

  // POS Terminals
  getPosTerminal(id: number): Promise<PosTerminal | undefined>;
  getPosTerminalsByBranch(branchId: number): Promise<PosTerminal[]>;
  createPosTerminal(terminal: InsertPosTerminal): Promise<PosTerminal>;
  updatePosTerminal(id: number, terminal: Partial<InsertPosTerminal>): Promise<PosTerminal | undefined>;
  deletePosTerminal(id: number): Promise<boolean>;
  openPosTerminal(id: number, userId: number, startAmount: number): Promise<PosTerminal | undefined>;
  closePosTerminal(id: number, userId: number, endAmount: number): Promise<PosTerminal | undefined>;

  // POS Sales
  getPosSale(id: number): Promise<PosSale | undefined>;
  getPosSalesByTerminal(terminalId: number): Promise<PosSale[]>;
  getPosSalesByBranch(branchId: number): Promise<PosSale[]>;
  createPosSale(sale: InsertPosSale): Promise<PosSale>;
  updatePosSale(id: number, sale: Partial<InsertPosSale>): Promise<PosSale | undefined>;
  cancelPosSale(id: number): Promise<PosSale | undefined>;
  refundPosSale(id: number): Promise<PosSale | undefined>;

  // Branch Templates
  getBranchTemplate(id: number): Promise<BranchTemplate | undefined>;
  getBranchTemplatesByBranch(branchId: number): Promise<BranchTemplate[]>;
  getBranchTemplateByType(branchId: number, templateType: string): Promise<BranchTemplate | undefined>;
  createBranchTemplate(template: InsertBranchTemplate): Promise<BranchTemplate>;
  updateBranchTemplate(id: number, template: Partial<InsertBranchTemplate>): Promise<BranchTemplate | undefined>;
  deleteBranchTemplate(id: number): Promise<boolean>;

  // Journal Entries
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getJournalEntriesByBranch(branchId: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry, details: InsertJournalEntryDetail[]): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  approveJournalEntry(id: number, userId: number): Promise<JournalEntry | undefined>;
  getJournalEntryDetails(entryId: number): Promise<JournalEntryDetail[]>;

  // Holidays
  getAllHolidays(): Promise<Holiday[]>;
  getHoliday(id: number): Promise<Holiday | undefined>;
  createHoliday(holiday: InsertHoliday): Promise<Holiday>;
  updateHoliday(id: number, holiday: Partial<InsertHoliday>): Promise<Holiday | undefined>;
  deleteHoliday(id: number): Promise<boolean>;
  updateHolidayStatus(id: number, status: string): Promise<Holiday | undefined>;

  // Daily Expenses
  createDailyExpense(expense: InsertDailyExpense): DailyExpense;
  getDailyExpense(id: number): DailyExpense | undefined;
  getAllDailyExpenses(): DailyExpense[];
  getDailyExpensesByBranch(branchId: number): DailyExpense[];
  updateDailyExpense(id: number, expense: Partial<InsertDailyExpense>): DailyExpense | undefined;
  deleteDailyExpense(id: number): boolean;

  // Inventory Transfers - إرسال واستقبال المخزون
  getAllInventoryTransfers(): InventoryTransfer[];
  getInventoryTransfer(id: number): InventoryTransfer | undefined;
  createInventoryTransfer(transfer: InsertInventoryTransfer): InventoryTransfer;
  updateInventoryTransfer(id: number, transfer: Partial<InsertInventoryTransfer>): InventoryTransfer | undefined;
  deleteInventoryTransfer(id: number): boolean;
  getInventoryTransfersByBranch(branchId: number): InventoryTransfer[];
}

// نظام تخزين مؤقت في الذاكرة بدلاً من قاعدة البيانات
class MemoryStorage implements IStorage {
  private users: User[] = [];
  private suppliers: Supplier[] = [];
  private clients: Client[] = [];
  private products: Product[] = [];
  private sales: Sale[] = [];
  private purchases: Purchase[] = [];
  private employees: Employee[] = [];
  private holidays: Holiday[] = [];
  private deductions: Deduction[] = [];
  private salaries: Salary[] = [];
  private productCategories: ProductCategory[] = [];
  private quotes: Quote[] = [];
  private salesReturns: SalesReturn[] = [];
  private purchaseReturns: PurchaseReturn[] = [];
  private purchaseOrders: PurchaseOrder[] = [];
  private goodsReceiptVouchers: GoodsReceiptVoucher[] = [];
  private supplierPaymentVouchers: SupplierPaymentVoucher[] = [];
  private clientReceiptVouchers: ClientReceiptVoucher[] = [];
  private inventoryOpeningBalances: InventoryOpeningBalance[] = [];
  private branches: Branch[] = [];
  private withdrawalVouchers: WithdrawalVoucher[] = [];
  private accountingTree: AccountingTree[] = [];
  private posTerminals: PosTerminal[] = [];
  private posSales: PosSale[] = [];
  private branchTemplates: BranchTemplate[] = [];
  private journalEntries: JournalEntry[] = [];
  private journalEntryDetails: JournalEntryDetail[] = [];
  private dailyExpenses: DailyExpense[] = [];
  private inventoryTransfers: InventoryTransfer[] = [];

  private nextId = 1;

  constructor() {
    // إضافة بيانات أولية للاختبار
    this.employees = [
      {
        id: 1,
        name: "أحمد محمد",
        position: "مدير مبيعات",
        department: "المبيعات",
        hireDate: new Date("2024-01-15"),
        salary: "5000",
        phone: "0501234567",
        email: "ahmed@test.com",
        address: "الرياض",
        emergencyContact: "0509876543",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.deductions = [
      {
        id: 1,
        employeeId: 1,
        amount: "200",
        reason: "تأخير",
        date: new Date("2025-06-01"),
        description: "خصم بسبب التأخير",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.clients = [
      {
        id: 1,
        name: "عميل تجريبي",
        email: "client@test.com",
        phone: "0501111111",
        address: "الرياض",
        balance: "0",
        creditLimit: "10000",
        paymentTerms: "نقداً",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.products = [
      {
        id: 1,
        name: "منتج تجريبي",
        code: "PROD001",
        barcode: null,
        description: "منتج للاختبار",
        price: "100",
        costPrice: "80",
        quantity: 50,
        minQuantity: 10,
        categoryId: null,
        supplierId: null,
        branchId: null,
        unit: "قطعة",
        weight: null,
        dimensions: null,
        status: "active",
        images: null,
        notes: null,
        warrantyPeriod: null,
        expiryDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.nextId = 2;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextId++,
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = {
      ...this.users[index],
      ...user,
      updatedAt: new Date()
    };
    return this.users[index];
  }

  // Employees
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.find(e => e.id === id);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return this.employees;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const newEmployee: Employee = {
      id: this.nextId++,
      ...employee,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const index = this.employees.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    
    this.employees[index] = {
      ...this.employees[index],
      ...employee,
      updatedAt: new Date()
    };
    return this.employees[index];
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const index = this.employees.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.employees.splice(index, 1);
    return true;
  }

  // Deductions
  async getDeduction(id: number): Promise<Deduction | undefined> {
    return this.deductions.find(d => d.id === id);
  }

  async getAllDeductions(): Promise<Deduction[]> {
    return this.deductions;
  }

  async createDeduction(deduction: InsertDeduction): Promise<Deduction> {
    const newDeduction: Deduction = {
      id: this.nextId++,
      ...deduction,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.deductions.push(newDeduction);
    return newDeduction;
  }

  async updateDeduction(id: number, deduction: Partial<InsertDeduction>): Promise<Deduction | undefined> {
    const index = this.deductions.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    this.deductions[index] = {
      ...this.deductions[index],
      ...deduction,
      updatedAt: new Date()
    };
    return this.deductions[index];
  }

  async deleteDeduction(id: number): Promise<boolean> {
    const index = this.deductions.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.deductions.splice(index, 1);
    return true;
  }

  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  async getAllProducts(branchId?: number): Promise<Product[]> {
    if (branchId !== undefined) {
      // إرجاع المنتجات الخاصة بالفرع المحدد فقط
      return this.products.filter(p => p.branchId === branchId);
    }
    return this.products;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: this.nextId++,
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.products[index] = {
      ...this.products[index],
      ...product,
      updatedAt: new Date()
    };
    return this.products[index];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }

  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.find(c => c.id === id);
  }

  async getAllClients(): Promise<Client[]> {
    return this.clients;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const newClient: Client = {
      id: this.nextId++,
      ...client,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.clients.push(newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    this.clients[index] = {
      ...this.clients[index],
      ...client,
      updatedAt: new Date()
    };
    return this.clients[index];
  }

  async deleteClient(id: number): Promise<boolean> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.clients.splice(index, 1);
    return true;
  }

  // Sales  
  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.find(s => s.id === id);
  }

  async getAllSales(): Promise<Sale[]> {
    return this.sales;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const newSale: Sale = {
      id: this.nextId++,
      ...sale,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.sales.push(newSale);
    return newSale;
  }

  async updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined> {
    const index = this.sales.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    this.sales[index] = {
      ...this.sales[index],
      ...sale,
      updatedAt: new Date()
    };
    return this.sales[index];
  }

  async deleteSale(id: number): Promise<boolean> {
    const index = this.sales.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.sales.splice(index, 1);
    return true;
  }

  // Placeholder methods for missing functions
  async getSupplier(id: number): Promise<Supplier | undefined> { return undefined; }
  async getAllSuppliers(): Promise<Supplier[]> { return []; }
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> { throw new Error("Not implemented"); }
  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> { return undefined; }
  async deleteSupplier(id: number): Promise<boolean> { return false; }
  async getPurchase(id: number): Promise<Purchase | undefined> { return undefined; }
  async getAllPurchases(): Promise<Purchase[]> { return []; }
  async createPurchase(purchase: InsertPurchase): Promise<Purchase> { throw new Error("Not implemented"); }
  async updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase | undefined> { return undefined; }
  async deletePurchase(id: number): Promise<boolean> { return false; }
  async getAllHolidays(): Promise<Holiday[]> { return this.holidays; }
  async getHoliday(id: number): Promise<Holiday | undefined> { return this.holidays.find(h => h.id === id); }
  async createHoliday(holiday: InsertHoliday): Promise<Holiday> { 
    const newHoliday: Holiday = { id: this.nextId++, ...holiday, createdAt: new Date(), updatedAt: new Date() };
    this.holidays.push(newHoliday);
    return newHoliday;
  }
  async updateHoliday(id: number, holiday: Partial<InsertHoliday>): Promise<Holiday | undefined> { 
    const index = this.holidays.findIndex(h => h.id === id);
    if (index === -1) return undefined;
    this.holidays[index] = { ...this.holidays[index], ...holiday, updatedAt: new Date() };
    return this.holidays[index];
  }
  async deleteHoliday(id: number): Promise<boolean> { 
    const index = this.holidays.findIndex(h => h.id === id);
    if (index === -1) return false;
    this.holidays.splice(index, 1);
    return true;
  }
  async updateHolidayStatus(id: number, status: string): Promise<Holiday | undefined> { 
    return this.updateHoliday(id, { status });
  }
  async getAllSalaries(): Promise<Salary[]> { return this.salaries; }
  async getSalary(id: number): Promise<Salary | undefined> { return this.salaries.find(s => s.id === id); }
  async createSalary(salary: InsertSalary): Promise<Salary> { 
    console.log('إنشاء راتب جديد:', salary);
    const newSalary: Salary = { 
      id: this.nextId++, 
      employeeId: salary.employeeId,
      month: salary.month,
      year: salary.year,
      baseSalary: salary.baseSalary,
      overtime: salary.overtime || 0,
      bonuses: salary.bonuses || 0,
      totalDeductions: salary.totalDeductions || 0,
      netSalary: salary.netSalary,
      status: salary.status || 'pending',
      paidDate: salary.paidDate,
      notes: salary.notes || '',
      createdAt: new Date()
    };
    this.salaries.push(newSalary);
    console.log('الراتب المُنشأ بنجاح:', newSalary);
    return newSalary;
  }
  async updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined> { 
    const index = this.salaries.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.salaries[index] = { ...this.salaries[index], ...salary, updatedAt: new Date() };
    return this.salaries[index];
  }
  async deleteSalary(id: number): Promise<boolean> { 
    const index = this.salaries.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.salaries.splice(index, 1);
    return true;
  }

  // Inventory Transfers
  getAllInventoryTransfers(): InventoryTransfer[] {
    return this.inventoryTransfers;
  }

  getInventoryTransfer(id: number): InventoryTransfer | undefined {
    return this.inventoryTransfers.find(t => t.id === id);
  }

  createInventoryTransfer(transfer: InsertInventoryTransfer): InventoryTransfer {
    const newTransfer: InventoryTransfer = {
      id: this.nextId++,
      ...transfer,
      createdAt: new Date()
    };
    this.inventoryTransfers.push(newTransfer);
    return newTransfer;
  }

  updateInventoryTransfer(id: number, transfer: Partial<InsertInventoryTransfer>): InventoryTransfer | undefined {
    const index = this.inventoryTransfers.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.inventoryTransfers[index] = { ...this.inventoryTransfers[index], ...transfer };
    return this.inventoryTransfers[index];
  }

  deleteInventoryTransfer(id: number): boolean {
    const index = this.inventoryTransfers.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.inventoryTransfers.splice(index, 1);
    return true;
  }

  getInventoryTransfersByBranch(branchId: number): InventoryTransfer[] {
    return this.inventoryTransfers.filter(
      t => t.fromBranchId === branchId || t.toBranchId === branchId
    );
  }
}

export { storage } from './memory-storage-fixed';



