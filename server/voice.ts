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
          content: `أنت مساعد ذكي متخصص في تحليل المحتوى المالي العربي. قم بتحليل النص المقدم واستخراج المعلومات المالية ذات الصلة.

قم بالرد بصيغة JSON تحتوي على:
- category: نوع المعاملة (income/expense/investment/debt/budget/general)
- priority: أولوية المعاملة (low/medium/high)
- amount: المبلغ المذكور (رقم) أو null إذا لم يذكر
- currency: العملة المستخدمة أو "ريال" كافتراضي
- entities: الكيانات المالية المذكورة (أسماء الشركات، البنوك، إلخ)
- summary: ملخص موجز وواضح للمحتوى
- actionItems: المهام المطلوبة استناداً للمحتوى
- tags: كلمات مفتاحية مرتبطة

مثال للرد:
{
  "category": "expense",
  "priority": "high",
  "amount": 500,
  "currency": "ريال",
  "entities": ["متجر العثيم"],
  "summary": "شراء مستلزمات مكتبية بقيمة 500 ريال",
  "actionItems": ["تسجيل الفاتورة في النظام", "إضافة للمصروفات الشهرية"],
  "tags": ["مكتب", "مستلزمات", "شراء"]
}

احرص على دقة التصنيف وتقديم تحليل مفيد للمحتوى المالي.`
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
    const analysis = JSON.parse(analysisText || '{}');
    
    // Ensure required fields are present
    return {
      category: analysis.category || 'general',
      priority: analysis.priority || 'medium',
      amount: analysis.amount || null,
      currency: analysis.currency || 'ريال',
      entities: analysis.entities || [],
      summary: analysis.summary || 'ملاحظة مالية',
      actionItems: analysis.actionItems || [],
      tags: analysis.tags || []
    };

  } catch (error) {
    console.error('Error analyzing financial content:', error);
    
    // Fallback analysis if OpenAI fails
    return {
      category: 'general',
      priority: 'medium',
      amount: null,
      currency: 'ريال',
      entities: [],
      summary: 'ملاحظة مالية - فشل في التحليل',
      actionItems: [],
      tags: []
    };
  }
}