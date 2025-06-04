import { 
  users, suppliers, clients, products, sales, purchases, employees, deductions, salaries,
  type User, type InsertUser,
  type Supplier, type InsertSupplier,
  type Client, type InsertClient,
  type Product, type InsertProduct,
  type Sale, type InsertSale,
  type Purchase, type InsertPurchase,
  type Employee, type InsertEmployee,
  type Deduction, type InsertDeduction,
  type Salary, type InsertSalary
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

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

  // Purchases
  getPurchase(id: number): Promise<Purchase | undefined>;
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
  createDeduction(deduction: InsertDeduction): Promise<Deduction>;
  updateDeduction(id: number, deduction: Partial<InsertDeduction>): Promise<Deduction | undefined>;
  deleteDeduction(id: number): Promise<boolean>;

  // Salaries
  getSalary(id: number): Promise<Salary | undefined>;
  getAllSalaries(): Promise<Salary[]>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined>;
  deleteSalary(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalClients: number;
    totalSales: string;
    totalPurchases: string;
    inventoryValue: string;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private suppliers: Map<number, Supplier> = new Map();
  private clients: Map<number, Client> = new Map();
  private products: Map<number, Product> = new Map();
  private sales: Map<number, Sale> = new Map();
  private purchases: Map<number, Purchase> = new Map();
  private employees: Map<number, Employee> = new Map();
  private deductions: Map<number, Deduction> = new Map();
  private salaries: Map<number, Salary> = new Map();
  private currentId = 1;

  constructor() {
    // Initialize with default admin user
    this.createUser({
      username: "admin",
      email: "admin@system.com",
      password: "admin123",
      role: "admin"
    });

    // Add sample products with barcodes for testing
    this.createProduct({
      name: "لابتوب ديل XPS 13",
      code: "LAP001",
      barcode: "1234567890123",
      category: "إلكترونيات",
      description: "لابتوب محمول عالي الأداء",
      purchasePrice: "3500.00",
      salePrice: "4200.00",
      quantity: 15,
      minQuantity: 5
    });

    this.createProduct({
      name: "ماوس لاسلكي لوجيتك",
      code: "MOU001", 
      barcode: "9876543210987",
      category: "ملحقات",
      description: "ماوس لاسلكي بتقنية البلوتوث",
      purchasePrice: "75.00",
      salePrice: "120.00",
      quantity: 50,
      minQuantity: 10
    });

    this.createProduct({
      name: "كيبورد ميكانيكي",
      code: "KEY001",
      barcode: "5555666677778",
      category: "ملحقات",
      description: "كيبورد ميكانيكي للألعاب",
      purchasePrice: "250.00",
      salePrice: "380.00",
      quantity: 25,
      minQuantity: 5
    });

    this.createProduct({
      name: "شاشة سامسونج 27 بوصة",
      code: "MON001",
      barcode: "4444333322221",
      category: "إلكترونيات",
      description: "شاشة LED عالية الدقة",
      purchasePrice: "800.00",
      salePrice: "1150.00",
      quantity: 8,
      minQuantity: 3
    });

    this.createProduct({
      name: "سماعات بلوتوث",
      code: "AUD001",
      barcode: "7777888899990",
      category: "صوتيات",
      description: "سماعات لاسلكية عالية الجودة",
      purchasePrice: "150.00",
      salePrice: "220.00",
      quantity: 30,
      minQuantity: 8
    });
  }

  private nextId(): number {
    return this.currentId++;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextId();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Suppliers
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = this.nextId();
    const supplier: Supplier = {
      ...insertSupplier,
      id,
      balance: "0",
      createdAt: new Date()
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: number, updateData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const updatedSupplier = { ...supplier, ...updateData };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.nextId();
    const client: Client = {
      ...insertClient,
      id,
      balance: "0",
      createdAt: new Date()
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...updateData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.nextId();
    const product: Product = {
      ...insertProduct,
      id,
      quantity: insertProduct.quantity || 0,
      minQuantity: insertProduct.minQuantity || 0,
      createdAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updateData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Sales
  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async getAllSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = this.nextId();
    const sale: Sale = {
      ...insertSale,
      id,
      date: new Date()
    };
    this.sales.set(id, sale);
    return sale;
  }

  // Purchases
  async getPurchase(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchases.values());
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = this.nextId();
    const purchase: Purchase = {
      ...insertPurchase,
      id,
      date: new Date()
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  // Employees
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.nextId();
    const employee: Employee = {
      ...insertEmployee,
      id,
      createdAt: new Date()
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: number, updateData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updatedEmployee = { ...employee, ...updateData };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Deductions
  async getDeduction(id: number): Promise<Deduction | undefined> {
    return this.deductions.get(id);
  }

  async getAllDeductions(): Promise<Deduction[]> {
    return Array.from(this.deductions.values());
  }

  async createDeduction(insertDeduction: InsertDeduction): Promise<Deduction> {
    const id = this.nextId();
    const deduction: Deduction = {
      ...insertDeduction,
      id,
      createdAt: new Date()
    };
    this.deductions.set(id, deduction);
    return deduction;
  }

  async updateDeduction(id: number, updateData: Partial<InsertDeduction>): Promise<Deduction | undefined> {
    const deduction = this.deductions.get(id);
    if (!deduction) return undefined;
    
    const updatedDeduction = { ...deduction, ...updateData };
    this.deductions.set(id, updatedDeduction);
    return updatedDeduction;
  }

  async deleteDeduction(id: number): Promise<boolean> {
    return this.deductions.delete(id);
  }

  // Salaries
  async getSalary(id: number): Promise<Salary | undefined> {
    return this.salaries.get(id);
  }

  async getAllSalaries(): Promise<Salary[]> {
    return Array.from(this.salaries.values());
  }

  async createSalary(insertSalary: InsertSalary): Promise<Salary> {
    const id = this.nextId();
    const salary: Salary = {
      ...insertSalary,
      id,
      createdAt: new Date()
    };
    this.salaries.set(id, salary);
    return salary;
  }

  async updateSalary(id: number, updateData: Partial<InsertSalary>): Promise<Salary | undefined> {
    const salary = this.salaries.get(id);
    if (!salary) return undefined;
    
    const updatedSalary = { ...salary, ...updateData };
    this.salaries.set(id, updatedSalary);
    return updatedSalary;
  }

  async deleteSalary(id: number): Promise<boolean> {
    return this.salaries.delete(id);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalClients: number;
    totalSales: string;
    totalPurchases: string;
    inventoryValue: string;
  }> {
    const totalClients = this.clients.size;
    
    const totalSalesAmount = Array.from(this.sales.values())
      .reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    
    const totalPurchasesAmount = Array.from(this.purchases.values())
      .reduce((sum, purchase) => sum + parseFloat(purchase.total), 0);
    
    const inventoryValue = Array.from(this.products.values())
      .reduce((sum, product) => sum + (parseFloat(product.salePrice) * (product.quantity || 0)), 0);

    return {
      totalClients,
      totalSales: totalSalesAmount.toFixed(2),
      totalPurchases: totalPurchasesAmount.toFixed(2),
      inventoryValue: inventoryValue.toFixed(2)
    };
  }
}

export const storage = new MemStorage();
