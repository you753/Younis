import OpenAI from "openai";
import multer from "multer";
import { Request, Response } from "express";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
});

export const uploadMiddleware = upload.single('audio');

export async function transcribeAudio(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع ملف صوتي' });
    }

    // Convert buffer to a file-like object for OpenAI
    const audioFile = new File([req.file.buffer], 'recording.wav', {
      type: req.file.mimetype,
    });

    // Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ar", // Arabic language
    });

    const transcript = transcription.text;

    // Analyze the financial content using GPT-4o
    const analysis = await analyzeFinancialContent(transcript);

    res.json({
      transcript,
      analysis,
    });

  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء معالجة الملف الصوتي',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function analyzeFinancialContent(text: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `أنت مساعد ذكي متخصص في تحليل الملاحظات المالية والمحاسبية باللغة العربية. 
          
          مهمتك تحليل النص المدخل وتصنيفه واستخراج المعلومات المالية المهمة.
          
          يجب أن ترد بصيغة JSON تحتوي على:
          - category: التصنيف (مبيعات، مشتريات، مصروفات، إيرادات، تذكير، مهمة، أخرى)
          - priority: الأولوية (low, medium, high)
          - amount: المبلغ المالي إن وجد (رقم)
          - currency: العملة (ر.س، دولار، يورو، إلخ)
          - entities: قائمة بالكيانات المهمة (أسماء أشخاص، شركات، منتجات)
          - summary: ملخص مختصر للمحتوى
          
          مثال:
          {
            "category": "مبيعات",
            "priority": "medium",
            "amount": 1500,
            "currency": "ر.س",
            "entities": ["أحمد محمد", "منتج A"],
            "summary": "عملية بيع لمنتج A بقيمة 1500 ريال للعميل أحمد محمد"
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysisText = response.choices[0].message.content;
    return JSON.parse(analysisText || '{}');

  } catch (error) {
    console.error('Error analyzing financial content:', error);
    
    // Fallback analysis if OpenAI fails
    return {
      category: "أخرى",
      priority: "low",
      amount: null,
      currency: null,
      entities: [],
      summary: "تم تسجيل الملاحظة ولكن لم يتم تحليلها بشكل كامل"
    };
  }
}