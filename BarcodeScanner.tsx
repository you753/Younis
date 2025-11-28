import { useRef, useState, useEffect } from 'react';
// @ts-ignore
import Quagga from 'quagga';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
  inline?: boolean;
}

export default function BarcodeScanner({ onScan, onClose, isOpen, inline = false }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const isScanningRef = useRef(false);
  const detectionHandlerRef = useRef<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const { toast } = useToast();

  const startScanning = async () => {
    if (!videoRef.current || isScanningRef.current) {
      console.log('❌ Cannot start scanning:', { hasRef: !!videoRef.current, isScanning: isScanningRef.current });
      return;
    }
    
    console.log('🚀 Starting barcode scanner...');
    setError(null);
    setIsInitializing(true);
    isScanningRef.current = true;
    
    if (detectionHandlerRef.current) {
      Quagga.offDetected(detectionHandlerRef.current);
    }
    
    const handleDetection = (result: any) => {
      if (result && result.codeResult && result.codeResult.code) {
        const code = result.codeResult.code;
        
        if (code === lastScannedCode) return;
        
        setLastScannedCode(code);
        console.log('✅ Barcode detected:', code);
        
        toast({
          title: "✅ تم قراءة الباركود",
          description: `الرمز: ${code}`,
          className: "bg-green-50 border-green-200",
        });
        
        onScan(code);
        stopScanning();
        onClose();
      }
    };
    
    detectionHandlerRef.current = handleDetection;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      console.log('✅ Camera permission granted');
      
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            width: { min: 640, ideal: 1280 },
            height: { min: 480, ideal: 720 },
            facingMode: "environment"
          }
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ],
          debug: {
            drawBoundingBox: true,
            showFrequency: false,
            drawScanline: true,
            showPattern: false
          }
        },
        locate: true,
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        frequency: 10,
        numOfWorkers: 2
      }, (err: any) => {
        if (err) {
          console.error('❌ Quagga init error:', err);
          setError('فشل في تشغيل الكاميرا. تأكد من السماح بالوصول للكاميرا في المتصفح.');
          setIsInitializing(false);
          setIsScanning(false);
          isScanningRef.current = false;
          
          stream.getTracks().forEach(track => track.stop());
          
          toast({
            title: "⚠️ خطأ في الكاميرا",
            description: "تأكد من السماح بالوصول للكاميرا",
            variant: "destructive",
          });
          return;
        }
        
        console.log('✅ Quagga initialized successfully');
        setIsInitializing(false);
        setIsScanning(true);
        Quagga.start();
        Quagga.onDetected(handleDetection);
      });
    } catch (err: any) {
      console.error('❌ Camera access error:', err);
      let errorMessage = 'فشل في الوصول للكاميرا.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'تم رفض الوصول للكاميرا. يرجى السماح بالوصول للكاميرا في إعدادات المتصفح.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'لم يتم العثور على كاميرا. تأكد من توصيل كاميرا بالجهاز.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'الكاميرا مستخدمة من قبل تطبيق آخر.';
      }
      
      setError(errorMessage);
      setIsInitializing(false);
      setIsScanning(false);
      isScanningRef.current = false;
      
      toast({
        title: "⚠️ خطأ في الكاميرا",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (!isScanningRef.current) return;
    
    console.log('🛑 Stopping scanner...');
    
    if (detectionHandlerRef.current) {
      Quagga.offDetected(detectionHandlerRef.current);
      detectionHandlerRef.current = null;
    }
    
    try {
      Quagga.stop();
    } catch (err) {
      console.error('Error stopping Quagga:', err);
    }
    
    setIsScanning(false);
    setIsInitializing(false);
    isScanningRef.current = false;
    setLastScannedCode('');
  };

  useEffect(() => {
    if (isOpen && videoRef.current) {
      const timer = setTimeout(() => {
        startScanning();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  if (!isOpen) return null;

  const ScannerContent = () => (
    <div className="space-y-4">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-xl" style={{ height: '400px' }}>
        <div 
          ref={videoRef} 
          id="barcode-scanner" 
          className="w-full h-full"
          style={{ position: 'relative', height: '100%' }}
        />
        
        {isScanning && !error && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent shadow-lg shadow-green-500/50 animate-scan-line" 
                 style={{
                   top: '50%',
                   boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)'
                 }}
            />
            
            <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
            <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
            
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <div className="inline-flex items-center gap-2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
                <Camera className="w-4 h-4 animate-pulse" />
                ✨ وجّه الكاميرا نحو الباركود
              </div>
            </div>
          </div>
        )}
        
        {isInitializing && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-10">
            <div className="text-center text-white">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-green-200 opacity-25"></div>
                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-base font-medium">جاري تشغيل الكاميرا...</p>
              <p className="text-xs text-gray-400 mt-2">يرجى السماح بالوصول للكاميرا</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-900 font-medium text-sm">{error}</p>
              <p className="text-red-700 text-xs mt-1">
                تأكد من إعطاء إذن الكاميرا في المتصفح (عادة يظهر في شريط العنوان)
              </p>
            </div>
          </div>
          <Button 
            onClick={startScanning} 
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Camera className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </div>
      )}

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => {
            stopScanning();
            onClose();
          }}
          className="px-8 border-2"
        >
          <X className="w-4 h-4 ml-2" />
          إغلاق
        </Button>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { top: 10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        #barcode-scanner {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
          background-color: #000 !important;
        }
        #barcode-scanner video {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
          z-index: 1 !important;
          background-color: #000 !important;
        }
        #barcode-scanner canvas {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 2 !important;
          pointer-events: none !important;
        }
        #barcode-scanner canvas.drawingBuffer {
          opacity: 0.6 !important;
        }
      `}</style>
    </div>
  );

  if (inline) {
    return <ScannerContent />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="w-5 h-5 text-blue-600" />
            قارئ الباركود المباشر
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => {
            stopScanning();
            onClose();
          }}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <ScannerContent />
        </CardContent>
      </Card>
    </div>
  );
}
