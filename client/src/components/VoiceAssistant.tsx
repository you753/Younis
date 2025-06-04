import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Square, Play, Pause, Volume2, FileText, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface VoiceNote {
  id: string;
  audioBlob: Blob;
  transcript: string;
  analysis: {
    category: string;
    priority: 'low' | 'medium' | 'high';
    amount?: number;
    currency?: string;
    entities: string[];
    summary: string;
  };
  timestamp: Date;
  duration: number;
}

interface VoiceAssistantProps {
  onNoteAdded?: (note: VoiceNote) => void;
}

export default function VoiceAssistant({ onNoteAdded }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer for recording duration
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "بدء التسجيل",
        description: "يتم الآن تسجيل ملاحظتك الصوتية...",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "خطأ في التسجيل",
        description: "لا يمكن الوصول إلى الميكروفون. تأكد من السماح بالوصول.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isRecording]);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert audio to base64 for API request
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await apiRequest('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      const { transcript, analysis } = response;

      const newNote: VoiceNote = {
        id: Date.now().toString(),
        audioBlob,
        transcript,
        analysis,
        timestamp: new Date(),
        duration: recordingTime,
      };

      setVoiceNotes(prev => [newNote, ...prev]);
      onNoteAdded?.(newNote);

      toast({
        title: "تم معالجة الملاحظة",
        description: `تم تحويل الصوت إلى نص وتحليله كملاحظة ${analysis.category}`,
      });

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "خطأ في المعالجة",
        description: "حدث خطأ أثناء معالجة التسجيل الصوتي",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [recordingTime, onNoteAdded, toast]);

  const playAudio = useCallback((noteId: string, audioBlob: Blob) => {
    if (isPlaying === noteId) {
      setIsPlaying(null);
      return;
    }

    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
    setIsPlaying(noteId);

    audio.onended = () => {
      setIsPlaying(null);
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'مبيعات':
      case 'إيرادات':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'مصروفات':
      case 'تكاليف':
        return <DollarSign className="h-4 w-4 text-red-600" />;
      case 'تذكير':
      case 'مهمة':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            المساعد الصوتي للملاحظات المالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  size="lg"
                >
                  <Mic className="ml-2 h-5 w-5" />
                  بدء التسجيل
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                  size="lg"
                >
                  <Square className="ml-2 h-4 w-4" />
                  إيقاف التسجيل
                </Button>
              )}
            </div>

            {isRecording && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">جاري التسجيل... تحدث بوضوح</p>
              </div>
            )}

            {isProcessing && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">جاري معالجة التسجيل وتحليل المحتوى...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Notes List */}
      {voiceNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right">الملاحظات الصوتية ({voiceNotes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {voiceNotes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(note.id, note.audioBlob)}
                      >
                        {isPlaying === note.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="text-sm text-gray-600">
                        {formatTime(note.duration)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(note.analysis.category)}
                      <Badge className={getPriorityColor(note.analysis.priority)}>
                        {note.analysis.priority === 'high' ? 'عالية' : 
                         note.analysis.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {note.timestamp.toLocaleString('ar-SA')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">النص المحول:</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">{note.transcript}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">التحليل:</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{note.analysis.category}</Badge>
                        {note.analysis.amount && (
                          <Badge variant="outline">
                            {note.analysis.amount} {note.analysis.currency || 'ر.س'}
                          </Badge>
                        )}
                        {note.analysis.entities.map((entity, index) => (
                          <Badge key={index} variant="secondary">{entity}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{note.analysis.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}