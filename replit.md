# Sistema de Contabilidade Comercial - نظام المحاسبة التجارية

## Overview

This project is a comprehensive Arabic commercial accounting system designed for complete business management. It integrates sales, purchases, inventory, client and supplier management, employee functions, and multi-branch financial reporting. The system aims to provide a modern, full-stack solution for efficient business operations in the commercial sector, offering a robust solution for businesses to manage their finances and operations effectively.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS with custom Arabic-focused design system, Radix UI primitives, shadcn/ui
- **State Management**: Zustand, TanStack Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Internationalization**: Right-to-left (RTL) support with Arabic locale
- **UI/UX Decisions**: Arabic-first design, professional and minimalist aesthetic, searchable Combobox, redesigned horizontal top navigation, professional Delete System, auto-generated document numbers, smart invoice return, and black & white printable reports for branches.

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with session-based authentication
- **Database ORM**: Drizzle ORM
- **API Design**: RESTful API with TypeScript interfaces
- **Authentication**: Professional login system with session-based authentication
- **Multi-Tenant Architecture**: Comprehensive data isolation system where each user has completely separate data (clients, suppliers, products, sales, purchases, branches). All API endpoints filter by `user_id` to ensure zero data leakage between tenants

### Database Strategy
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe operations (with direct `pool.query` for complex JSON fields and branch inventory filtering)
- **Schema Management**: Centralized schema definitions
- **Migrations**: Drizzle Kit
- **Multi-Tenant Data Isolation**: All critical tables include `user_id` foreign key (clients, suppliers, products, sales, purchases, quotes, sales_returns, purchase_returns, purchase_orders, supplier_payment_vouchers). All GET endpoints filter by `user_id`, all POST endpoints insert `user_id`, and all PUT/DELETE endpoints validate ownership before modifying data
- **Implementation Note**: Direct PostgreSQL queries are used for sales invoices and products API to ensure data consistency and avoid SQL syntax errors. All purchase data is persistently stored in PostgreSQL

### Core Business Modules & Features
- **Sales Management**: Quotes, invoices, returns, POS, automatic inventory updates, manual client account posting with tracking and duplicate prevention.
- **Purchase Management**: Orders, goods receipt, supplier payments, automatic inventory/balance updates, branch-specific invoice display, comprehensive purchase reports with Gregorian dates, and manual supplier account posting for credit purchases.
- **Inventory Management**: Stock tracking, professional inventory transfer system between branches with real-time search, multi-item selection, quantity validation, and API integration. Barcode system and automatic synchronization. Comprehensive inventory transfers reporting system.
- **Client & Supplier Management**: Account management, credit limits, **client receipt vouchers with SQL JOIN for client names**, comprehensive statements (live client and professional supplier statements), Excel import/export.
- **Employee Management**: HR functions, attendance, holidays, allowances, salaries, and integrated salary-debt system.
- **Financial Accounting**: Chart of accounts, journal entries, and comprehensive financial reports.
- **Multi-Branch Operations**: Complete branch inventory isolation, branch-specific data isolation for suppliers, clients, products, categories, and supplier payment vouchers. Consolidated reporting and dedicated management interface. Professional calculator, branch receipt and supplier payment vouchers. Real-time financial dashboard with complete branch display, dynamic date filtering, and branch management (CRUD operations fully migrated to PostgreSQL). **Comprehensive cascading delete system** that safely removes all branch-related data in correct order: branch transfers, sale items, sales (branch & main), supplier payments, purchase orders, goods receipts, purchases, branch products, product categories, products, receipt vouchers, clients, suppliers, and **branch permissions**. **Branch permissions system** enables/disables branch sections (products, sales, purchases, inventory, clients, suppliers, employees, expenses) with visual lock screen for 8 main sections + 39 subsections, loading state protection, and centralized management UI accessible from main branch management page via Settings button for each branch.
- **AI Integration**: OpenAI-powered chat assistant (GPT-4o) and Arabic voice-to-text (Whisper).
- **Data Operations**: Excel import/export, PDF generation with Arabic support.
- **System Settings**: Dynamic company information, user management, backup settings.
- **User Profile**: Simple and professional profile page.
- **System Design Choices**: Comprehensive transaction reversal, automatic inventory updates, unified balance system, dynamic company information, anonymity in printed documents for branches, unified inventory quantity management, purchase invoice display with quantity tracking, manual sales invoice posting system, and **client receipt vouchers with optimized data loading** (SQL JOIN for client names to avoid "undefined client" display issues).

## External Dependencies

- **React Ecosystem**: React, React DOM, React Hook Form
- **UI Framework**: Radix UI, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Neon Database)
- **State Management**: TanStack Query, Zustand
- **Validation**: Zod
- **Authentication**: `express-session`, `connect-pg-simple`
- **AI Services**: OpenAI API (GPT-4o, Whisper)
- **Email Service**: SendGrid
- **Charting**: Recharts
- **PDF Generation**: jsPDF
- **Image/Barcode**: Multer, JsBarcode, Quagga, html2canvas
- **Data Export**: SheetJS