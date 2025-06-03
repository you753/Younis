import { useAppStore } from '@/lib/store';
import UserForm from '@/components/forms/UserForm';
import UsersTable from '@/components/tables/UsersTable';
import { useEffect } from 'react';

export default function Users() {
  const { setCurrentPage } = useAppStore();

  useEffect(() => {
    setCurrentPage('إدارة المستخدمين');
  }, [setCurrentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة المستخدمين</h2>
        <p className="text-gray-600">إضافة وإدارة مستخدمي النظام وصلاحياتهم</p>
      </div>

      {/* Add User Form */}
      <UserForm />

      {/* Users Table */}
      <UsersTable />
    </div>
  );
}
