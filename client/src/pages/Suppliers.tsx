import { useAppStore } from '@/lib/store';
import SupplierForm from '@/components/forms/SupplierForm';
import SuppliersTable from '@/components/tables/SuppliersTable';
import { useEffect } from 'react';

export default function Suppliers() {
  const { setCurrentPage } = useAppStore();

  useEffect(() => {
    setCurrentPage('إدارة الموردين');
  }, [setCurrentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الموردين</h2>
        <p className="text-gray-600">إضافة وإدارة معلومات الموردين وحساباتهم</p>
      </div>

      {/* Add Supplier Form */}
      <SupplierForm />

      {/* Suppliers Table */}
      <SuppliersTable />
    </div>
  );
}
