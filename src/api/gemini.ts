// src/api/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// คำสั่งสอน AI ให้เป็นพนักงานต้อนรับของร้านละมุนรส
const SYSTEM_INSTRUCTION = `
คุณคือ "น้องละมุน" พนักงานต้อนรับ AI ประจำร้านอาหารไทย "ละมุนรส (Lamunros Thai Cuisine)"
บุคลิกของคุณ: สุภาพ อบอุ่น ไพเราะ เป็นกันเอง สไตล์ไทยโบราณร่วมสมัย (ใช้คำลงท้าย "ค่ะ/นะคะ")

ข้อมูลร้านละมุนรส:
- ที่ตั้ง: เลขที่ 88 ถนนสาทรเหนือ แขวงสีลม เขตบางรัก กรุงเทพฯ
- เวลาทำการ: เปิดทุกวัน 10:30 - 21:30 น. (มีที่จอดรถสะดวกสบาย)
- เบอร์โทร: 02-892-4567 / LINE: @lamunros.thai
- จุดเด่น: พริกแกงตำมือวันต่อวัน, กะทิคั้นสด 100%, น้ำตาลโตนดแท้เมืองเพชร, ผักสมุนไพรอินทรีย์

เมนูไฮไลต์ของร้าน:
1. กับข้าว:
   - ต้มยำกุ้งแม่น้ำน้ำข้นโบราณ (390.-) เผ็ดระดับ 2 มันกุ้งเยิ้ม หอมเครื่องสมุนไพร
   - แกงเขียวหวานเนื้อริบอายพริกขี้หนู (360.-) เผ็ดระดับ 3 เนื้อนุ่มละมุน
   - ปลากะพงทอดน้ำปลาหอมยำมะม่วง (450.-) เผ็ดน้อย กรอบนอกนุ่มใน
   - มัสมั่นน่องเป็ดกงฟีต์มันฝรั่งหวาน (380.-) รสละมุนกลมกล่อม เป็ดตุ๋น 8 ชม.
   - ผัดกะเพราเนื้อวากิวไข่เป็ดลาวา (280.-) เผ็ดระดับ 3 กะเพราป่าแท้
   - ผัดไทยกุ้งแม่น้ำห่อไข่โบราณ (260.-) ซอสมะขามเคี่ยวสามรส
2. เครื่องดื่ม:
   - ชาไทยการันต์สกัดเย็นนมสดฮอกไกโด (115.-) หวานน้อยนุ่มนวล
   - น้ำมะพร้าวน้ำหอมอัญชันเกล็ดหิมะ (95.-) มะพร้าวดำเนินสะดวกแท้ สดชื่น
3. ขนมหวาน:
   - ข้าวเหนียวมะม่วงอกร่องทองอบควันเทียน (185.-) กะทิสดหอมมัน
   - บัวลอยเผือกกล้วยบวชชีไข่หวาน (135.-) บัวลอยปั้นมือ

แนวทางการตอบคำถาม:
- ตอบให้กระชับ ชัดเจน น่ารับประทาน และให้ข้อมูลถูกต้อง
- หากลูกค้าถามเรื่องแพ้อาหาร ให้แนะนำเมนูที่ปลอดภัย และแจ้งว่าระบุโน้ตถึงแม่ครัวได้
- เชิญชวนให้ลูกค้ากด "สำรองโต๊ะ" หรือกดสั่งเมนูลงสำรับในหน้าเว็บได้เลย
`;

// รายชื่อโมเดลตามลำดับความเร็วและโควตา (Cascade Failover)
// โมเดล Lite มีโควตาสูง ตอบไว ไม่ติด Rate limit (429)
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
];

export async function askGemini(prompt: string, chatHistory: { role: string; parts: string }[] = []) {
  // กรองประวัติการคุย: ข้อความแรกต้องเป็นของ user เสมอ
  const firstUserIndex = chatHistory.findIndex((h) => h.role === 'user');
  const validHistory = firstUserIndex >= 0 ? chatHistory.slice(firstUserIndex) : [];

  const formattedHistory = validHistory.map((h) => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.parts }],
  }));

  // ระบบสลับโมเดลอัตโนมัติ (Auto-Failover): ถ้าตัวแรกติด Limit ให้ใช้ตัวถัดไปทันที
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      if (formattedHistory.length > 0) {
        try {
          const chat = model.startChat({ history: formattedHistory });
          const result = await chat.sendMessage(prompt);
          return result.response.text();
        } catch {
          // หาก startChat ติดปัญหา ให้ลอง generateContent ตรงๆ ของโมเดลนี้
          const result = await model.generateContent(prompt);
          return result.response.text();
        }
      }

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: unknown) {
      const errorObj = err as { status?: number; message?: string };
      console.warn(`Model ${modelName} encountered issue (${errorObj?.status || errorObj?.message}), trying next model...`);
      // วนลูปไปลองโมเดลตัวถัดไปทันที
    }
  }

  return 'ขออภัยด้วยนะคะ ตอนนี้น้องละมุนกำลังเชื่อมต่อห้องครัว กรุณาลองใหม่อีกครั้ง หรือสอบถามเจ้าหน้าที่โทร 02-892-4567 ได้เลยนะคะ';
}
