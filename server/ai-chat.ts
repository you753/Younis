import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handleAIChat(req: Request, res: Response) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `أنت مساعد ذكي متخصص في الأعمال المحاسبية والمالية. تتحدث باللغة العربية وتساعد المستخدمين في:
          - إدارة المبيعات والمشتريات
          - إدارة المخزون والأصناف
          - التقارير المالية
          - إدارة العملاء والموردين
          - حسابات الشركة
          - نصائح محاسبية عملية
          
          أجب بطريقة ودودة ومفيدة، واجعل إجاباتك قصيرة ومفهومة. اسأل عن تفاصيل إضافية إذا كنت تحتاج لمعلومات أكثر لتقديم مساعدة أفضل.`
        },
        {
          role: "user", 
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = response.choices[0].message.content;

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      error: 'حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.'
    });
  }
}