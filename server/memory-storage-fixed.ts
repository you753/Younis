import * as fs from 'fs';
import * as path from 'path';
import {
  type User,
  type InsertUser,
  type Employee,
  type InsertEmployee,
  type Client,
  type InsertClient,
  type Product,
  type InsertProduct,
  type Sale,
  type InsertSale,
  type Purchase,
  type InsertPurchase,
  type Supplier,
  type InsertSupplier,
  type Deduction,
  type InsertDeduction,
  type Salary,
  type InsertSalary,
  type Holiday,
  type InsertHoliday,
  type Debt,
  type InsertDebt,
  type DebtPayment,
  type InsertDebtPayment,
  type Allowance,
  type InsertAllowance,
  type InventoryMovement,
  type Quote,
  type InsertQuote,
  type SalesReturn,
  type InsertSalesReturn,
  type PurchaseReturn,
  type InsertPurchaseReturn,
  type ClientReceiptVoucher,
  type InsertClientReceiptVoucher,
  type SupplierPaymentVoucher,
  type InsertSupplierPaymentVoucher,
  type EmployeeDeduction,
  type InsertEmployeeDeduction,
  type DailyExpense,
  type InsertDailyExpense,
  type BranchReceiptVoucher,
  type InsertBranchReceiptVoucher
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): User | undefined;
  getUserByUsername(username: string): User | undefined;
  createUser(user: InsertUser): User;
  updateUser(id: number, user: Partial<InsertUser>): User | undefined;
  deleteUser(id: number): boolean;

  // Suppliers
  getSupplier(id: number): Supplier | undefined;
  getAllSuppliers(branchId?: number): Supplier[];
  createSupplier(supplier: InsertSupplier): Supplier;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Supplier | undefined;
  deleteSupplier(id: number): boolean;
  updateSupplierBalance(supplierId: number, amount: number): Supplier | undefined;

  // Clients
  getClient(id: number): Client | undefined;
  getAllClients(branchId?: number): Client[];
  createClient(client: InsertClient): Client;
  updateClient(id: number, client: Partial<InsertClient>): Client | undefined;
  deleteClient(id: number): boolean;
  updateClientBalance(clientId: number, amount: number): Client | undefined;
  updateClientCreditLimit(clientId: number, amount: number): Client | undefined;

  // Products
  getProduct(id: number): Product | undefined;
  getAllProducts(branchId?: number): Product[];
  createProduct(product: InsertProduct): Product;
  updateProduct(id: number, product: Partial<InsertProduct>): Product | undefined;
  deleteProduct(id: number): boolean;

  // Sales
  getSale(id: number): Sale | undefined;
  getAllSales(): Sale[];
  createSale(sale: InsertSale): Sale;
  updateSale(id: number, sale: Partial<InsertSale>): Sale | undefined;
  deleteSale(id: number): boolean;

  // Purchases
  getPurchase(id: number): Purchase | undefined;
  getAllPurchases(): Purchase[];
  createPurchase(purchase: InsertPurchase): Purchase;
  updatePurchase(id: number, purchase: Partial<InsertPurchase>): Purchase | undefined;
  deletePurchase(id: number): boolean;

  // Employees
  getEmployee(id: number): Employee | undefined;
  getAllEmployees(): Employee[];
  createEmployee(employee: InsertEmployee): Employee;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Employee | undefined;
  deleteEmployee(id: number): boolean;

  // Holidays
  getAllHolidays(): Holiday[];
  getHoliday(id: number): Holiday | undefined;
  createHoliday(holiday: InsertHoliday): Holiday;
  updateHoliday(id: number, holiday: Partial<InsertHoliday>): Holiday | undefined;
  deleteHoliday(id: number): boolean;
  updateHolidayStatus(id: number, status: string): Holiday | undefined;

  // Deductions
  getDeduction(id: number): Deduction | undefined;
  getAllDeductions(): Deduction[];
  createDeduction(deduction: InsertDeduction): Deduction;
  updateDeduction(id: number, deduction: Partial<InsertDeduction>): Deduction | undefined;
  deleteDeduction(id: number): boolean;

  // Salaries
  getAllSalaries(): Salary[];
  getSalary(id: number): Salary | undefined;
  createSalary(salary: InsertSalary): Salary;
  updateSalary(id: number, salary: Partial<InsertSalary>): Salary | undefined;
  deleteSalary(id: number): boolean;

  // Debts
  getDebt(id: number): Debt | undefined;
  getAllDebts(): Debt[];
  createDebt(debt: InsertDebt): Debt;
  updateDebt(id: number, debt: Partial<InsertDebt>): Debt | undefined;
  deleteDebt(id: number): boolean;

  // Debt Payments
  getDebtPayment(id: number): DebtPayment | undefined;
  getAllDebtPayments(): DebtPayment[];
  createDebtPayment(payment: InsertDebtPayment): DebtPayment;
  updateDebtPayment(id: number, payment: Partial<InsertDebtPayment>): DebtPayment | undefined;
  deleteDebtPayment(id: number): boolean;

  // Allowances
  getAllAllowances(): Allowance[];
  createAllowance(allowance: InsertAllowance): Allowance;
  updateAllowance(id: number, data: Partial<InsertAllowance>): Allowance | undefined;
  deleteAllowance(id: number): boolean;

  // Quotes
  getQuote(id: number): Quote | undefined;
  getAllQuotes(): Quote[];
  createQuote(quote: InsertQuote): Quote;
  updateQuote(id: number, quote: Partial<InsertQuote>): Quote | undefined;
  deleteQuote(id: number): boolean;

  // Sales Returns
  getSalesReturn(id: number): SalesReturn | undefined;
  getAllSalesReturns(): SalesReturn[];
  createSalesReturn(salesReturn: InsertSalesReturn): SalesReturn;
  updateSalesReturn(id: number, salesReturn: Partial<InsertSalesReturn>): SalesReturn | undefined;
  deleteSalesReturn(id: number): boolean;

  // Purchase Returns
  getPurchaseReturn(id: number): PurchaseReturn | undefined;
  getAllPurchaseReturns(): PurchaseReturn[];
  createPurchaseReturn(purchaseReturn: InsertPurchaseReturn): PurchaseReturn;
  updatePurchaseReturn(id: number, purchaseReturn: Partial<InsertPurchaseReturn>): PurchaseReturn | undefined;
  deletePurchaseReturn(id: number): boolean;

  // Client Receipt Vouchers
  getClientReceiptVoucher(id: number): ClientReceiptVoucher | undefined;
  getAllClientReceiptVouchers(): ClientReceiptVoucher[];
  createClientReceiptVoucher(voucher: InsertClientReceiptVoucher): ClientReceiptVoucher;
  updateClientReceiptVoucher(id: number, voucher: Partial<InsertClientReceiptVoucher>): ClientReceiptVoucher | undefined;
  deleteClientReceiptVoucher(id: number): boolean;

  // Supplier Payment Vouchers
  getSupplierPaymentVoucher(id: number): SupplierPaymentVoucher | undefined;
  getAllSupplierPaymentVouchers(): SupplierPaymentVoucher[];
  createSupplierPaymentVoucher(voucher: InsertSupplierPaymentVoucher): SupplierPaymentVoucher;
  updateSupplierPaymentVoucher(id: number, voucher: Partial<InsertSupplierPaymentVoucher>): SupplierPaymentVoucher | undefined;
  deleteSupplierPaymentVoucher(id: number): boolean;

  // Branch Receipt Vouchers - سندات القبض
  getBranchReceiptVoucher(id: number): BranchReceiptVoucher | undefined;
  getAllBranchReceiptVouchers(branchId?: number): BranchReceiptVoucher[];
  createBranchReceiptVoucher(voucher: InsertBranchReceiptVoucher): BranchReceiptVoucher;
  updateBranchReceiptVoucher(id: number, voucher: Partial<InsertBranchReceiptVoucher>): BranchReceiptVoucher | undefined;
  deleteBranchReceiptVoucher(id: number): boolean;

  // Product Categories
  getAllProductCategories(): any[];
  getProductCategory(id: number): any | undefined;
  createProductCategory(category: any): any;
  updateProductCategory(id: number, category: any): any | undefined;
  deleteProductCategory(id: number): boolean;

  // Inventory Movements - Professional System
  getAllInventoryMovements(): InventoryMovement[];
  addInventoryMovement(movement: any): InventoryMovement;
  processInventoryTransaction(productId: number, quantity: number, type: 'in' | 'out', reference: string, referenceType: string): void;
  reverseInventoryTransaction(productId: number, quantity: number, type: 'in' | 'out', reference: string): void;

  // Goods Issue Vouchers
  getAllGoodsIssueVouchers(): any[];
  createGoodsIssueVoucher(voucher: any): any;
  getGoodsIssueVoucher(id: number): any;
  deleteGoodsIssueVoucher(id: number): boolean;

  // Settings
  saveSettings(section: string, data: any): Promise<void>;
  getSettings(): Promise<any>;

  // Backup
  createBackup(): Promise<string>;
  getLatestBackup(): Promise<string>;

  // Branches
  getBranch(id: number): any | undefined;
  getAllBranches(): any[];
  createBranch(branch: any): any;
  updateBranch(id: number, branch: any): any | undefined;
  deleteBranch(id: number): boolean;

  // Debt Payments
  getAllDebtPayments(): any[];
  getDebtPaymentsByEmployee(employeeId: number): any[];
  createDebtPayment(payment: any): any;

  // Employee Deductions
  getEmployeeDeduction(id: number): EmployeeDeduction | undefined;
  getAllEmployeeDeductions(): EmployeeDeduction[];
  createEmployeeDeduction(deduction: InsertEmployeeDeduction): EmployeeDeduction;
  updateEmployeeDeduction(id: number, deduction: Partial<InsertEmployeeDeduction>): EmployeeDeduction | undefined;
  deleteEmployeeDeduction(id: number): boolean;

  // Employee Debts
  getAllEmployeeDebts(): any[];
  getEmployeeDebts(employeeId: number): any[];
}

export class MemoryStorage implements IStorage {
  private users: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      fullName: 'المدير العام',
      password: 'admin',
      role: 'admin',
      avatar: '',
      phoneNumber: '966501234567',
      address: 'الرياض، المملكة العربية السعودية',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  private nextId: number = 2;
  private suppliers: Supplier[] = [];
  private clients: Client[] = [];
  private products: Product[] = [];
  private sales: Sale[] = [];
  private purchases: Purchase[] = [];
  private employees: Employee[] = [];
  private holidays: Holiday[] = [];
  private deductions: Deduction[] = [];
  private employeeDeductions: EmployeeDeduction[] = [];
  private salaries: Salary[] = [];
  private debtPayments: any[] = [];
  private settings: any = {};
  private backups: any[] = [];
  private inventoryMovements: InventoryMovement[] = [];
  private inventoryMovementIdCounter = 1;
  private settingsFilePath: string = path.join(process.cwd(), 'settings.json');
  private usersFilePath: string = path.join(process.cwd(), 'users.json');
  private vouchersFilePath: string = path.join(process.cwd(), 'supplier-payment-vouchers.json');
  

  
  private loadSettingsFromFile(): void {
    try {
      if (fs.existsSync(this.settingsFilePath)) {
        const data = fs.readFileSync(this.settingsFilePath, 'utf8');
        this.settings = JSON.parse(data);
        console.log('Settings loaded from file:', this.settings);
      }
    } catch (error) {
      console.error('Error loading settings from file:', error);
      this.settings = {};
    }
  }

  private loadSupplierPaymentVouchersFromFile(): void {
    try {
      if (fs.existsSync(this.vouchersFilePath)) {
        const data = fs.readFileSync(this.vouchersFilePath, 'utf8');
        this.supplierPaymentVouchers = JSON.parse(data);
        console.log('Supplier payment vouchers loaded from file:', this.supplierPaymentVouchers.length);
      }
    } catch (error) {
      console.error('Error loading vouchers from file:', error);
      this.supplierPaymentVouchers = [];
    }
  }

  private saveSupplierPaymentVouchersToFile(): void {
    try {
      fs.writeFileSync(this.vouchersFilePath, JSON.stringify(this.supplierPaymentVouchers, null, 2));
      console.log('Supplier payment vouchers saved to file:', this.supplierPaymentVouchers.length);
    } catch (error) {
      console.error('Error saving vouchers to file:', error);
    }
  }
  
  private saveSettingsToFile(): void {
    try {
      fs.writeFileSync(this.settingsFilePath, JSON.stringify(this.settings, null, 2));
      console.log('Settings saved to file');
    } catch (error) {
      console.error('Error saving settings to file:', error);
    }
  }

  private loadUsersFromFile(): void {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const data = fs.readFileSync(this.usersFilePath, 'utf8');
        const userData = JSON.parse(data);
        this.users = userData.users || [];
        this.nextId = Math.max(...this.users.map(u => u.id), 0) + 1;
        console.log('Users loaded from file:', this.users.length, 'users');
      }
    } catch (error) {
      console.error('Error loading users from file:', error);
      this.users = [];
    }
  }
  
  private saveUsersToFile(): void {
    try {
      const userData = {
        users: this.users,
        nextId: this.nextId
      };
      fs.writeFileSync(this.usersFilePath, JSON.stringify(userData, null, 2));
      console.log('Users saved to file:', this.users.length, 'users');
    } catch (error) {
      console.error('Error saving users to file:', error);
    }
  }
  
  // نتائج العمليات
  private operationResults: Array<{
    id: number;
    operationType: string;
    operationId: number;
    employeeId: number;
    employeeName: string;
    summary: any;
    totalAmount: string;
    status: string;
    createdAt: Date;
  }> = [];
  private employeeDebts: any[] = [];
  private debts: Debt[] = [];
  private debtPayments: DebtPayment[] = [];
  private allowances: Allowance[] = [];
  private quotes: Quote[] = [];
  private salesReturns: SalesReturn[] = [];
  private purchaseReturns: PurchaseReturn[] = [];
  private clientReceiptVouchers: ClientReceiptVoucher[] = [];
  private supplierPaymentVouchers: SupplierPaymentVoucher[] = [];
  private branchReceiptVouchers: BranchReceiptVoucher[] = [];
  private productCategories: any[] = [];
  private inventoryMovements: InventoryMovement[] = [];
  private dailyExpenses: DailyExpense[] = [];
  private nextId = 1;

  constructor() {
    this.loadSettingsFromFile();
    this.loadUsersFromFile();
    this.loadSupplierPaymentVouchersFromFile();
    
    // تم تعطيل البيانات التجريبية - يمكن تفعيلها بإزالة التعليق من الأسطر التالية
    // this.seedData();
    // this.seedClientReceiptVouchers();
    // this.seedProductCategories();
    // this.seedDailyExpenses();
    // this.seedBranchSalesAndPurchases();
    
    console.log('تم تحميل المستخدمين في الذاكرة:', this.users.length);
  }

  private seedBranchSalesAndPurchases() {
    // إضافة منتجات لكل فرع
    this.products.push(
      { id: this.nextId++, name: "منتج أ", code: "P001", branchId: 117, quantity: 100, purchasePrice: 50, salePrice: 80, category: "عام", minStock: 10, unit: "قطعة", isActive: true, createdAt: new Date(), barcode: "001" },
      { id: this.nextId++, name: "منتج ب", code: "P002", branchId: 117, quantity: 80, purchasePrice: 40, salePrice: 65, category: "عام", minStock: 10, unit: "قطعة", isActive: true, createdAt: new Date(), barcode: "002" },
      { id: this.nextId++, name: "منتج ج", code: "P003", branchId: 118, quantity: 60, purchasePrice: 30, salePrice: 50, category: "عام", minStock: 10, unit: "قطعة", isActive: true, createdAt: new Date(), barcode: "003" },
      { id: this.nextId++, name: "منتج د", code: "P004", branchId: 119, quantity: 50, purchasePrice: 25, salePrice: 42, category: "عام", minStock: 10, unit: "قطعة", isActive: true, createdAt: new Date(), barcode: "004" }
    );

    // إضافة مبيعات للفروع
    this.sales.push(
      {
        id: this.nextId++,
        clientId: 1,
        branchId: 117,
        invoiceNumber: "INV-117-001",
        date: new Date("2025-11-01"),
        items: [{ productId: 1, productName: "منتج أ", quantity: 20, price: 80 }],
        createdAt: new Date()
      } as any,
      {
        id: this.nextId++,
        clientId: 1,
        branchId: 117,
        invoiceNumber: "INV-117-002",
        date: new Date("2025-11-05"),
        items: [{ productId: 2, productName: "منتج ب", quantity: 15, price: 65 }],
        createdAt: new Date()
      } as any,
      {
        id: this.nextId++,
        clientId: 1,
        branchId: 118,
        invoiceNumber: "INV-118-001",
        date: new Date("2025-11-03"),
        items: [{ productId: 3, productName: "منتج ج", quantity: 25, price: 50 }],
        createdAt: new Date()
      } as any,
      {
        id: this.nextId++,
        clientId: 1,
        branchId: 119,
        invoiceNumber: "INV-119-001",
        date: new Date("2025-11-07"),
        items: [{ productId: 4, productName: "منتج د", quantity: 18, price: 42 }],
        createdAt: new Date()
      } as any
    );

    // إضافة مشتريات للفروع
    this.purchases.push(
      {
        id: this.nextId++,
        supplierId: 1,
        branchId: 117,
        invoiceNumber: "PUR-117-001",
        date: new Date("2025-10-25"),
        items: [{ productId: 1, productName: "منتج أ", quantity: 50, price: 50 }],
        createdAt: new Date()
      } as any,
      {
        id: this.nextId++,
        supplierId: 1,
        branchId: 118,
        invoiceNumber: "PUR-118-001",
        date: new Date("2025-10-28"),
        items: [{ productId: 3, productName: "منتج ج", quantity: 40, price: 30 }],
        createdAt: new Date()
      } as any
    );

    // تحديث المصروفات لتوزيعها على الفروع
    this.dailyExpenses = [
      {
        id: 1,
        branchId: 117,
        date: '2025-11-01',
        category: 'مصروفات التشغيل',
        description: 'فاتورة كهرباء',
        amount: 1200,
        paymentMethod: 'بنك',
        receipt: 'REC-001',
        approvedBy: 'أحمد',
        status: 'معتمد',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        branchId: 118,
        date: '2025-11-02',
        category: 'مصروفات الموظفين',
        description: 'مكافآت',
        amount: 800,
        paymentMethod: 'نقداً',
        receipt: 'REC-002',
        approvedBy: 'سارة',
        status: 'معتمد',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        branchId: 119,
        date: '2025-11-03',
        category: 'مصروفات الصيانة',
        description: 'صيانة',
        amount: 500,
        paymentMethod: 'فيزا',
        receipt: 'REC-003',
        approvedBy: 'محمد',
        status: 'معتمد',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private seedClientReceiptVouchers() {
    // Clear existing vouchers first
    this.clientReceiptVouchers = [];
    
    // Add sample client receipt vouchers with new numbers
    this.clientReceiptVouchers.push(
      {
        id: this.nextId++,
        clientId: 1,
        voucherNumber: "QBH-001",
        amount: "5000",
        paymentMethod: "نقدي",
        receiptDate: "2024-12-01",
        description: "سداد فاتورة رقم 101",
        reference: "INV-101",
        status: "مؤكد",
        notes: "تم استلام المبلغ كاملاً",
        deductFrom: "balance",
        createdAt: new Date()
      },
      {
        id: this.nextId++,
        clientId: 1,
        voucherNumber: "QBH-002",
        amount: "2500",
        paymentMethod: "تحويل بنكي",
        receiptDate: "2024-12-05",
        description: "دفعة جزئية",
        reference: "TRF-205",
        status: "مؤكد",
        notes: "تحويل من البنك الأهلي",
        deductFrom: "creditLimit",
        createdAt: new Date()
      }
    );
  }

  private seedData() {
    // Seed users
    this.users.push({
      id: 1,
      username: "YOUNIS1234",
      email: "younis@example.com",
      password: "Aa123456",
      fullName: "يونس التاجر",
      profession: "محاسب",
      phone: "+966501234567",
      address: "الرياض، المملكة العربية السعودية",
      bio: "محاسب خبير في الأنظمة المالية",
      avatar: null,
      role: "admin",
      createdAt: new Date()
    });

    // Seed employees
    this.employees.push(
      {
        id: 1,
        name: "أحمد محمد علي",
        email: "ahmed@company.com",
        phone: "+966501234567",
        address: "الرياض",
        createdAt: new Date(),
        status: "active",
        employeeId: "EMP001",
        position: "محاسب",
        department: "المالية",
        hireDate: new Date("2023-01-15"),
        salary: "5000",
        emergencyContact: "+966509876543"
      },
      {
        id: 2,
        name: "فاطمة خالد السالم",
        email: "fatima@company.com",
        phone: "+966502345678",
        address: "جدة",
        createdAt: new Date(),
        status: "active",
        employeeId: "EMP002",
        position: "مساعد إداري",
        department: "الإدارة",
        hireDate: new Date("2023-02-20"),
        salary: "4000",
        emergencyContact: "+966508765432"
      },
      {
        id: 3,
        name: "محمد حسن العتيبي",
        email: "mohammed@company.com",
        phone: "+966503456789",
        address: "الدمام",
        createdAt: new Date(),
        status: "active",
        employeeId: "EMP003",
        position: "مندوب مبيعات",
        department: "المبيعات",
        hireDate: new Date("2023-03-10"),
        salary: "4500",
        emergencyContact: "+966507654321"
      },
      {
        id: 4,
        name: "سارة أحمد الشمري",
        email: "sara@company.com",
        phone: "+966504567890",
        address: "المدينة المنورة",
        createdAt: new Date(),
        status: "active",
        employeeId: "EMP004",
        position: "محاسبة",
        department: "المالية",
        hireDate: new Date("2023-04-05"),
        salary: "4800",
        emergencyContact: "+966508765432"
      },
      {
        id: 5,
        name: "خالد عبد الله القحطاني",
        email: "khalid@company.com",
        phone: "+966505678901",
        address: "الطائف",
        createdAt: new Date(),
        status: "active",
        employeeId: "EMP005",
        position: "فني صيانة",
        department: "التقنية",
        hireDate: new Date("2023-05-12"),
        salary: "3800",
        emergencyContact: "+966509876543"
      },
      {
        id: 117,
        name: "يونس عبد الرحمن",
        email: "younis@company.com",
        phone: "+966507890123",
        address: "الرياض",
        createdAt: new Date(),
        status: "active",
        employeeId: "EMP117",
        position: "مدير مالي",
        department: "المالية",
        hireDate: new Date("2023-01-01"),
        salary: "3000",
        emergencyContact: "+966508901234"
      }
    );

    // Seed products - تم حذف المنتجات التجريبية القديمة
    // this.products.push();

    // Seed clients - دمج الرصيد الافتتاحي والحالي في حقل واحد
    this.clients.push(
      {
        id: 1,
        name: "شركة النور التجارية",
        email: "info@alnoor.com",
        phone: "+966501234567",
        address: "الرياض، شارع الملك فهد",
        createdAt: new Date(),
        status: "active",
        creditLimit: "50000",
        balance: "10500", // رصيد موحد (افتتاحي + حالي)
        group: "VIP",
        accountType: "credit"
      },
      {
        id: 2,
        name: "مؤسسة البركة",
        email: "info@albaraka.com",
        phone: "+966502345678",
        address: "جدة، شارع التحلية",
        createdAt: new Date(),
        status: "active",
        creditLimit: "30000",
        balance: "8000", // رصيد موحد (افتتاحي + حالي)
        group: "Gold",
        accountType: "cash"
      },
      {
        id: 3,
        name: "شركة التقنية المتطورة",
        email: "info@advanced-tech.com",
        phone: "+966503456789",
        address: "الخبر، شارع الملك عبد العزيز",
        createdAt: new Date(),
        status: "active",
        creditLimit: "25000",
        balance: "3500", // رصيد موحد
        group: "Silver",
        accountType: "credit"
      }
    );

    // Seed sales
    this.sales.push(
      {
        id: 1,
        clientId: 1,
        invoiceNumber: "INV-2025-001",
        date: "2025-01-15",
        items: [
          {
            productId: 1,
            productName: "لابتوب HP EliteBook",
            quantity: 1,
            unitPrice: 3000,
            total: 3000
          }
        ],
        total: "3000",
        vat: "450",
        grandTotal: "3450",
        status: "unpaid",
        paymentMethod: "credit",
        notes: "فاتورة مبيعات لشركة النور",
        createdAt: new Date("2025-01-15")
      },
      {
        id: 2,
        clientId: 2,
        invoiceNumber: "INV-2025-002",
        date: "2025-01-20",
        items: [
          {
            productId: 2,
            productName: "طابعة كانون",
            quantity: 2,
            unitPrice: 1000,
            total: 2000
          }
        ],
        total: "2000",
        vat: "300",
        grandTotal: "2300",
        status: "unpaid",
        paymentMethod: "cash",
        notes: "فاتورة مبيعات لمؤسسة البركة",
        createdAt: new Date("2025-01-20")
      },
      {
        id: 3,
        clientId: 1,
        invoiceNumber: "INV-2025-003",
        date: "2025-02-01",
        items: [
          {
            productId: 1,
            productName: "لابتوب HP EliteBook",
            quantity: 1,
            unitPrice: 3000,
            total: 3000
          }
        ],
        total: "1500",
        vat: "225",
        grandTotal: "1725",
        status: "unpaid",
        paymentMethod: "credit",
        notes: "فاتورة مبيعات إضافية",
        createdAt: new Date("2025-02-01")
      }
    );

    // Seed debts
    this.debts.push(
      {
        id: 100,
        debtorType: "employee",
        debtorId: 4,
        debtorName: "سارة أحمد الشمري",
        type: "advance",
        amount: "900",
        remainingAmount: "900",
        debtItems: [
          { id: "1", amount: "300", reason: "تجديد" },
          { id: "2", amount: "200", reason: "رخصة" },
          { id: "3", amount: "400", reason: "توصيل" }
        ],
        description: "دين متنوع",
        dueDate: "2025-06-01",
        status: "active",
        notes: "ملاحظات عن الدين",

        monthlyDeduction: "300",
        currency: "SAR",
        createdAt: new Date("2025-06-28T16:18:00.364Z"),
        updatedAt: new Date("2025-06-28T16:18:00.364Z"),
        employeeName: "سارة أحمد الشمري"
      },
      {
        id: 101,
        debtorType: "employee",
        debtorId: 3,
        debtorName: "محمد حسن العتيبي",
        type: "loan",
        amount: "1500",
        remainingAmount: "1500",
        debtItems: [
          { id: "1", amount: "1500", reason: "قرض شخصي" }
        ],
        description: "قرض للموظف محمد حسن",
        dueDate: "2025-12-31",
        status: "active",
        notes: "قرض لمدة سنة",
        installments: 12,
        monthlyDeduction: "125",
        currency: "SAR",
        createdAt: new Date("2025-06-28T16:22:39.142Z"),
        updatedAt: new Date("2025-06-28T16:22:39.142Z"),
        employeeName: "محمد حسن العتيبي"
      },
      {
        id: 102,
        debtorType: "employee",
        debtorId: 117,
        debtorName: "يونس عبد الرحمن",
        type: "advance",
        amount: "500",
        remainingAmount: "0",
        debtItems: [
          { id: "1", amount: "500", reason: "سلفة شخصية" }
        ],
        description: "سلفة للموظف يونس عبد الرحمن",
        dueDate: "2025-12-31",
        status: "paid",
        notes: "تم السداد بالكامل",
        installments: 1,
        monthlyDeduction: "0",
        currency: "SAR",
        createdAt: new Date("2025-07-01T10:00:00.000Z"),
        updatedAt: new Date("2025-07-15T10:00:00.000Z"),
        employeeName: "يونس عبد الرحمن"
      },
      {
        id: 103,
        debtorType: "employee",
        debtorId: 117,
        debtorName: "يونس عبد الرحمن",
        type: "loan",
        amount: "5000",
        remainingAmount: "3000",
        debtItems: [
          { id: "1", amount: "5000", reason: "قرض شخصي" },
          { id: "2", amount: "-2000", reason: "دفعة مسددة", type: "payment", date: "2025-07-20" }
        ],
        description: "قرض للموظف يونس عبد الرحمن",
        dueDate: "2025-12-31",
        status: "active",
        notes: "قرض طويل الأجل",
        installments: 10,
        monthlyDeduction: "500",
        currency: "SAR",
        createdAt: new Date("2025-07-01T10:00:00.000Z"),
        updatedAt: new Date("2025-07-01T10:00:00.000Z"),
        employeeName: "يونس عبد الرحمن"
      }
    );

    // Product Categories will be seeded in seedProductCategories method

    // Seed sales for client receipt vouchers
    this.sales.push(
      {
        id: 1,
        clientId: 1,
        invoiceNumber: "INV-2025-001",
        items: [
          {
            productId: 1,
            productName: "لابتوب HP EliteBook",
            quantity: 1,
            unitPrice: 3000,
            total: 3000
          }
        ],
        total: 3000,
        vat: 450,
        grandTotal: 3450,
        date: new Date('2025-01-01'),
        status: "unpaid",
        paymentMethod: "credit",
        notes: "فاتورة مبيعات",
        createdAt: new Date()
      },
      {
        id: 2,
        clientId: 1,
        invoiceNumber: "INV-2025-002",
        items: [
          {
            productId: 2,
            productName: "طابعة كانون",
            quantity: 2,
            unitPrice: 1000,
            total: 2000
          }
        ],
        total: 2000,
        vat: 300,
        grandTotal: 2300,
        date: new Date('2025-01-05'),
        status: "unpaid",
        paymentMethod: "credit",
        notes: "فاتورة مبيعات",
        createdAt: new Date()
      }
    );

    this.nextId = 115;
  }

  private seedProductCategories() {
    // إضافة فئات المنتجات التجريبية إذا لم تكن موجودة
    if (this.productCategories.length === 0) {
      this.productCategories.push(
        {
          id: this.nextId++,
          name: "الكترونيات",
          description: "أجهزة كمبيوتر ولابتوب وملحقاتها",
          status: "active",
          productCount: 2,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: this.nextId++,
          name: "هواتف ذكية",
          description: "هواتف ذكية وملحقاتها وبطاريات",
          status: "active",
          productCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: this.nextId++,
          name: "ملابس",
          description: "ملابس رجالية ونسائية وأطفال",
          status: "active",
          productCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: this.nextId++,
          name: "أثاث منزلي",
          description: "أثاث وديكورات المنزل",
          status: "active",
          productCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: this.nextId++,
          name: "أدوات مكتبية",
          description: "قرطاسية وأدوات مكتبية ومستلزمات",
          status: "active",
          productCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
      console.log("تم إنشاء بيانات تجريبية لفئات المنتجات: " + this.productCategories.length + " فئة");
    }
  }

  private seedDailyExpenses() {
    if (this.dailyExpenses.length === 0) {
      this.dailyExpenses = [
        {
          id: 1,
          branchId: 117,
          date: '2025-07-26',
          category: 'مصروفات التشغيل',
          description: 'فاتورة كهرباء الفرع',
          amount: 850,
          paymentMethod: 'بنك',
          receipt: 'REC-2025-001',
          approvedBy: 'أحمد محمد',
          status: 'معتمد',
          createdAt: new Date('2025-07-26T10:30:00'),
          updatedAt: new Date('2025-07-26T10:30:00')
        },
        {
          id: 2,
          branchId: 117,
          date: '2025-07-26',
          category: 'مصروفات الموظفين',
          description: 'مكافآت الموظفين',
          amount: 1200,
          paymentMethod: 'نقداً',
          receipt: 'REC-2025-002',
          approvedBy: 'سارة أحمد',
          status: 'معتمد',
          createdAt: new Date('2025-07-26T14:15:00'),
          updatedAt: new Date('2025-07-26T14:15:00')
        },
        {
          id: 3,
          branchId: 117,
          date: '2025-07-25',
          category: 'مصروفات الصيانة',
          description: 'صيانة أجهزة الكمبيوتر',
          amount: 450,
          paymentMethod: 'فيزا',
          receipt: 'REC-2025-003',
          approvedBy: 'محمد علي',
          status: 'معلق',
          createdAt: new Date('2025-07-25T16:45:00'),
          updatedAt: new Date('2025-07-25T16:45:00')
        }
      ];
      console.log('تم إنشاء بيانات تجريبية للمصروفات اليومية:', this.dailyExpenses.length, 'مصروف');
    }
  }

  // Users
  getUser(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  createUser(user: InsertUser): User {
    const newUser: User = {
      id: this.nextId++,
      ...user,
      createdAt: new Date()
    };
    this.users.push(newUser);
    this.saveUsersToFile(); // حفظ المستخدمين بشكل دائم
    return newUser;
  }

  updateUser(id: number, user: Partial<InsertUser>): User | undefined {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = {
      ...this.users[index],
      ...user
    };
    this.saveUsersToFile(); // حفظ التحديثات بشكل دائم
    return this.users[index];
  }

  deleteUser(id: number): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    this.saveUsersToFile(); // حفظ الحذف بشكل دائم
    return true;
  }

  // Employees
  getEmployee(id: number): Employee | undefined {
    return this.employees.find(e => e.id === id);
  }

  getAllEmployees(): Employee[] {
    return this.employees;
  }

  createEmployee(employee: InsertEmployee): Employee {
    const newEmployee: Employee = {
      id: this.nextId++,
      ...employee,
      createdAt: new Date()
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  updateEmployee(id: number, employee: Partial<InsertEmployee>): Employee | undefined {
    const index = this.employees.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    
    this.employees[index] = {
      ...this.employees[index],
      ...employee
    };
    return this.employees[index];
  }

  deleteEmployee(id: number): boolean {
    const index = this.employees.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.employees.splice(index, 1);
    return true;
  }

  // Deductions
  getDeduction(id: number): Deduction | undefined {
    return this.deductions.find(d => d.id === id);
  }

  getAllDeductions(): Deduction[] {
    return this.deductions;
  }

  createDeduction(deduction: InsertDeduction): Deduction {
    const newDeduction: Deduction = {
      id: this.nextId++,
      ...deduction,
      createdAt: new Date()
    };
    this.deductions.push(newDeduction);
    
    // خصم تلقائي من راتب الموظف عند إضافة خصم
    const employee = this.getEmployee(deduction.employeeId);
    if (employee) {
      const currentSalary = parseFloat(employee.salary);
      const deductionAmount = parseFloat(deduction.amount.toString());
      const newSalary = currentSalary - deductionAmount;
      
      // تحديث راتب الموظف
      this.updateEmployee(deduction.employeeId, {
        ...employee,
        salary: newSalary.toString()
      });
      
      console.log(`💸 خصم تلقائي: ${deductionAmount} ريال من راتب ${employee.name}`);
      console.log(`💰 الراتب: ${currentSalary} ← ${newSalary} ريال`);
    }
    
    return newDeduction;
  }

  updateDeduction(id: number, deduction: Partial<InsertDeduction>): Deduction | undefined {
    const index = this.deductions.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    this.deductions[index] = {
      ...this.deductions[index],
      ...deduction
    };
    return this.deductions[index];
  }

  deleteDeduction(id: number): boolean {
    const index = this.deductions.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.deductions.splice(index, 1);
    return true;
  }

  // Clients
  getClient(id: number): Client | undefined {
    return this.clients.find(c => c.id === id);
  }

  getAllClients(branchId?: number): Client[] {
    if (branchId) {
      return this.clients.filter(c => c.branchId === branchId);
    }
    return this.clients;
  }

  createClient(client: InsertClient): Client {
    const newClient: Client = {
      id: this.nextId++,
      ...client,
      createdAt: new Date()
    };
    this.clients.push(newClient);
    return newClient;
  }

  updateClient(id: number, client: Partial<InsertClient>): Client | undefined {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    this.clients[index] = {
      ...this.clients[index],
      ...client
    };
    return this.clients[index];
  }

  deleteClient(id: number): boolean {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.clients.splice(index, 1);
    return true;
  }

  resetClientsToOriginal(): void {
    // إعادة تعيين قائمة العملاء للعملاء الأصليين فقط
    this.clients = [
      {
        id: 1,
        name: "شركة النور التجارية",
        email: "info@alnoor.com",
        phone: "+966501234567",
        address: "الرياض، شارع الملك فهد",
        createdAt: new Date(),
        status: "active",
        creditLimit: "50000",
        balance: "0",
        group: "VIP",
        openingBalance: "0",
        currentBalance: "0",
        accountType: "credit"
      },
      {
        id: 2,
        name: "مؤسسة البركة",
        email: "info@albaraka.com",
        phone: "+966502345678",
        address: "جدة، شارع التحلية",
        createdAt: new Date(),
        status: "active",
        creditLimit: "30000",
        balance: "0",
        group: "Gold",
        openingBalance: "0",
        currentBalance: "0",
        accountType: "cash"
      }
    ];
  }

  // تحديث رصيد العميل - النظام الموحد
  updateClientBalance(clientId: number, amount: number): Client | undefined {
    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      console.error(`العميل غير موجود: ${clientId}`);
      return undefined;
    }
    
    const currentBalance = parseFloat(client.balance || '0');
    const newBalance = currentBalance + amount;
    
    // تحديث الرصيد الموحد
    client.balance = newBalance.toString();
    
    console.log(`💰 تم تحديث رصيد العميل ${client.name}: ${currentBalance} ← ${newBalance} ريال`);
    return client;
  }

  updateClientCreditLimit(clientId: number, amount: number): Client | undefined {
    const client = this.clients.find(c => c.id === clientId);
    if (!client) return undefined;
    
    const currentCreditLimit = parseFloat(client.creditLimit || '0');
    const newCreditLimit = Math.max(0, currentCreditLimit + amount);
    
    client.creditLimit = newCreditLimit.toString();
    
    return client;
  }

  // Products
  getProduct(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getAllProducts(branchId?: number): Product[] {
    if (branchId) {
      // عزل كامل: فقط المنتجات الخاصة بهذا الفرع + المنتجات المشتركة (branchId = null)
      return this.products.filter(p => p.branchId === branchId || p.branchId === null);
    }
    return this.products;
  }

  createProduct(product: InsertProduct): Product {
    const newProduct: Product = {
      id: this.nextId++,
      ...product,
      createdAt: new Date()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  updateProduct(id: number, product: Partial<InsertProduct>): Product | undefined {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.products[index] = {
      ...this.products[index],
      ...product
    };
    return this.products[index];
  }

  deleteProduct(id: number): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }

  // Sales
  getSale(id: number): Sale | undefined {
    return this.sales.find(s => s.id === id);
  }

  getAllSales(branchId?: number): Sale[] {
    if (branchId) {
      // عزل كامل: فقط المبيعات الخاصة بهذا الفرع
      return this.sales.filter(s => s.branchId === branchId);
    }
    return this.sales;
  }

  createSale(sale: InsertSale): Sale {
    const newSale: Sale = {
      id: this.nextId++,
      ...sale,
      date: new Date()
    };
    this.sales.push(newSale);

    // تحديث المخزون التلقائي - خصم الكميات من المنتجات
    if (sale.items && Array.isArray(sale.items)) {
      for (const item of sale.items) {
        this.processInventoryTransaction(
          item.productId,
          item.quantity,
          'out', // خروج
          newSale.invoiceNumber || `SALE-${newSale.id}`,
          'sales'
        );
      }
    }

    // ملاحظة: رصيد العميل لا يُحدّث تلقائياً هنا
    // يتم تحديثه فقط عند الضغط على زر "إرسال إلى حساب العميل" في /api/sales/:id/send-to-client-account

    return newSale;
  }

  updateSale(id: number, sale: Partial<InsertSale>): Sale | undefined {
    const index = this.sales.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    this.sales[index] = {
      ...this.sales[index],
      ...sale
    };
    return this.sales[index];
  }

  deleteSale(id: number): boolean {
    const saleIndex = this.sales.findIndex(s => s.id === id);
    if (saleIndex === -1) return false;
    
    const sale = this.sales[saleIndex];
    console.log('🗑️ حذف فاتورة مبيعات:', sale.invoiceNumber);
    
    // عكس حركات المخزون - استرداد الكميات
    if (sale.items && Array.isArray(sale.items)) {
      for (const item of sale.items) {
        this.reverseInventoryTransaction(
          item.productId,
          item.quantity,
          'out', // العملية الأصلية كانت خروج، فالعكس دخول
          sale.invoiceNumber || `SALE-${sale.id}`
        );
      }
    }
    
    // ملاحظة: خصم المبلغ من رصيد العميل يتم في routes.ts
    // فقط إذا كانت الفاتورة قد أُرسلت لحساب العميل (sent_to_client_account = true)
    
    // حذف الفاتورة
    this.sales.splice(saleIndex, 1);
    console.log('✅ تم حذف فاتورة المبيعات بنجاح (المخزون فقط)');
    return true;
  }

  // Purchases - Stubs
  getPurchase(id: number): Purchase | undefined { 
    return this.purchases.find(p => p.id === id);
  }
  
  getAllPurchases(): Purchase[] { 
    return this.purchases; 
  }
  
  createPurchase(purchase: InsertPurchase): Purchase { 
    const newPurchase: Purchase = {
      id: this.nextId++,
      ...purchase,
      date: purchase.date || new Date(),
      notes: purchase.notes || null,
      branchId: purchase.branchId || null,
      supplierId: purchase.supplierId || null,
      items: purchase.items || null
    };
    
    this.purchases.push(newPurchase);

    // تحديث المخزون التلقائي - إضافة الكميات للمنتجات
    if (purchase.items && Array.isArray(purchase.items)) {
      for (const item of purchase.items) {
        this.processInventoryTransaction(
          item.productId,
          item.quantity,
          'in', // دخول
          `PURCHASE-${newPurchase.id}`,
          'purchase'
        );
      }
    }
    
    // ملاحظة: إضافة المبلغ لرصيد المورد يتم في routes.ts فقط عند اختيار طريقة الدفع "آجل"
    // (تم إزالة الإضافة التلقائية لتجنب الازدواجية)
    
    return newPurchase;
  }
  
  updatePurchase(id: number, purchase: Partial<InsertPurchase>): Purchase | undefined { 
    const index = this.purchases.findIndex(p => p.id === id);
    if (index !== -1) {
      this.purchases[index] = { ...this.purchases[index], ...purchase };
      return this.purchases[index];
    }
    return undefined;
  }
  
  deletePurchase(id: number): boolean { 
    const purchaseIndex = this.purchases.findIndex(p => p.id === id);
    if (purchaseIndex === -1) return false;
    
    const purchase = this.purchases[purchaseIndex];
    console.log('🗑️ حذف فاتورة مشتريات:', `PURCHASE-${purchase.id}`);
    
    // عكس حركات المخزون - خصم الكميات
    if (purchase.items && Array.isArray(purchase.items)) {
      for (const item of purchase.items) {
        this.reverseInventoryTransaction(
          item.productId,
          item.quantity,
          'in', // العملية الأصلية كانت دخول، فالعكس خروج
          `PURCHASE-${purchase.id}`
        );
      }
    }
    
    // خصم المبلغ من رصيد المورد
    if (purchase.supplierId && purchase.total) {
      const totalAmount = parseFloat(purchase.total);
      this.updateSupplierBalance(purchase.supplierId, -totalAmount);
      console.log(`💰 تم خصم ${totalAmount} من رصيد المورد ${purchase.supplierId}`);
    }
    
    // حذف الفاتورة
    this.purchases.splice(purchaseIndex, 1);
    console.log('✅ تم حذف فاتورة المشتريات بنجاح');
    return true;
  }

  // Suppliers - Full implementation
  private suppliers: Supplier[] = [];

  getSupplier(id: number): Supplier | undefined { 
    return this.suppliers.find(s => s.id === id); 
  }
  
  getAllSuppliers(branchId?: number): Supplier[] { 
    if (branchId) {
      return this.suppliers.filter(s => s.branchId === branchId);
    }
    return this.suppliers; 
  }
  
  createSupplier(supplier: InsertSupplier): Supplier { 
    const newSupplier: Supplier = {
      id: this.suppliers.length + 1,
      ...supplier,
      balance: supplier.balance || supplier.openingBalance || "0",
      currentBalance: supplier.currentBalance || supplier.openingBalance || "0",
      createdAt: new Date().toISOString()
    };
    this.suppliers.push(newSupplier);
    return newSupplier;
  }
  
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Supplier | undefined { 
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.suppliers[index] = { ...this.suppliers[index], ...supplier };
    return this.suppliers[index];
  }
  
  deleteSupplier(id: number): boolean { 
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.suppliers.splice(index, 1);
    return true;
  }

  updateSupplierBalance(supplierId: number, amount: number): Supplier | undefined {
    const supplier = this.suppliers.find(s => s.id === supplierId);
    if (!supplier) return undefined;
    
    // تحديث الرصيد الحالي للمورد
    const currentBalance = parseFloat(supplier.currentBalance || supplier.balance || '0');
    const newBalance = currentBalance + amount;
    
    supplier.currentBalance = newBalance;
    supplier.balance = newBalance.toString();
    
    console.log(`تم تحديث الرصيد الحالي للمورد ${supplier.name}: ${currentBalance} -> ${newBalance}`);
    
    return supplier;
  }

  // Holidays - Basic implementation
  getAllHolidays(): Holiday[] { return this.holidays; }
  getHoliday(id: number): Holiday | undefined { return this.holidays.find(h => h.id === id); }
  createHoliday(holiday: InsertHoliday): Holiday { 
    const newHoliday: Holiday = { 
      id: this.nextId++, 
      ...holiday, 
      createdAt: new Date() 
    };
    this.holidays.push(newHoliday);
    return newHoliday;
  }
  updateHoliday(id: number, holiday: Partial<InsertHoliday>): Holiday | undefined { 
    const index = this.holidays.findIndex(h => h.id === id);
    if (index === -1) return undefined;
    this.holidays[index] = { ...this.holidays[index], ...holiday };
    return this.holidays[index];
  }
  deleteHoliday(id: number): boolean { 
    const index = this.holidays.findIndex(h => h.id === id);
    if (index === -1) return false;
    this.holidays.splice(index, 1);
    return true;
  }
  updateHolidayStatus(id: number, status: string): Holiday | undefined { 
    return this.updateHoliday(id, { status });
  }

  // Salaries
  getAllSalaries(): Salary[] { return this.salaries; }
  getSalary(id: number): Salary | undefined { return this.salaries.find(s => s.id === id); }
  createSalary(salary: InsertSalary): Salary { 
    const newSalary: Salary = { id: this.nextId++, ...salary, createdAt: new Date() };
    this.salaries.push(newSalary);
    return newSalary;
  }
  updateSalary(id: number, salary: Partial<InsertSalary>): Salary | undefined { 
    const index = this.salaries.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.salaries[index] = { ...this.salaries[index], ...salary };
    return this.salaries[index];
  }
  deleteSalary(id: number): boolean { 
    const index = this.salaries.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.salaries.splice(index, 1);
    return true;
  }

  // Debts
  getDebt(id: number): Debt | undefined {
    return this.debts.find(d => d.id === id);
  }

  getAllDebts(): Debt[] {
    return this.debts;
  }

  createDebt(debt: InsertDebt): Debt {
    const newDebt: Debt = {
      id: this.nextId++,
      ...debt,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.debts.push(newDebt);
    return newDebt;
  }

  // Debt Payments
  getDebtPayment(id: number): DebtPayment | undefined {
    return this.debtPayments.find(p => p.id === id);
  }

  getAllDebtPayments(): DebtPayment[] {
    return this.debtPayments;
  }

  createDebtPayment(payment: InsertDebtPayment): DebtPayment {
    const newPayment: DebtPayment = {
      id: this.nextId++,
      ...payment,
      createdAt: new Date()
    };
    this.debtPayments.push(newPayment);
    return newPayment;
  }

  updateDebtPayment(id: number, payment: Partial<InsertDebtPayment>): DebtPayment | undefined {
    const index = this.debtPayments.findIndex(p => p.id === id);
    if (index !== -1) {
      this.debtPayments[index] = {
        ...this.debtPayments[index],
        ...payment
      };
      return this.debtPayments[index];
    }
    return undefined;
  }

  deleteDebtPayment(id: number): boolean {
    const index = this.debtPayments.findIndex(p => p.id === id);
    if (index !== -1) {
      this.debtPayments.splice(index, 1);
      return true;
    }
    return false;
  }

  updateDebt(id: number, debt: Partial<InsertDebt>): Debt | undefined {
    const index = this.debts.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    this.debts[index] = {
      ...this.debts[index],
      ...debt,
      updatedAt: new Date()
    };
    return this.debts[index];
  }

  deleteDebt(id: number): boolean {
    const index = this.debts.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.debts.splice(index, 1);
    return true;
  }



  // Allowances
  getAllAllowances(): Allowance[] {
    return this.allowances;
  }

  createAllowance(allowance: InsertAllowance): Allowance {
    const newAllowance: Allowance = {
      id: this.nextId++,
      ...allowance,
      createdAt: new Date()
    };
    this.allowances.push(newAllowance);
    return newAllowance;
  }

  updateAllowance(id: number, data: Partial<InsertAllowance>): Allowance | undefined {
    const index = this.allowances.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    this.allowances[index] = { ...this.allowances[index], ...data };
    return this.allowances[index];
  }

  deleteAllowance(id: number): boolean {
    const index = this.allowances.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.allowances.splice(index, 1);
    return true;
  }

  // Quotes - Full implementation
  getQuote(id: number): Quote | undefined { 
    return this.quotes.find(q => q.id === id);
  }
  
  getAllQuotes(): Quote[] { 
    return this.quotes; 
  }
  
  createQuote(quote: InsertQuote): Quote { 
    const newQuote: Quote = {
      id: this.nextId++,
      ...quote,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.quotes.push(newQuote);
    return newQuote;
  }
  
  updateQuote(id: number, quote: Partial<InsertQuote>): Quote | undefined { 
    const index = this.quotes.findIndex(q => q.id === id);
    if (index !== -1) {
      this.quotes[index] = { 
        ...this.quotes[index], 
        ...quote,
        updatedAt: new Date()
      };
      return this.quotes[index];
    }
    return undefined;
  }
  
  deleteQuote(id: number): boolean { 
    const index = this.quotes.findIndex(q => q.id === id);
    if (index !== -1) {
      this.quotes.splice(index, 1);
      return true;
    }
    return false;
  }

  // Sales Returns - Full implementation
  getSalesReturn(id: number): SalesReturn | undefined { 
    return this.salesReturns.find(r => r.id === id);
  }
  
  getAllSalesReturns(): SalesReturn[] { 
    return this.salesReturns; 
  }
  
  createSalesReturn(salesReturn: InsertSalesReturn): SalesReturn { 
    const newReturn: SalesReturn = {
      id: this.nextId++,
      ...salesReturn,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.salesReturns.push(newReturn);

    // معالجة المخزون - إرجاع الكميات المرتجعة
    if (salesReturn.items && Array.isArray(salesReturn.items)) {
      for (const item of salesReturn.items) {
        this.processInventoryTransaction(
          item.productId,
          item.quantity,
          'in', // دخول - إرجاع للمخزون
          `SALES-RETURN-${newReturn.id}`,
          'sales_return'
        );
      }
    }

    // خصم المبلغ من رصيد العميل
    if (salesReturn.saleId && salesReturn.total) {
      const originalSale = this.getSale(salesReturn.saleId);
      if (originalSale && originalSale.clientId) {
        const returnAmount = parseFloat(salesReturn.total);
        this.updateClientBalance(originalSale.clientId, -returnAmount);
        console.log(`💰 تم خصم ${returnAmount} من رصيد العميل ${originalSale.clientId} - مرتجع مبيعات`);
      }
    }

    return newReturn;
  }
  
  updateSalesReturn(id: number, salesReturn: Partial<InsertSalesReturn>): SalesReturn | undefined { 
    const index = this.salesReturns.findIndex(r => r.id === id);
    if (index !== -1) {
      this.salesReturns[index] = { 
        ...this.salesReturns[index], 
        ...salesReturn,
        updatedAt: new Date()
      };
      return this.salesReturns[index];
    }
    return undefined;
  }
  
  deleteSalesReturn(id: number): boolean { 
    const index = this.salesReturns.findIndex(r => r.id === id);
    if (index !== -1) {
      this.salesReturns.splice(index, 1);
      return true;
    }
    return false;
  }

  // Purchase Returns - Full implementation
  getPurchaseReturn(id: number): PurchaseReturn | undefined { 
    return this.purchaseReturns.find(r => r.id === id);
  }
  
  getAllPurchaseReturns(): PurchaseReturn[] { 
    return this.purchaseReturns; 
  }
  
  createPurchaseReturn(purchaseReturn: InsertPurchaseReturn): PurchaseReturn { 
    const newReturn: PurchaseReturn = {
      id: this.nextId++,
      ...purchaseReturn,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.purchaseReturns.push(newReturn);

    // معالجة المخزون - خصم الكميات المرتجعة من المخزون
    if (purchaseReturn.items && Array.isArray(purchaseReturn.items)) {
      for (const item of purchaseReturn.items) {
        this.processInventoryTransaction(
          item.productId,
          item.quantity,
          'out', // خروج - إرجاع للمورد
          `PURCHASE-RETURN-${newReturn.id}`,
          'purchase_return'
        );
      }
    }
    
    // خصم المبلغ من رصيد المورد تلقائياً
    if (purchaseReturn.purchaseId && purchaseReturn.total) {
      const originalPurchase = this.getPurchase(purchaseReturn.purchaseId);
      if (originalPurchase && originalPurchase.supplierId) {
        const returnAmount = parseFloat(purchaseReturn.total);
        this.updateSupplierBalance(originalPurchase.supplierId, -returnAmount);
        const supplier = this.getSupplier(originalPurchase.supplierId);
        console.log(`💰 تم خصم ${returnAmount} من رصيد المورد ${supplier?.name} - مرتجع مشتريات`);
      }
    }
    
    return newReturn;
  }
  
  updatePurchaseReturn(id: number, purchaseReturn: Partial<InsertPurchaseReturn>): PurchaseReturn | undefined { 
    const index = this.purchaseReturns.findIndex(r => r.id === id);
    if (index !== -1) {
      this.purchaseReturns[index] = { 
        ...this.purchaseReturns[index], 
        ...purchaseReturn,
        updatedAt: new Date()
      };
      return this.purchaseReturns[index];
    }
    return undefined;
  }
  
  deletePurchaseReturn(id: number): boolean { 
    const index = this.purchaseReturns.findIndex(r => r.id === id);
    if (index !== -1) {
      this.purchaseReturns.splice(index, 1);
      return true;
    }
    return false;
  }

  // Client Receipt Vouchers
  getClientReceiptVoucher(id: number): ClientReceiptVoucher | undefined {
    return this.clientReceiptVouchers.find(voucher => voucher.id === id);
  }

  getAllClientReceiptVouchers(branchId?: number): ClientReceiptVoucher[] {
    if (branchId) {
      return this.clientReceiptVouchers.filter(v => v.branchId === branchId);
    }
    return this.clientReceiptVouchers;
  }

  createClientReceiptVoucher(voucher: InsertClientReceiptVoucher): ClientReceiptVoucher {
    const newVoucher: ClientReceiptVoucher = {
      ...voucher,
      id: this.nextId++,
      createdAt: new Date()
    };
    
    // خصم المبلغ من الرصيد الموحد للعميل
    const voucherAmount = parseFloat(voucher.amount);
    this.updateClientBalance(voucher.clientId, -voucherAmount);
    
    this.clientReceiptVouchers.push(newVoucher);
    console.log(`✅ تم إنشاء سند قبض ${newVoucher.voucherNumber} وخصم ${voucherAmount} من رصيد العميل`);
    return newVoucher;
  }

  updateClientReceiptVoucher(id: number, voucher: Partial<InsertClientReceiptVoucher>): ClientReceiptVoucher | undefined {
    const index = this.clientReceiptVouchers.findIndex(v => v.id === id);
    if (index !== -1) {
      this.clientReceiptVouchers[index] = {
        ...this.clientReceiptVouchers[index],
        ...voucher
      };
      return this.clientReceiptVouchers[index];
    }
    return undefined;
  }

  deleteClientReceiptVoucher(id: number): boolean {
    const index = this.clientReceiptVouchers.findIndex(v => v.id === id);
    if (index !== -1) {
      const voucher = this.clientReceiptVouchers[index];
      
      // إرجاع المبلغ للرصيد الموحد عند الحذف
      const voucherAmount = parseFloat(voucher.amount);
      this.updateClientBalance(voucher.clientId, voucherAmount);
      
      this.clientReceiptVouchers.splice(index, 1);
      console.log(`🔄 تم حذف سند قبض ${voucher.voucherNumber} وإرجاع ${voucherAmount} لرصيد العميل`);
      return true;
    }
    return false;
  }

  // Goods Receipt Vouchers - Full implementation
  private goodsReceiptVouchers: any[] = [];

  getAllGoodsReceiptVouchers(): any[] {
    return this.goodsReceiptVouchers;
  }

  getGoodsReceiptVoucher(id: number): any | undefined {
    return this.goodsReceiptVouchers.find(v => v.id === id);
  }

  createGoodsReceiptVoucher(voucherData: any): any {
    const voucherNumber = voucherData.voucherNumber || `GRV-${Date.now()}`;
    const voucher = {
      id: this.nextId++,
      voucherNumber: voucherNumber,
      supplierId: voucherData.supplierId,
      supplierName: voucherData.supplierName || this.getSupplier(voucherData.supplierId)?.name || '',
      receivedBy: voucherData.receivedBy,
      receivedDate: voucherData.receivedDate,
      totalItems: voucherData.totalItems || 0,
      totalValue: parseFloat(voucherData.totalValue || '0'),
      status: voucherData.status || 'completed',
      notes: voucherData.notes || '',
      items: voucherData.items || [],
      createdAt: new Date().toISOString()
    };

    // تحديث المخزون باستخدام النظام المتكامل
    if (voucherData.items && Array.isArray(voucherData.items)) {
      for (const item of voucherData.items) {
        const quantityToAdd = item.quantity || item.receivedQuantity;
        if (item.productId && quantityToAdd) {
          this.processInventoryTransaction(
            parseInt(item.productId),
            parseInt(quantityToAdd),
            'in', // دخول - استلام بضاعة
            voucherNumber,
            'goods_receipt'
          );
        }
      }
    }

    // زيادة رصيد المورد (زيادة الدين)
    if (voucherData.supplierId && voucherData.totalValue) {
      const totalValue = parseFloat(voucherData.totalValue);
      this.updateSupplierBalance(voucherData.supplierId, totalValue);
      const supplier = this.getSupplier(voucherData.supplierId);
      console.log(`💰 تم زيادة رصيد المورد ${supplier?.name} بمبلغ ${totalValue} - سند استلام`);
    }

    this.goodsReceiptVouchers.push(voucher);
    console.log('✅ تم إنشاء سند استلام بضاعة بنجاح:', voucherNumber);
    return voucher;
  }

  updateGoodsReceiptVoucher(id: number, voucherData: any): any | undefined {
    const index = this.goodsReceiptVouchers.findIndex(v => v.id === id);
    if (index !== -1) {
      this.goodsReceiptVouchers[index] = {
        ...this.goodsReceiptVouchers[index],
        ...voucherData
      };
      return this.goodsReceiptVouchers[index];
    }
    return undefined;
  }

  deleteGoodsReceiptVoucher(id: number): boolean {
    const index = this.goodsReceiptVouchers.findIndex(v => v.id === id);
    if (index !== -1) {
      this.goodsReceiptVouchers.splice(index, 1);
      return true;
    }
    return false;
  }

  // Product Categories Functions
  getAllProductCategories(branchId?: number): any[] {
    if (branchId) {
      return this.productCategories.filter(cat => cat.branchId === branchId);
    }
    return this.productCategories;
  }

  getProductCategory(id: number): any | undefined {
    return this.productCategories.find(category => category.id === id);
  }

  createProductCategory(categoryData: any): any {
    const newCategory = {
      id: this.nextId++,
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.productCategories.push(newCategory);
    return newCategory;
  }

  updateProductCategory(id: number, categoryData: any): any | undefined {
    const index = this.productCategories.findIndex(category => category.id === id);
    if (index !== -1) {
      this.productCategories[index] = {
        ...this.productCategories[index],
        ...categoryData,
        updatedAt: new Date()
      };
      return this.productCategories[index];
    }
    return undefined;
  }

  deleteProductCategory(id: number): boolean {
    const index = this.productCategories.findIndex(category => category.id === id);
    if (index !== -1) {
      this.productCategories.splice(index, 1);
      return true;
    }
    return false;
  }

  // Branches Functions
  private branches: any[] = [
    {
      id: 117,
      name: "بوابة سوق البدو - الفرع الرئيسي",
      code: "001",
      address: "جده البغداديه الشرقيه",
      phone: "057537599",
      manager: "عبد الله",
      isActive: true,
      status: "active",
      openingDate: "2025-01-01",
      monthlyRevenue: 150000,
      employeeCount: 8,
      productCount: 45,
      rating: 4.8,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 118,
      name: "كنز المسلم",
      code: "002",
      address: "الرياض - حي النخيل",
      phone: "0501234567",
      manager: "محمد أحمد",
      isActive: true,
      status: "active",
      openingDate: "2025-02-15",
      monthlyRevenue: 95000,
      employeeCount: 5,
      productCount: 32,
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 119,
      name: "فرع الشرق",
      code: "003",
      address: "الدمام - الكورنيش",
      phone: "0509876543",
      manager: "خالد سعيد",
      isActive: true,
      status: "active",
      openingDate: "2025-03-10",
      monthlyRevenue: 72000,
      employeeCount: 4,
      productCount: 28,
      rating: 4.2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getAllBranches(): any[] {
    return this.branches;
  }

  getBranch(id: number): any | undefined {
    return this.branches.find(branch => branch.id === id);
  }

  createBranch(branchData: any): any {
    const newBranch = {
      id: this.nextId++,
      ...branchData,
      status: branchData.status || 'active',
      openingDate: branchData.openingDate || new Date().toISOString().split('T')[0],
      monthlyRevenue: branchData.monthlyRevenue || 0,
      employeeCount: branchData.employeeCount || 0,
      productCount: branchData.productCount || 0,
      rating: branchData.rating || 4.0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.branches.push(newBranch);
    return newBranch;
  }

  updateBranch(id: number, branchData: any): any | undefined {
    const index = this.branches.findIndex(branch => branch.id === id);
    if (index !== -1) {
      this.branches[index] = {
        ...this.branches[index],
        ...branchData,
        updatedAt: new Date()
      };
      return this.branches[index];
    }
    return undefined;
  }

  deleteBranch(id: number): boolean {
    const index = this.branches.findIndex(branch => branch.id === id);
    if (index !== -1) {
      this.branches.splice(index, 1);
      return true;
    }
    return false;
  }

  // Professional Inventory Movement System
  getAllInventoryMovements(): InventoryMovement[] {
    return [...this.inventoryMovements].sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime());
  }

  addInventoryMovement(movement: any): InventoryMovement {
    const newMovement: InventoryMovement = {
      id: this.inventoryMovementIdCounter++,
      productId: movement.productId,
      productName: movement.productName,
      productCode: movement.productCode,
      movementType: movement.movementType,
      quantity: movement.quantity,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      referenceNumber: movement.referenceNumber,
      notes: movement.notes || '',
      branchId: movement.branchId,
      createdBy: movement.createdBy,
      movementDate: movement.movementDate || new Date().toISOString(),
      createdAt: movement.createdAt || new Date().toISOString()
    };
    this.inventoryMovements.push(newMovement);
    return newMovement;
  }

  processInventoryTransaction(productId: number, quantity: number, type: 'in' | 'out', reference: string, referenceType: string): void {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      console.error(`المنتج غير موجود: ${productId}`);
      return;
    }

    // تحديث كمية المنتج
    const currentQuantity = parseInt(product.quantity?.toString() || '0');
    const changeQuantity = type === 'in' ? quantity : -quantity;
    const newQuantity = Math.max(0, currentQuantity + changeQuantity);
    
    console.log(`🔄 معالجة حركة المخزون: ${product.name} - الكمية من ${currentQuantity} إلى ${newQuantity}`);
    
    product.quantity = newQuantity;

    // تسجيل الحركة
    this.addInventoryMovement({
      productId,
      productName: product.name,
      productCode: product.code || '',
      movementType: type,
      quantity,
      referenceNumber: reference,
      referenceType,
      notes: `${type === 'in' ? 'دخول' : 'خروج'} - ${referenceType}`
    });
  }

  reverseInventoryTransaction(productId: number, quantity: number, type: 'in' | 'out', reference: string): void {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      console.error(`المنتج غير موجود: ${productId}`);
      return;
    }

    // عكس العملية
    const currentQuantity = parseInt(product.quantity?.toString() || '0');
    const changeQuantity = type === 'in' ? -quantity : quantity; // عكس العملية الأصلية
    const newQuantity = Math.max(0, currentQuantity + changeQuantity);
    
    console.log(`↩️ عكس حركة المخزون: ${product.name} - الكمية من ${currentQuantity} إلى ${newQuantity}`);
    
    product.quantity = newQuantity;

    // تسجيل عكس الحركة
    this.addInventoryMovement({
      productId,
      productName: product.name,
      productCode: product.code || '',
      movementType: type === 'in' ? 'out' : 'in',
      quantity,
      referenceNumber: `عكس ${reference}`,
      referenceType: 'reversal',
      notes: `عكس حركة - ${type === 'in' ? 'خروج' : 'دخول'}`
    });
  }

  // Inventory Opening Balances
  private inventoryOpeningBalances: any[] = [];
  private inventoryOpeningBalanceIdCounter = 1;

  getAllInventoryOpeningBalances(): any[] {
    return this.inventoryOpeningBalances;
  }

  createInventoryOpeningBalance(data: any): any {
    const newBalance = {
      id: this.inventoryOpeningBalanceIdCounter++,
      productId: data.productId,
      productName: data.productName,
      openingQuantity: data.openingQuantity,
      openingValue: data.openingValue,
      date: data.date,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    
    this.inventoryOpeningBalances.push(newBalance);
    return newBalance;
  }

  // Goods Issue Vouchers implementation
  private goodsIssueVouchers: any[] = [
    {
      id: 1,
      voucherNumber: "GIV-2025-001",
      clientId: 1,
      clientName: "شركة النور التجارية",
      issuedBy: "أحمد السعد",
      totalQuantity: 5,
      totalAmount: "15000",
      status: "completed",
      notes: "سند إخراج للطلبية رقم PO-001",
      items: [
        {
          productId: 1,
          productName: "لابتوب HP EliteBook",
          quantity: 2,
          unitPrice: 5000,
          total: 10000
        },
        {
          productId: 2,
          productName: "طابعة Canon",
          quantity: 3,
          unitPrice: 1666.67,
          total: 5000
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getAllGoodsIssueVouchers(branchId?: number): any[] {
    if (branchId) {
      return this.goodsIssueVouchers.filter(v => v.branchId === branchId);
    }
    return this.goodsIssueVouchers;
  }

  createGoodsIssueVoucher(voucherData: any): any {
    const newVoucher = {
      id: this.nextId++,
      ...voucherData,
      voucherNumber: voucherData.voucherNumber || `GIV-${Date.now()}`,
      status: voucherData.status || 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.goodsIssueVouchers.push(newVoucher);
    
    // تحديث المخزون باستخدام النظام المتكامل
    if (newVoucher.items && Array.isArray(newVoucher.items)) {
      newVoucher.items.forEach((item: any) => {
        this.processInventoryTransaction(
          item.productId,
          item.quantity,
          'out', // خروج - إخراج بضاعة
          newVoucher.voucherNumber,
          'goods_issue'
        );
      });
    }
    
    // إضافة لرصيد العميل إذا وجد
    if (newVoucher.clientId && newVoucher.totalAmount) {
      this.updateClientBalance(newVoucher.clientId, parseFloat(newVoucher.totalAmount.toString()));
      console.log(`💰 تم إضافة ${newVoucher.totalAmount} لرصيد العميل ${newVoucher.clientId} - سند إخراج`);
    }
    
    console.log('✅ تم إنشاء سند إخراج بضاعة بنجاح:', newVoucher.voucherNumber);
    return newVoucher;
  }

  getGoodsIssueVoucher(id: number): any {
    return this.goodsIssueVouchers.find(voucher => voucher.id === id);
  }

  updateGoodsIssueVoucher(id: number, voucherData: any): any {
    const index = this.goodsIssueVouchers.findIndex(voucher => voucher.id === id);
    if (index !== -1) {
      this.goodsIssueVouchers[index] = {
        ...this.goodsIssueVouchers[index],
        ...voucherData,
        updatedAt: new Date()
      };
      return this.goodsIssueVouchers[index];
    }
    return undefined;
  }

  deleteGoodsIssueVoucher(id: number): boolean {
    const voucherIndex = this.goodsIssueVouchers.findIndex(voucher => voucher.id === id);
    if (voucherIndex !== -1) {
      const voucher = this.goodsIssueVouchers[voucherIndex];
      
      // عكس تأثير السند على المخزون والأرصدة
      if (voucher.items && Array.isArray(voucher.items)) {
        voucher.items.forEach((item: any) => {
          // إرجاع للمخزون
          this.processInventoryTransaction(item.productId, item.quantity, 'return_goods_issue');
        });
      }
      
      // خصم من رصيد العميل
      if (voucher.clientId && voucher.totalAmount) {
        this.updateClientBalance(voucher.clientId, parseFloat(voucher.totalAmount.toString()), 'decrease');
      }
      
      this.goodsIssueVouchers.splice(voucherIndex, 1);
      console.log('تم حذف سند إخراج بضاعة وعكس تأثيره:', voucher);
      return true;
    }
    return false;
  }

  // Supplier Payment Vouchers Functions
  getSupplierPaymentVoucher(id: number): SupplierPaymentVoucher | undefined {
    return this.supplierPaymentVouchers.find(voucher => voucher.id === id);
  }

  getAllSupplierPaymentVouchers(branchId?: number): SupplierPaymentVoucher[] {
    // تنظيف البيانات - إزالة السندات المتكررة وإنشاء IDs فريدة
    this.cleanupDuplicateVouchers();
    
    // إذا تم تحديد branchId، قم بالفلترة (مع إرجاع السندات التي ليس لديها branchId)
    if (branchId) {
      return this.supplierPaymentVouchers.filter(voucher => 
        !voucher.branchId || voucher.branchId === branchId
      );
    }
    
    return this.supplierPaymentVouchers;
  }

  // تنظيف السندات المتكررة
  private cleanupDuplicateVouchers(): void {
    const seenVoucherNumbers = new Set<string>();
    const uniqueVouchers: SupplierPaymentVoucher[] = [];
    let currentId = this.nextId;

    for (const voucher of this.supplierPaymentVouchers) {
      if (!seenVoucherNumbers.has(voucher.voucherNumber)) {
        seenVoucherNumbers.add(voucher.voucherNumber);
        // إنشاء ID فريد
        const cleanVoucher: SupplierPaymentVoucher = {
          ...voucher,
          id: currentId++
        };
        uniqueVouchers.push(cleanVoucher);
      }
    }

    // إذا كان هناك تغيير، احفظ البيانات النظيفة
    if (uniqueVouchers.length !== this.supplierPaymentVouchers.length) {
      console.log(`🧹 تم تنظيف ${this.supplierPaymentVouchers.length - uniqueVouchers.length} سند مكرر`);
      this.supplierPaymentVouchers = uniqueVouchers;
      this.nextId = currentId;
      this.saveSupplierPaymentVouchersToFile();
    }
  }

  createSupplierPaymentVoucher(voucherData: InsertSupplierPaymentVoucher): SupplierPaymentVoucher {
    const newVoucher: SupplierPaymentVoucher = {
      id: this.nextId++,
      supplierId: voucherData.supplierId,
      voucherNumber: voucherData.voucherNumber,
      amount: voucherData.amount,
      paymentMethod: voucherData.paymentMethod,
      paymentDate: voucherData.paymentDate,
      description: voucherData.description || null,
      reference: voucherData.reference || null,
      status: voucherData.status || 'completed',
      notes: voucherData.notes || null,
      createdAt: new Date()
    };
    
    this.supplierPaymentVouchers.push(newVoucher);
    
    // حفظ في الملف فوراً
    this.saveSupplierPaymentVouchersToFile();
    
    // خصم المبلغ من رصيد المورد تلقائياً
    const amount = parseFloat(newVoucher.amount.toString());
    this.updateSupplierBalance(newVoucher.supplierId, -amount);
    
    return newVoucher;
  }

  updateSupplierPaymentVoucher(id: number, voucherData: Partial<InsertSupplierPaymentVoucher>): SupplierPaymentVoucher | undefined {
    const index = this.supplierPaymentVouchers.findIndex(voucher => voucher.id === id);
    if (index !== -1) {
      this.supplierPaymentVouchers[index] = {
        ...this.supplierPaymentVouchers[index],
        ...voucherData
      };
      this.saveSupplierPaymentVouchersToFile();
      return this.supplierPaymentVouchers[index];
    }
    return undefined;
  }

  deleteSupplierPaymentVoucher(id: number): boolean {
    const index = this.supplierPaymentVouchers.findIndex(voucher => voucher.id === id);
    if (index !== -1) {
      // إرجاع المبلغ لرصيد المورد عند الحذف
      const voucher = this.supplierPaymentVouchers[index];
      const amount = parseFloat(voucher.amount.toString());
      this.updateSupplierBalance(voucher.supplierId, amount);
      
      this.supplierPaymentVouchers.splice(index, 1);
      this.saveSupplierPaymentVouchersToFile();
      return true;
    }
    return false;
  }

  // Branch Receipt Vouchers - سندات القبض
  getBranchReceiptVoucher(id: number): BranchReceiptVoucher | undefined {
    return this.branchReceiptVouchers.find(v => v.id === id);
  }

  getAllBranchReceiptVouchers(branchId?: number): BranchReceiptVoucher[] {
    if (branchId) {
      return this.branchReceiptVouchers.filter(v => v.branchId === branchId);
    }
    return this.branchReceiptVouchers;
  }

  createBranchReceiptVoucher(voucherData: InsertBranchReceiptVoucher): BranchReceiptVoucher {
    const maxId = this.branchReceiptVouchers.length > 0
      ? Math.max(...this.branchReceiptVouchers.map(v => v.id))
      : 0;
    const newVoucher: BranchReceiptVoucher = {
      id: maxId + 1,
      ...voucherData,
      amount: voucherData.amount.toString(),
      date: voucherData.date ? new Date(voucherData.date) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.branchReceiptVouchers.push(newVoucher);
    return newVoucher;
  }

  updateBranchReceiptVoucher(id: number, voucherData: Partial<InsertBranchReceiptVoucher>): BranchReceiptVoucher | undefined {
    const index = this.branchReceiptVouchers.findIndex(v => v.id === id);
    if (index !== -1) {
      this.branchReceiptVouchers[index] = {
        ...this.branchReceiptVouchers[index],
        ...voucherData,
        updatedAt: new Date()
      };
      return this.branchReceiptVouchers[index];
    }
    return undefined;
  }

  deleteBranchReceiptVoucher(id: number): boolean {
    const index = this.branchReceiptVouchers.findIndex(v => v.id === id);
    if (index !== -1) {
      this.branchReceiptVouchers.splice(index, 1);
      return true;
    }
    return false;
  }

  // Employee Debts management
  getAllEmployeeDebts() {
    // البحث في كلا القائمتين
    const debtsFromMain = this.debts?.filter(debt => debt.debtorType === 'employee') || [];
    const debtsFromEmployeeDebts = this.employeeDebts || [];
    
    // دمج القائمتين وإزالة المكررات
    const allDebts = [...debtsFromMain, ...debtsFromEmployeeDebts];
    const uniqueDebts = allDebts.filter((debt, index, self) => 
      index === self.findIndex(d => d.id === debt.id)
    );
    
    console.log(`🔍 البحث في جميع ديون الموظفين:`);
    console.log(`   - من debts: ${debtsFromMain.length} ديون`);
    console.log(`   - من employeeDebts: ${debtsFromEmployeeDebts.length} ديون`);
    console.log(`   - المجموع الفريد: ${uniqueDebts.length} ديون`);
    
    return uniqueDebts;
  }

  getEmployeeDebts(employeeId: number) {
    // البحث في كلا القائمتين
    const debtsFromMain = this.debts?.filter(debt => debt.debtorType === 'employee' && debt.debtorId === employeeId) || [];
    const debtsFromEmployeeDebts = this.employeeDebts?.filter(debt => debt.debtorId === employeeId) || [];
    
    // دمج القائمتين وإزالة المكررات
    const allDebts = [...debtsFromMain, ...debtsFromEmployeeDebts];
    const uniqueDebts = allDebts.filter((debt, index, self) => 
      index === self.findIndex(d => d.id === debt.id)
    );
    
    console.log(`🔍 البحث في ديون الموظف ${employeeId}:`);
    console.log(`   - من debts: ${debtsFromMain.length} ديون`);
    console.log(`   - من employeeDebts: ${debtsFromEmployeeDebts.length} ديون`);
    console.log(`   - المجموع الفريد: ${uniqueDebts.length} ديون`);
    
    return uniqueDebts;
  }

  updateEmployeeDebt(debtId: number, updatedDebt: any) {
    const index = this.employeeDebts.findIndex(debt => debt.id === debtId);
    if (index !== -1) {
      this.employeeDebts[index] = { ...this.employeeDebts[index], ...updatedDebt };
      return this.employeeDebts[index];
    }
    return null;
  }

  // Operation Results management
  saveOperationResult(result: {
    operationType: string;
    operationId: number;
    employeeId: number;
    employeeName: string;
    summary: any;
    totalAmount: string;
    status?: string;
  }) {
    const newResult = {
      id: this.nextId++,
      ...result,
      status: result.status || 'completed',
      createdAt: new Date()
    };
    this.operationResults.push(newResult);
    console.log(`💾 تم حفظ نتيجة العملية: ${result.operationType} للموظف ${result.employeeName}`);
    return newResult;
  }

  getOperationResults() {
    return this.operationResults;
  }

  getOperationResult(id: number) {
    return this.operationResults.find(result => result.id === id);
  }

  getOperationResultsByEmployee(employeeId: number) {
    return this.operationResults.filter(result => result.employeeId === employeeId);
  }

  // Settings functions
  async saveSettings(section: string, data: any): Promise<void> {
    if (!this.settings) {
      this.settings = {};
    }
    this.settings[section] = data;
    this.saveSettingsToFile();
    console.log(`Settings saved for section: ${section}`);
  }

  async getSettings(): Promise<any> {
    return this.settings || {};
  }

  // Backup functions
  async createBackup(): Promise<string> {
    const backupId = `backup_${Date.now()}`;
    const backupData = {
      products: this.products,
      clients: this.clients,
      suppliers: this.suppliers,
      sales: this.sales,
      purchases: this.purchases,
      employees: this.employees,
      employeeDebts: this.employeeDebts,
      operationResults: this.operationResults,
      settings: this.settings,
      timestamp: new Date().toISOString()
    };
    
    if (!this.backups) {
      this.backups = [];
    }
    
    this.backups.push({
      id: backupId,
      data: backupData,
      createdAt: new Date().toISOString()
    });
    
    console.log(`Backup created with ID: ${backupId}`);
    return backupId;
  }

  async getLatestBackup(): Promise<string> {
    if (!this.backups || this.backups.length === 0) {
      throw new Error('No backups available');
    }
    
    const latestBackup = this.backups[this.backups.length - 1];
    const sqlData = `-- Database Backup Created: ${latestBackup.createdAt}
-- Backup ID: ${latestBackup.id}

-- Products Data
${JSON.stringify(latestBackup.data.products, null, 2)}

-- Clients Data  
${JSON.stringify(latestBackup.data.clients, null, 2)}

-- Suppliers Data
${JSON.stringify(latestBackup.data.suppliers, null, 2)}

-- Sales Data
${JSON.stringify(latestBackup.data.sales, null, 2)}

-- Purchases Data
${JSON.stringify(latestBackup.data.purchases, null, 2)}

-- Employees Data
${JSON.stringify(latestBackup.data.employees, null, 2)}

-- Employee Debts Data
${JSON.stringify(latestBackup.data.employeeDebts, null, 2)}

-- Operation Results Data
${JSON.stringify(latestBackup.data.operationResults, null, 2)}

-- Settings Data
${JSON.stringify(latestBackup.data.settings, null, 2)}
`;
    
    return sqlData;
  }

  // Debt Payments functions
  getAllDebtPayments(): any[] {
    return this.debtPayments;
  }

  getDebtPaymentsByEmployee(employeeId: number): any[] {
    return this.debtPayments.filter(payment => payment.employeeId === employeeId);
  }

  createDebtPayment(payment: any): any {
    const newPayment = {
      id: this.nextId++,
      ...payment,
      createdAt: new Date()
    };
    this.debtPayments.push(newPayment);
    console.log(`💰 تم إنشاء سداد دين: ${payment.amount} ريال للموظف ${payment.employeeId}`);
    return newPayment;
  }

  // Employee Deductions functions
  getEmployeeDeduction(id: number): EmployeeDeduction | undefined {
    return this.employeeDeductions.find(deduction => deduction.id === id);
  }

  getAllEmployeeDeductions(): EmployeeDeduction[] {
    return this.employeeDeductions;
  }

  createEmployeeDeduction(deduction: InsertEmployeeDeduction): EmployeeDeduction {
    const newDeduction: EmployeeDeduction = {
      id: this.nextId++,
      ...deduction,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // معالجة الخصم حسب النوع
    if (deduction.deductionType === 'salary_deduction') {
      this.processSalaryDeduction(newDeduction);
    } else if (deduction.deductionType === 'debt_deduction') {
      this.processDebtDeduction(newDeduction);
    } else if (deduction.deductionType === 'salary_to_debt') {
      this.processSalaryToDebtTransfer(newDeduction);
    }

    this.employeeDeductions.push(newDeduction);
    console.log(`🧮 تم إنشاء خصم جديد: ${deduction.deductionType} - ${deduction.amount} ريال للموظف ${deduction.employeeId}`);
    return newDeduction;
  }

  private processSalaryDeduction(deduction: EmployeeDeduction): void {
    // خصم من الراتب
    const employee = this.employees.find(emp => emp.id === deduction.employeeId);
    if (employee) {
      const currentSalary = parseFloat(employee.salary);
      const deductionAmount = parseFloat(deduction.amount);
      const newSalary = currentSalary - deductionAmount;
      
      employee.salary = newSalary.toString();
      console.log(`📉 تم خصم ${deductionAmount} ريال من راتب الموظف ${employee.name}. الراتب الجديد: ${newSalary} ريال`);
    }
  }

  private processDebtDeduction(deduction: EmployeeDeduction): void {
    // خصم من الدين
    if (deduction.targetDebtId) {
      const debt = this.debts.find(d => d.id === deduction.targetDebtId);
      if (debt) {
        const currentRemaining = parseFloat(debt.remainingAmount);
        const deductionAmount = parseFloat(deduction.amount);
        const newRemaining = Math.max(0, currentRemaining - deductionAmount);
        
        debt.remainingAmount = newRemaining.toString();
        if (newRemaining === 0) {
          debt.status = 'paid';
        }
        console.log(`💸 تم خصم ${deductionAmount} ريال من الدين ${debt.id}. المبلغ المتبقي: ${newRemaining} ريال`);
      }
    }
  }

  private processSalaryToDebtTransfer(deduction: EmployeeDeduction): void {
    // خصم من الراتب وتحويل للدين
    const employee = this.employees.find(emp => emp.id === deduction.employeeId);
    if (employee) {
      const currentSalary = parseFloat(employee.salary);
      const deductionAmount = parseFloat(deduction.amount);
      const newSalary = currentSalary - deductionAmount;
      
      employee.salary = newSalary.toString();
      console.log(`📉 تم خصم ${deductionAmount} ريال من راتب الموظف ${employee.name}. الراتب الجديد: ${newSalary} ريال`);
      
      // تحويل المبلغ لسداد الدين
      if (deduction.targetDebtId) {
        const debt = this.debts.find(d => d.id === deduction.targetDebtId);
        if (debt) {
          const currentRemaining = parseFloat(debt.remainingAmount);
          const newRemaining = Math.max(0, currentRemaining - deductionAmount);
          
          debt.remainingAmount = newRemaining.toString();
          if (newRemaining === 0) {
            debt.status = 'paid';
          }
          console.log(`💰 تم تحويل ${deductionAmount} ريال من الراتب لسداد الدين ${debt.id}. المبلغ المتبقي: ${newRemaining} ريال`);
        }
      }
    }
  }

  updateEmployeeDeduction(id: number, deduction: Partial<InsertEmployeeDeduction>): EmployeeDeduction | undefined {
    const index = this.employeeDeductions.findIndex(d => d.id === id);
    if (index !== -1) {
      this.employeeDeductions[index] = { 
        ...this.employeeDeductions[index], 
        ...deduction,
        updatedAt: new Date()
      };
      return this.employeeDeductions[index];
    }
    return undefined;
  }

  deleteEmployeeDeduction(id: number): boolean {
    const index = this.employeeDeductions.findIndex(d => d.id === id);
    if (index !== -1) {
      this.employeeDeductions.splice(index, 1);
      return true;
    }
    return false;
  }

  // Daily Expenses
  getDailyExpense(id: number): DailyExpense | undefined {
    return this.dailyExpenses.find(expense => expense.id === id);
  }

  getAllDailyExpenses(): DailyExpense[] {
    return this.dailyExpenses;
  }

  getDailyExpensesByBranch(branchId: number): DailyExpense[] {
    return this.dailyExpenses.filter(expense => expense.branchId === branchId);
  }

  createDailyExpense(expense: InsertDailyExpense): DailyExpense {
    const newExpense: DailyExpense = {
      id: this.nextId++,
      ...expense,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.dailyExpenses.push(newExpense);
    return newExpense;
  }

  updateDailyExpense(id: number, expense: Partial<InsertDailyExpense>): DailyExpense | undefined {
    const index = this.dailyExpenses.findIndex(e => e.id === id);
    if (index !== -1) {
      this.dailyExpenses[index] = {
        ...this.dailyExpenses[index],
        ...expense,
        updatedAt: new Date()
      };
      return this.dailyExpenses[index];
    }
    return undefined;
  }

  deleteDailyExpense(id: number): boolean {
    const index = this.dailyExpenses.findIndex(e => e.id === id);
    if (index !== -1) {
      this.dailyExpenses.splice(index, 1);
      return true;
    }
    return false;
  }

  // Inventory Transfers (temporary - returns empty array)
  getAllInventoryTransfers(): any[] {
    return [];
  }

  getInventoryTransfer(id: number): any | undefined {
    return undefined;
  }

  createInventoryTransfer(transfer: any): any {
    return {
      id: this.nextId++,
      ...transfer,
      status: 'sent',
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  updateInventoryTransfer(id: number, transfer: any): any | undefined {
    return undefined;
  }

  deleteInventoryTransfer(id: number): boolean {
    return false;
  }

  getInventoryTransfersByBranch(branchId: number): any[] {
    return [];
  }

  // Branch Financial Summary
  getBranchFinancialSummary(branchId?: number): any {
    const branches = branchId 
      ? [this.branches.find(b => b.id === branchId)].filter(Boolean)
      : this.branches;
    
    return branches.map(branch => {
      if (!branch) return null;
      
      // Filter data by branchId
      const branchSales = this.sales.filter(s => s.branchId === branch.id);
      const branchPurchases = this.purchases.filter(p => p.branchId === branch.id);
      const branchExpenses = this.dailyExpenses.filter(e => e.branchId === branch.id);
      const branchProducts = this.products.filter(p => p.branchId === branch.id);
      const branchClients = this.clients.filter(c => c.branchId === branch.id);
      const branchSuppliers = this.suppliers.filter(s => s.branchId === branch.id);
      const branchEmployees = this.employees.filter(e => e.branchId === branch.id);
      
      // Calculate total sales
      const totalSales = branchSales.reduce((sum, sale) => {
        const saleTotal = sale.items.reduce((itemSum: number, item: any) => 
          itemSum + (item.quantity * item.price), 0);
        return sum + saleTotal;
      }, 0);
      
      // Calculate total purchases
      const totalPurchases = branchPurchases.reduce((sum, purchase) => {
        const purchaseTotal = purchase.items.reduce((itemSum: number, item: any) => 
          itemSum + (item.quantity * item.price), 0);
        return sum + purchaseTotal;
      }, 0);
      
      // Calculate total expenses
      const totalExpenses = branchExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      
      // Calculate inventory value
      const inventoryValue = branchProducts.reduce((sum, product) => 
        sum + (product.quantity * (product.purchasePrice || 0)), 0);
      
      // Calculate gross profit (sales - cost of goods sold)
      const grossProfit = totalSales - totalPurchases;
      
      // Calculate net profit (gross profit - expenses)
      const netProfit = grossProfit - totalExpenses;
      
      // Calculate profit margin
      const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
      
      // Calculate average sale
      const averageSale = branchSales.length > 0 ? totalSales / branchSales.length : 0;
      
      // Client balances
      const totalClientDebt = branchClients.reduce((sum, client) => sum + (client.balance || 0), 0);
      
      // Supplier balances
      const totalSupplierDebt = branchSuppliers.reduce((sum, supplier) => sum + (supplier.balance || 0), 0);
      
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
    }).filter(Boolean);
  }


}

export const storage = new MemoryStorage();