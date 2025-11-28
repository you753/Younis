import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, Star, TrendingUp, Target, Award, BarChart3,
  Edit, Trash2, Search, User, Calendar
} from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for performance evaluation
const performanceSchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  evaluationDate: z.string().min(1, 'يجب تحديد تاريخ التقييم'),
  period: z.enum(['monthly', 'quarterly', 'annual']),
  overallRating: z.number().min(1).max(5),
  productivity: z.number().min(1).max(5),
  quality: z.number().min(1).max(5),
  teamwork: z.number().min(1).max(5),
  punctuality: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  goals: z.string().optional(),
  achievements: z.string().optional(),
  improvementAreas: z.string().optional(),
  comments: z.string().optional(),
});

type PerformanceForm = z.infer<typeof performanceSchema>;

const getRatingBadge = (rating: number) => {
  if (rating >= 4.5) return <Badge className="bg-green-100 text-green-800">ممتاز</Badge>;
  if (rating >= 3.5) return <Badge className="bg-blue-100 text-blue-800">جيد جداً</Badge>;
  if (rating >= 2.5) return <Badge className="bg-yellow-100 text-yellow-800">جيد</Badge>;
  if (rating >= 1.5) return <Badge className="bg-orange-100 text-orange-800">مقبول</Badge>;
  return <Badge className="bg-red-100 text-red-800">ضعيف</Badge>;
};

const getPeriodBadge = (period: string) => {
  const periodConfig = {
    monthly: { label: 'شهري', color: 'bg-blue-100 text-blue-800' },
    quarterly: { label: 'ربع سنوي', color: 'bg-purple-100 text-purple-800' },
    annual: { label: 'سنوي', color: 'bg-green-100 text-green-800' }
  };
  
  const config = periodConfig[period as keyof typeof periodConfig] || periodConfig.monthly;
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default function Performance() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('تقييم الأداء');
  }, [setCurrentPage]);

  const form = useForm<PerformanceForm>({
    resolver: zodResolver(performanceSchema),
    defaultValues: {
      employeeId: 0,
      evaluationDate: new Date().toISOString().split('T')[0],
      period: 'monthly',
      overallRating: 3,
      productivity: 3,
      quality: 3,
      teamwork: 3,
      punctuality: 3,
      communication: 3,
      goals: '',
      achievements: '',
      improvementAreas: '',
      comments: '',
    }
  });

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/employees');
      return response.json();
    }
  });

  // Fetch performance evaluations
  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['/api/performance'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/performance');
      return response.json();
    }
  });

  // Create/Update performance mutation
  const performanceMutation = useMutation({
    mutationFn: async (data: PerformanceForm) => {
      if (editingPerformance) {
        const response = await apiRequest('PUT', `/api/performance/${editingPerformance.id}`, data);
        return response.json();
      }
      const response = await apiRequest('POST', '/api/performance', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/performance'] });
      setShowForm(false);
      setEditingPerformance(null);
      form.reset();
      toast({
        title: "تم الحفظ بنجاح",
        description: editingPerformance ? "تم تحديث تقييم الأداء" : "تم إضافة تقييم أداء جديد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحفظ",
        variant: "destructive"
      });
    }
  });

  // Delete performance mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/performance/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/performance'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف تقييم الأداء بنجاح",
      });
    }
  });

  const onSubmit = (data: PerformanceForm) => {
    performanceMutation.mutate(data);
  };

  const handleEdit = (evaluation: any) => {
    setEditingPerformance(evaluation);
    form.reset({
      employeeId: evaluation.employeeId,
      evaluationDate: evaluation.evaluationDate.split('T')[0],
      period: evaluation.period,
      overallRating: evaluation.overallRating,
      productivity: evaluation.productivity,
      quality: evaluation.quality,
      teamwork: evaluation.teamwork,
      punctuality: evaluation.punctuality,
      communication: evaluation.communication,
      goals: evaluation.goals || '',
      achievements: evaluation.achievements || '',
      improvementAreas: evaluation.improvementAreas || '',
      comments: evaluation.comments || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewEvaluation = () => {
    setEditingPerformance(null);
    form.reset({
      employeeId: 0,
      evaluationDate: new Date().toISOString().split('T')[0],
      period: 'monthly',
      overallRating: 3,
      productivity: 3,
      quality: 3,
      teamwork: 3,
      punctuality: 3,
      communication: 3,
      goals: '',
      achievements: '',
      improvementAreas: '',
      comments: '',
    });
    setShowForm(true);
  };

  // Filter evaluations
  const filteredEvaluations = evaluations?.filter((evaluation: any) => {
    const employee = employees?.find((emp: any) => emp.id === evaluation.employeeId);
    const employeeNameMatch = employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const employeeFilterMatch = selectedEmployee ? evaluation.employeeId.toString() === selectedEmployee : true;
    const periodFilterMatch = selectedPeriod ? evaluation.period === selectedPeriod : true;
    
    return employeeNameMatch && employeeFilterMatch && periodFilterMatch;
  }) || [];

  // Calculate statistics
  const stats = {
    totalEvaluations: evaluations?.length || 0,
    averageRating: evaluations?.length ? 
      (evaluations.reduce((sum: number, e: any) => sum + e.overallRating, 0) / evaluations.length).toFixed(1) : 
      '0.0',
    excellentPerformers: evaluations?.filter((e: any) => e.overallRating >= 4.5).length || 0,
    needImprovement: evaluations?.filter((e: any) => e.overallRating < 2.5).length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">تقييم الأداء</h1>
            <p className="text-gray-600">إدارة تقييمات أداء الموظفين وتتبع التطور</p>
          </div>
          <Button onClick={handleNewEvaluation} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 ml-2" />
            تقييم جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي التقييمات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalEvaluations}</div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <BarChart3 className="h-4 w-4 ml-1" />
                تقييم مكتمل
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">متوسط التقييم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.averageRating}</div>
              <div className="flex items-center text-sm text-blue-600 mt-1">
                <Star className="h-4 w-4 ml-1" />
                من 5 نجوم
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">أداء ممتاز</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.excellentPerformers}</div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <Award className="h-4 w-4 ml-1" />
                موظف متميز
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">يحتاج تحسين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{stats.needImprovement}</div>
              <div className="flex items-center text-sm text-red-600 mt-1">
                <Target className="h-4 w-4 ml-1" />
                موظف بحاجة للتطوير
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <SearchBox
                  placeholder="البحث في التقييمات..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="flex-1"
                />
              </div>
              
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب الموظف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الموظفين</SelectItem>
                  {employees?.map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الفترات</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  <SelectItem value="annual">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Performance Table */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">تقييمات الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredEvaluations.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تقييمات</h3>
                <p className="text-gray-500">ابدأ بإضافة تقييم أداء جديد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">الفترة</TableHead>
                      <TableHead className="text-right">تاريخ التقييم</TableHead>
                      <TableHead className="text-right">التقييم العام</TableHead>
                      <TableHead className="text-right">الإنتاجية</TableHead>
                      <TableHead className="text-right">الجودة</TableHead>
                      <TableHead className="text-right">العمل الجماعي</TableHead>
                      <TableHead className="text-right">الالتزام</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvaluations.map((evaluation: any) => {
                      const employee = employees?.find((emp: any) => emp.id === evaluation.employeeId);
                      
                      return (
                        <TableRow key={evaluation.id}>
                          <TableCell className="font-medium">{employee?.name || 'غير محدد'}</TableCell>
                          <TableCell>{getPeriodBadge(evaluation.period)}</TableCell>
                          <TableCell>{new Date(evaluation.evaluationDate).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StarRating rating={evaluation.overallRating} />
                              <span className="text-sm font-medium">{evaluation.overallRating}/5</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StarRating rating={evaluation.productivity} />
                          </TableCell>
                          <TableCell>
                            <StarRating rating={evaluation.quality} />
                          </TableCell>
                          <TableCell>
                            <StarRating rating={evaluation.teamwork} />
                          </TableCell>
                          <TableCell>
                            <StarRating rating={evaluation.punctuality} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(evaluation)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(evaluation.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Performance Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPerformance ? 'تعديل تقييم الأداء' : 'إضافة تقييم أداء جديد'}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموظف *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الموظف" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees?.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evaluationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ التقييم *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>فترة التقييم *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر فترة التقييم" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">شهري</SelectItem>
                          <SelectItem value="quarterly">ربع سنوي</SelectItem>
                          <SelectItem value="annual">سنوي</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rating Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">معايير التقييم</h3>
                  
                  <FormField
                    control={form.control}
                    name="overallRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التقييم العام (1-5)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              max={5}
                              min={1}
                              step={0.5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>ضعيف (1)</span>
                              <span className="font-medium">القيمة: {field.value}</span>
                              <span>ممتاز (5)</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="productivity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الإنتاجية</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={5}
                                min={1}
                                step={0.5}
                                className="w-full"
                              />
                              <div className="text-center text-sm font-medium">{field.value}/5</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>جودة العمل</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={5}
                                min={1}
                                step={0.5}
                                className="w-full"
                              />
                              <div className="text-center text-sm font-medium">{field.value}/5</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamwork"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العمل الجماعي</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={5}
                                min={1}
                                step={0.5}
                                className="w-full"
                              />
                              <div className="text-center text-sm font-medium">{field.value}/5</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="punctuality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الالتزام بالمواعيد</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={5}
                                min={1}
                                step={0.5}
                                className="w-full"
                              />
                              <div className="text-center text-sm font-medium">{field.value}/5</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="communication"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مهارات التواصل</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              max={5}
                              min={1}
                              step={0.5}
                              className="w-full"
                            />
                            <div className="text-center text-sm font-medium">{field.value}/5</div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">التفاصيل والملاحظات</h3>
                  
                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الأهداف المحققة</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="اذكر الأهداف التي حققها الموظف..." rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="achievements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الإنجازات البارزة</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="اذكر الإنجازات المميزة للموظف..." rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="improvementAreas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مجالات التحسين</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="اذكر المجالات التي تحتاج للتطوير..." rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات إضافية</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="أي ملاحظات أو توصيات إضافية..." rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={performanceMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {performanceMutation.isPending ? 'جاري الحفظ...' : 'حفظ التقييم'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}