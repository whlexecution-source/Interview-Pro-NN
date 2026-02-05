
import { InitialDataResponse } from '../types.ts';

// ตรวจสอบให้แน่ใจว่า API_URL เป็นอันล่าสุดจาก "Deploy > New Deployment" ใน GAS
const API_URL = 'https://script.google.com/macros/s/AKfycbzOKhY6iKMgMw1jfJpESPiLkWcxEsv9HamEwLjVVPPoQr8l-Z9CHQaD07xI6j43_tP5Og/exec';

export const getInitialData = async (): Promise<InitialDataResponse> => {
  try {
    const response = await fetch(`${API_URL}?action=getInitialData`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch initial data error:", error);
    throw error;
  }
};

export const submitEvaluation = async (payload: any): Promise<void> => {
  // สำหรับ GAS เรามักใช้ mode: 'no-cors' ในการ POST 
  // แต่ถ้าต้องการเช็คความสำเร็จแบบ 100% ต้องใช้ fetch แบบปกติ (ซึ่งต้องตั้งค่า CORS ใน GAS ด้วย)
  // ในที่นี้เราใช้เทคนิคส่งผ่าน POST ปกติ
  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors', // ข้อจำกัด: เราจะไม่เห็น Response กลับมา แต่ข้อมูลจะไปถึง Sheets
    headers: {
      'Content-Type': 'text/plain', // GAS doPost รับ JSON ได้ดีกว่าผ่าน text/plain หรือ form-data
    },
    body: JSON.stringify({
      action: 'submitEvaluation',
      ...payload
    }),
  });
};
