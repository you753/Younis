import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Settings } from 'lucide-react';

interface BranchProductEditButtonProps {
  productId: number;
  productName: string;
  onEdit: (productId: number) => void;
}

export default function BranchProductEditButton({ 
  productId, 
  productName, 
  onEdit 
}: BranchProductEditButtonProps) {
  const handleEdit = () => {
    console.log('تم الضغط على زر التعديل الذهبي!', productId);
    
    // تشغيل دالة التعديل
    onEdit(productId);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEdit}
      className="hover:bg-gray-50"
      title={`تعديل ${productName}`}
    >
      <Edit3 className="h-4 w-4" />
    </Button>
  );
}