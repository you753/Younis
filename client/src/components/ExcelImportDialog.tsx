import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  instructions: string;
  apiEndpoint: string;
  templateData: any[];
  templateName: string;
  onSuccess: () => void;
}

export default function ExcelImportDialog({
  open,
  onOpenChange,
  title,
  instructions,
  apiEndpoint,
  templateData,
  templateName,
  onSuccess
}: ExcelImportDialogProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف Excel أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    const formData = new FormData();
    formData.append('excel', selectedFile);

    try {
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل في استيراد الملف');
      }

      setImportResults(result);
      onSuccess();

      toast({
        title: "تم الاستيراد بنجاح",
        description: result.message,
      });

    } catch (error) {
      console.error('Error importing Excel:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء استيراد الملف',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    onOpenChange(false);
    setSelectedFile(null);
    setImportProgress(0);
    setImportResults(null);
    setIsImporting(false);
  };

  const downloadExcelTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات');
    
    const colWidths = Array(Object.keys(templateData[0]).length).fill({ width: 20 });
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, templateName);
  };

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!importResults && !isImporting && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{instructions}</AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <Button 
                  onClick={downloadExcelTemplate}
                  variant="outline"
                  className="text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  <Download className="ml-2 h-4 w-4" />
                  تحميل نموذج Excel
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="excel-upload"
                    />
                    <label
                      htmlFor="excel-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      اختر ملف Excel
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="text-sm text-gray-600">
                      الملف المحدد: <span className="font-medium">{selectedFile.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {isImporting && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900 mb-2">جاري الاستيراد...</div>
                <Progress value={importProgress} className="w-full" />
                <div className="text-sm text-gray-500 mt-2">{importProgress}%</div>
              </div>
            </div>
          )}

          {importResults && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">تم الاستيراد بنجاح</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{importResults.results.total}</div>
                    <div className="text-sm text-gray-600">إجمالي الصفوف</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{importResults.results.success}</div>
                    <div className="text-sm text-gray-600">تم بنجاح</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{importResults.results.failed}</div>
                    <div className="text-sm text-gray-600">فشل</div>
                  </div>
                </div>
              </div>

              {importResults.results.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">الأخطاء:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResults.results.errors.map((error: string, index: number) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetDialog} disabled={isImporting}>
              {importResults ? 'إغلاق' : 'إلغاء'}
            </Button>
            {!importResults && !isImporting && (
              <Button 
                onClick={handleImportExcel}
                disabled={!selectedFile || isImporting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="ml-2 h-4 w-4" />
                بدء الاستيراد
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}