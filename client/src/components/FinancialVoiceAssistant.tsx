import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Pause, Trash2, Download, FileText, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FinancialNote {
  id: string;
  audioBlob: Blob;
  transcript: string;
  analysis: {
    category: 'income' | 'expense' | 'investment' | 'debt' | 'budget' | 'general';
    priority: 'low' | 'medium' | 'high';
    amount?: number;
    currency?: string;
    entities: string[];
    summary: string;
    actionItems: string[];
    tags: string[];
  };
  timestamp: Date;
  duration: number;
}

export default function FinancialVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState<FinancialNote[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('فشل في الوصول إلى الميكروفون. تأكد من السماح بالوصول.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [isRecording]);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل في معالجة التسجيل الصوتي');
      }

      const result = await response.json();
      
      const newNote: FinancialNote = {
        id: Date.now().toString(),
        audioBlob,
        transcript: result.transcript || 'لم يتم التعرف على النص',
        analysis: result.analysis || {
          category: 'general',
          priority: 'medium',
          entities: [],
          summary: 'ملاحظة مالية',
          actionItems: [],
          tags: []
        },
        timestamp: new Date(),
        duration: result.duration || 0,
      };

      setNotes(prev => [newNote, ...prev]);
    } catch (error) {
      console.error('Error processing audio:', error);
      setError('فشل في معالجة التسجيل الصوتي. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const playAudio = useCallback((noteId: string, audioBlob: Blob) => {
    if (currentlyPlaying === noteId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(URL.createObjectURL(audioBlob));
    audioRef.current = audio;
    
    audio.onended = () => setCurrentlyPlaying(null);
    audio.play();
    setCurrentlyPlaying(noteId);
  }, [currentlyPlaying]);

  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  }, []);

  const exportNotes = useCallback(() => {
    const exportData = notes.map(note => ({
      timestamp: note.timestamp.toISOString(),
      transcript: note.transcript,
      category: note.analysis.category,
      priority: note.analysis.priority,
      amount: note.analysis.amount,
      currency: note.analysis.currency,
      summary: note.analysis.summary,
      actionItems: note.analysis.actionItems,
      tags: note.analysis.tags,
      entities: note.analysis.entities
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-notes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'income': return '💰';
      case 'expense': return '💸';
      case 'investment': return '📈';
      case 'debt': return '💳';
      case 'budget': return '📊';
      default: return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'income': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-red-100 text-red-800';
      case 'investment': return 'bg-blue-100 text-blue-800';
      case 'debt': return 'bg-orange-100 text-orange-800';
      case 'budget': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="rounded-full h-12 w-12 shadow-lg bg-purple-600 hover:bg-purple-700"
        size="sm"
      >
        <Mic className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Card className="w-80 shadow-xl absolute bottom-0 right-0 max-h-96">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              مساعد الملاحظات المالية
            </CardTitle>
            <div className="flex gap-1">
              {notes.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportNotes}
                  className="h-6 w-6 p-0"
                  title="تصدير الملاحظات"
                >
                  <Download className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <FileText className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`rounded-full h-12 w-12 ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isRecording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            {isProcessing && (
              <div className="text-xs text-gray-600">جاري المعالجة...</div>
            )}
          </div>

          {error && (
            <Alert className="text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Notes List */}
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id} className="p-3 text-xs">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-1">
                      <Badge className={getCategoryColor(note.analysis.category)}>
                        {getCategoryIcon(note.analysis.category)} {note.analysis.category}
                      </Badge>
                      <Badge className={getPriorityColor(note.analysis.priority)}>
                        {note.analysis.priority}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(note.id, note.audioBlob)}
                        className="h-6 w-6 p-0"
                      >
                        {currentlyPlaying === note.id ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="h-6 w-6 p-0 text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-700 leading-tight">{note.analysis.summary}</p>
                    
                    {note.analysis.amount && (
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-3 w-3" />
                        {note.analysis.amount} {note.analysis.currency || 'ريال'}
                      </div>
                    )}

                    {note.analysis.actionItems.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">مهام:</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {note.analysis.actionItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {note.analysis.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.analysis.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Separator />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{note.timestamp.toLocaleTimeString('ar-SA')}</span>
                      <span>{note.duration}ث</span>
                    </div>
                  </div>
                </Card>
              ))}

              {notes.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>لا توجد ملاحظات صوتية</p>
                  <p className="text-xs">اضغط على الميكروفون لبدء التسجيل</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}