import { useAppStore } from '@/lib/store';
import ClientForm from '@/components/forms/ClientForm';
import ClientsTable from '@/components/tables/ClientsTable';
import { useEffect } from 'react';

export default function Clients() {
  const { setCurrentPage } = useAppStore();

  useEffect(() => {
    setCurrentPage('إدارة العملاء');
  }, [setCurrentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة العملاء</h2>
        <p className="text-gray-600">إضافة وإدارة معلومات العملاء ومجموعاتهم</p>
      </div>

      {/* Add Client Form */}
      <ClientForm />

      {/* Clients Table */}
      <ClientsTable />
    </div>
  );
}
