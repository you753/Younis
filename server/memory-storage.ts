import { 
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
  type Debt, type InsertDebt,
  type DebtPayment, type InsertDebtPayment
} from "@shared/schema";

export interface IStorage {
  // Users
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
  getSale(id: number): Promise<Sale | undefined>;
  getAllSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined>;
  deleteSale(id: number): Promise<boolean>;

  // Purchases
  getPurchase(id: number): Promise<Purchase | undefined>;
  getAllPurchases(): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase | undefined>;
  deletePurchase(id: number): Promise<boolean>;

  // Employees
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Holidays
  getAllHolidays(): Promise<Holiday[]>;
  getHoliday(id: number): Promise<Holiday | undefined>;
  createHoliday(holiday: InsertHoliday): Promise<Holiday>;
  updateHoliday(id: number, holiday: Partial<InsertHoliday>): Promise<Holiday | undefined>;
  deleteHoliday(id: number): Promise<boolean>;
  updateHolidayStatus(id: number, status: string): Promise<Holiday | undefined>;

  // Deductions
  getDeduction(id: number): Promise<Deduction | undefined>;
  getAllDeductions(): Promise<Deduction[]>;
  createDeduction(deduction: InsertDeduction): Promise<Deduction>;
  updateDeduction(id: number, deduction: Partial<InsertDeduction>): Promise<Deduction | undefined>;
  deleteDeduction(id: number): Promise<boolean>;

  // Salaries
  getAllSalaries(): Promise<Salary[]>;
  getSalary(id: number): Promise<Salary | undefined>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined>;
  deleteSalary(id: number): Promise<boolean>;

  // Debts
  getDebt(id: number): Promise<Debt | undefined>;
  getAllDebts(): Promise<Debt[]>;
  createDebt(debt: InsertDebt): Promise<Debt>;
  updateDebt(id: number, debt: Partial<InsertDebt>): Promise<Debt | undefined>;
  deleteDebt(id: number): Promise<boolean>;

  // Debt Payments
  getDebtPayment(id: number): Promise<DebtPayment | undefined>;
  getAllDebtPayments(): Promise<DebtPayment[]>;
  createDebtPayment(payment: InsertDebtPayment): Promise<DebtPayment>;
  updateDebtPayment(id: number, payment: Partial<InsertDebtPayment>): Promise<DebtPayment | undefined>;
  deleteDebtPayment(id: number): Promise<boolean>;
}

export class MemoryStorage implements IStorage {
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
  private debts: Debt[] = [];
  private debtPayments: DebtPayment[] = [];

  private nextId = 1;

  constructor() {
    // بيانات تجريبية للاختبار
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
        type: "penalty",
        date: new Date("2025-06-01"),
        description: "خصم بسبب التأخير",
        recurring: false,
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
        notes: null,
        status: "active",
        accountType: "individual",
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
        salePrice: "100",
        purchasePrice: "80",
        quantity: 50,
        minQuantity: 10,
        category: "عام",
        branchId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // بيانات تجريبية للديون
    this.debts = [
      {
        id: 1,
        type: "supplier",
        description: "دين على مورد أجهزة كمبيوتر",
        amount: "15000",
        remainingAmount: "12000",
        creditorName: "شركة التقنية المتقدمة",
        creditorPhone: "0551234567",
        creditorAddress: "الرياض، السعودية",
        dueDate: new Date("2025-08-15"),
        currency: "SAR",
        status: "pending",
        interestRate: "5",
        notes: "دين على شراء أجهزة كمبيوتر للمكتب",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        type: "client",
        description: "دين من عميل كبير",
        amount: "8500",
        remainingAmount: "5000",
        creditorName: "محمد عبدالله التجاري",
        creditorPhone: "0557654321",
        creditorAddress: "جدة، السعودية",
        dueDate: new Date("2025-07-30"),
        currency: "SAR",
        status: "overdue",
        interestRate: "0",
        notes: "دين من مبيعات شهر مايو",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        debtorType: "employee",
        debtorId: 1,
        debtorName: "أحمد محمد",
        amount: "1500",
        remainingAmount: "1500",
        currency: "SAR",
        type: "payable",
        description: "سلفة شخصية للموظف",
        dueDate: new Date("2025-08-01"),
        status: "active",
        priority: "medium",
        notes: "سلفة شخصية تُخصم من الراتب",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        debtorType: "employee",
        debtorId: 1,
        debtorName: "أحمد محمد",
        amount: "800",
        remainingAmount: "800",
        currency: "SAR",
        type: "payable",
        description: "مصاريف تدريب",
        dueDate: new Date("2025-09-01"),
        status: "active",
        priority: "low",
        notes: "تكلفة دورة تدريبية",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // بيانات تجريبية لمدفوعات الديون
    this.debtPayments = [
      {
        id: 1,
        debtId: 1,
        amount: "3000",
        paymentDate: new Date("2025-06-15"),
        paymentMethod: "bank_transfer",
        notes: "دفعة أولى من الدين",
        createdAt: new Date()
      },
      {
        id: 2,
        debtId: 2,
        amount: "3500",
        paymentDate: new Date("2025-06-10"),
        paymentMethod: "cash",
        notes: "دفعة جزئية",
        createdAt: new Date()
      }
    ];

    this.nextId = 3;
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

  getAllEmployees(): Employee[] {
    return this.employees;
  }

  createEmployee(employee: InsertEmployee): Employee {
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

  getAllDeductions(): Deduction[] {
    return this.deductions;
  }

  createDeduction(deduction: InsertDeduction): Deduction {
    const newDeduction: Deduction = {
      id: this.nextId++,
      ...deduction,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.deductions.push(newDeduction);
    
    // Automatically deduct from employee's latest salary
    this.updateEmployeeSalaryDeductions(deduction.employeeId, parseFloat(deduction.amount));
    
    // خصم المبلغ من ديون الموظف (إذا كان له ديون)
    this.deductFromEmployeeDebt(deduction.employeeId, parseFloat(deduction.amount));
    
    return newDeduction;
  }

  // Update employee's latest salary to include new deductions
  async updateEmployeeSalaryDeductions(employeeId: number, deductionAmount: number): Promise<void> {
    // Find the latest salary for this employee
    const latestSalary = this.salaries
      .filter(s => s.employeeId === employeeId)
      .sort((a, b) => {
        // Sort by year and month to find the latest
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })[0];

    if (latestSalary) {
      // Update the total deductions and recalculate net salary
      const currentDeductions = parseFloat(latestSalary.totalDeductions || '0');
      const newTotalDeductions = currentDeductions + deductionAmount;
      
      const baseSalary = parseFloat(latestSalary.baseSalary);
      const overtime = parseFloat(latestSalary.overtime || '0');
      const bonuses = parseFloat(latestSalary.bonuses || '0');
      const newNetSalary = baseSalary + overtime + bonuses - newTotalDeductions;

      // Update the salary record
      const salaryIndex = this.salaries.findIndex(s => s.id === latestSalary.id);
      if (salaryIndex !== -1) {
        this.salaries[salaryIndex] = {
          ...this.salaries[salaryIndex],
          totalDeductions: newTotalDeductions.toString(),
          netSalary: newNetSalary.toString(),
          updatedAt: new Date()
        };
        
        console.log(`تم خصم ${deductionAmount} ر.س من راتب الموظف ${employeeId}. إجمالي الخصومات الجديد: ${newTotalDeductions} ر.س، الراتب الصافي الجديد: ${newNetSalary} ر.س`);
      }
    } else {
      console.log(`لم يتم العثور على راتب للموظف ${employeeId} لتطبيق الخصم`);
    }
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

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    return {
      totalEmployees: this.employees.length,
      totalDeductions: this.deductions.length,
      totalSales: this.sales.length,
      totalPurchases: this.purchases.length,
      totalClients: this.clients.length,
      totalProducts: this.products.length,
      monthlyDeductions: this.deductions.reduce((sum, d) => sum + parseFloat(d.amount), 0),
      monthlySales: 0,
      monthlyPurchases: 0
    };
  }

  // Suppliers
  async getSupplier(id: number): Promise<Supplier | undefined> { return undefined; }
  getAllSuppliers(): Supplier[] { return []; }
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> { throw new Error("Not implemented"); }
  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> { return undefined; }
  async deleteSupplier(id: number): Promise<boolean> { return false; }

  // Missing voucher methods
  async getAllClientReceiptVouchers(): Promise<any[]> { return []; }
  async getAllSupplierPaymentVouchers(): Promise<any[]> { return []; }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.find(c => c.id === id);
  }

  getAllClients(): Client[] {
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

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  getAllProducts(): Product[] {
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

  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.find(s => s.id === id);
  }

  getAllSales(): Sale[] {
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

  async getPurchase(id: number): Promise<Purchase | undefined> { return undefined; }
  getAllPurchases(): Purchase[] { return []; }
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

  getAllSalaries(): Salary[] { return this.salaries; }
  getSalary(id: number): Salary | undefined { return this.salaries.find(s => s.id === id); }
  createSalary(salary: InsertSalary): Salary { 
    const newSalary: Salary = { id: this.nextId++, ...salary, createdAt: new Date(), updatedAt: new Date() };
    this.salaries.push(newSalary);
    return newSalary;
  }
  updateSalary(id: number, salary: Partial<InsertSalary>): Salary | undefined { 
    const index = this.salaries.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.salaries[index] = { ...this.salaries[index], ...salary, updatedAt: new Date() };
    return this.salaries[index];
  }
  deleteSalary(id: number): boolean { 
    const index = this.salaries.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.salaries.splice(index, 1);
    return true;
  }

  // Debts Management
  async getDebt(id: number): Promise<Debt | undefined> {
    return this.debts.find(d => d.id === id);
  }

  async getAllDebts(): Promise<Debt[]> {
    return this.debts;
  }

  async createDebt(debt: InsertDebt): Promise<Debt> {
    const newDebt: Debt = {
      id: this.nextId++,
      ...debt,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.debts.push(newDebt);
    return newDebt;
  }

  async updateDebt(id: number, debt: Partial<InsertDebt>): Promise<Debt | undefined> {
    const index = this.debts.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    this.debts[index] = {
      ...this.debts[index],
      ...debt,
      updatedAt: new Date()
    };
    return this.debts[index];
  }

  async deleteDebt(id: number): Promise<boolean> {
    const index = this.debts.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.debts.splice(index, 1);
    return true;
  }

  // Debt Payments Management
  async getDebtPayment(id: number): Promise<DebtPayment | undefined> {
    return this.debtPayments.find(dp => dp.id === id);
  }

  async getAllDebtPayments(): Promise<DebtPayment[]> {
    return this.debtPayments;
  }

  async createDebtPayment(payment: InsertDebtPayment): Promise<DebtPayment> {
    const newPayment: DebtPayment = {
      id: this.nextId++,
      ...payment,
      createdAt: new Date()
    };
    this.debtPayments.push(newPayment);
    
    // Update the remaining amount of the debt
    const debt = this.debts.find(d => d.id === payment.debtId);
    if (debt) {
      const remainingAmount = parseFloat(debt.remainingAmount) - parseFloat(payment.amount);
      debt.remainingAmount = remainingAmount.toString();
      debt.updatedAt = new Date();
    }
    
    return newPayment;
  }

  async updateDebtPayment(id: number, payment: Partial<InsertDebtPayment>): Promise<DebtPayment | undefined> {
    const index = this.debtPayments.findIndex(dp => dp.id === id);
    if (index === -1) return undefined;
    this.debtPayments[index] = {
      ...this.debtPayments[index],
      ...payment
    };
    return this.debtPayments[index];
  }

  async deleteDebtPayment(id: number): Promise<boolean> {
    const index = this.debtPayments.findIndex(dp => dp.id === id);
    if (index === -1) return false;
    this.debtPayments.splice(index, 1);
    return true;
  }

  // وظيفة جديدة: خصم مبلغ من ديون الموظف
  async deductFromEmployeeDebt(employeeId: number, amount: number): Promise<void> {
    // البحث عن ديون الموظف النشطة
    const employeeDebts = this.debts.filter(debt => 
      debt.debtorType === 'employee' && 
      debt.debtorId === employeeId && 
      debt.status === 'active' &&
      parseFloat(debt.remainingAmount) > 0
    );

    let remainingAmount = amount;

    // خصم من الديون بترتيب تاريخ الاستحقاق (الأقدم أولاً)
    employeeDebts.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    for (const debt of employeeDebts) {
      if (remainingAmount <= 0) break;

      const debtRemaining = parseFloat(debt.remainingAmount);
      const deductAmount = Math.min(remainingAmount, debtRemaining);

      // تحديث المبلغ المتبقي من الدين
      debt.remainingAmount = (debtRemaining - deductAmount).toString();
      debt.updatedAt = new Date();

      // إذا تم سداد الدين بالكامل، تغيير الحالة
      if (parseFloat(debt.remainingAmount) === 0) {
        debt.status = 'paid';
      }

      // إنشاء سجل دفعة دين
      const debtPayment: DebtPayment = {
        id: this.nextId++,
        debtId: debt.id,
        amount: deductAmount.toString(),
        paymentDate: new Date(),
        paymentMethod: 'deduction',
        notes: `خصم تلقائي من الخصومات - مبلغ ${deductAmount} ر.س`,
        createdAt: new Date()
      };
      this.debtPayments.push(debtPayment);

      remainingAmount -= deductAmount;

      console.log(`تم خصم ${deductAmount} ر.س من دين الموظف ${employeeId} (دين رقم ${debt.id})`);
    }

    if (remainingAmount > 0) {
      console.log(`تبقى مبلغ ${remainingAmount} ر.س لم يتم خصمه لعدم وجود ديون كافية للموظف ${employeeId}`);
    }
  }

  // Methods for Allowances
  getAllAllowances(): Allowance[] {
    return this.allowances;
  }

  createAllowance(allowance: InsertAllowance): Allowance {
    const newAllowance: Allowance = {
      id: this.nextId++,
      ...allowance,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.allowances.push(newAllowance);
    return newAllowance;
  }

  updateAllowance(id: number, data: Partial<InsertAllowance>): Allowance | undefined {
    const index = this.allowances.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    
    this.allowances[index] = {
      ...this.allowances[index],
      ...data,
      updatedAt: new Date()
    };
    return this.allowances[index];
  }

  deleteAllowance(id: number): boolean {
    const index = this.allowances.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    this.allowances.splice(index, 1);
    return true;
  }

  // Methods for Inventory Movements
  getAllInventoryMovements(): InventoryMovement[] {
    return this.inventoryMovements;
  }

  // Methods for updating balances
  async updateClientBalance(clientId: number, amount: number): Promise<void> {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      const currentBalance = parseFloat(client.balance || '0');
      client.balance = (currentBalance + amount).toString();
      client.updatedAt = new Date();
    }
  }

  async updateSupplierBalance(supplierId: number, amount: number): Promise<void> {
    const supplier = this.suppliers.find(s => s.id === supplierId);
    if (supplier) {
      const currentBalance = parseFloat(supplier.balance || '0');
      supplier.balance = (currentBalance + amount).toString();
      supplier.updatedAt = new Date();
    }
  }

  // Methods for inventory transactions
  async processInventoryTransaction(transaction: {
    productId: number;
    quantity: number;
    type: string;
    referenceId: number;
    referenceType: string;
  }): Promise<void> {
    const product = this.products.find(p => p.id === transaction.productId);
    if (product) {
      const currentQuantity = product.quantity || 0;
      product.quantity = Math.max(0, currentQuantity + transaction.quantity);
      
      // Add inventory movement record
      const movement: InventoryMovement = {
        id: this.nextId++,
        productId: transaction.productId,
        productName: product.name || '',
        quantity: Math.abs(transaction.quantity),
        type: transaction.quantity > 0 ? 'in' : 'out',
        referenceType: transaction.referenceType,
        referenceId: transaction.referenceId,
        date: new Date(),
        notes: `${transaction.type} transaction`,
        createdAt: new Date()
      };
      this.inventoryMovements.push(movement);
    }
  }

  async autoRegisterProduct(productId: number, quantity: number, costPrice: number): Promise<void> {
    // This method can be used for automatic product registration if needed
    console.log(`Auto-registering product ${productId} with quantity ${quantity} and cost ${costPrice}`);
  }
}

export const storage = new MemoryStorage();