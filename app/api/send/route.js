import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. รับข้อมูลที่ส่งมาจากหน้าบ้าน (Frontend)
    const body = await request.json();
    const { token, to, messages } = body;

    // ตรวจสอบว่าข้อมูลครบไหม
    if (!token || !to || !messages) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. ส่งต่อไปให้ LINE Messaging API
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // แก้บรรทัดนี้: ใช้ Backtick (`) และ ${token} เพื่อรับค่าจากหน้าเว็บ
        'Authorization': `Bearer ${token}`, 
      },
      body: JSON.stringify({
        to: to, // ใช้ตัวแปร to ที่รับมาจากหน้าบ้าน
        messages: messages,
      }),
    });

    const data = await response.json();

    // 3. ตรวจสอบผลลัพธ์จาก LINE
    if (!response.ok) {
      console.error('LINE API Error:', data);
      return NextResponse.json({ error: data.message || 'Failed to send message to LINE' }, { status: 400 });
    }

    // 4. ส่งผลสำเร็จกลับไปบอกหน้าบ้าน
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}