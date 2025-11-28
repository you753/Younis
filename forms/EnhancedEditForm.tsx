import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'date';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

interface EnhancedEditFormProps {
  title: string;
  apiEndpoint: string;
  itemId?: number | null;
  fields: FormField[];
  schema: any;
  defaultValues: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EnhancedEditForm({
  title,
  apiEndpoint,
  itemId,
  fields,
  schema,
  defaultValues,
  onSuccess,
  onCancel
}: EnhancedEditFormProps) {
  const { success, error } = useNotification();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing data if editing
  const { data: existingData, isLoading } = useQuery({
    queryKey: [apiEndpoint, itemId],
    queryFn: async () => {
      if (!itemId) return null;
      const response = await fetch(`${apiEndpoint}/${itemId}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    },
    enabled: !!itemId
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues
  });

  // Update form when data loads
  useEffect(() => {
    if (existingData) {
      const formData: any = {};
      fields.forEach(field => {
        const value = existingData[field.name];
        formData[field.name] = value !== null && value !== undefined ? value : 
          (field.type === 'number' ? 0 : '');
      });
      form.reset(formData);
    }
  }, [existingData, form, fields]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      const method = itemId ? 'PUT' : 'POST';
      const url = itemId ? `${apiEndpoint}/${itemId}` : apiEndpoint;
      
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      success(itemId ? 'تم تحديث البيانات بنجاح' : 'تم إضافة البيانات بنجاح');
      
      if (!itemId) {
        form.reset();
      }
      
      if (onSuccess) {
        onSuccess();
      }
      setIsSubmitting(false);
    },
    onError: (err: any) => {
      error(`حدث خطأ: ${err.message || 'فشل في حفظ البيانات'}`);
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const renderField = (field: FormField) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {field.type === 'textarea' ? (
                <Textarea
                  placeholder={field.placeholder}
                  {...formField}
                  value={formField.value || ''}
                />
              ) : field.type === 'select' ? (
                <Select 
                  onValueChange={formField.onChange} 
                  value={formField.value || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...formField}
                  value={formField.value || ''}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  if (isLoading && itemId) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          {title} {itemId ? '- تعديل' : '- إضافة جديد'}
        </h3>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} type="button">
            <X className="h-4 w-4 mr-2" />
            إلغاء
          </Button>
        )}
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(renderField)}
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'جاري الحفظ...' : (itemId ? 'تحديث' : 'حفظ')}
            </Button>
            
            {!itemId && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                مسح الحقول
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}