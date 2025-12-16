import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Belirli bir konuşmanın mesajlarını getir
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js 15+ için params async olabilir
    const resolvedParams = await Promise.resolve(params);
    const conversationId = resolvedParams.id;

    if (!conversationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Konuşma ID gerekli',
          data: []
        },
        { status: 400 }
      );
    }

    // Conversation'ı ve mesajlarını çek (JSONB'den)
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('messages')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Konuşma bulunamadı', 
          details: error.message 
        },
        { status: 404 }
      );
    }
    
    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Konuşma bulunamadı',
        data: []
      });
    }

    // JSONB array'den mesajları al ve formatla
    let messages = conversation?.messages;
    
    // Eğer messages null veya undefined ise
    if (!messages) {
      return NextResponse.json({
        success: true,
        count: 0,
        data: [],
      });
    }
    
    // Eğer messages bir string ise (JSONB parse edilmemişse), parse et
    if (typeof messages === 'string') {
      try {
        messages = JSON.parse(messages);
      } catch (e) {
        return NextResponse.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }
    
    // Array kontrolü
    if (!Array.isArray(messages)) {
      // Eğer JSONB string olarak geliyorsa parse et
      if (typeof messages === 'string') {
        try {
          messages = JSON.parse(messages);
          if (!Array.isArray(messages)) {
            return NextResponse.json({
              success: true,
              count: 0,
              data: [],
            });
          }
        } catch (e) {
          return NextResponse.json({
            success: true,
            count: 0,
            data: [],
          });
        }
      } else {
        return NextResponse.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }
    
    // Mesajları filtrele ve formatla (sadece object olanları al)
    const validMessages = messages.filter((msg) => {
      // String olan mesajları atla (yanlış format)
      if (typeof msg === 'string') {
        return false;
      }
      // Object olan mesajları al
      if (typeof msg !== 'object' || msg === null) {
        return false;
      }
      // Boş mesajları filtrele
      if (!msg.message || typeof msg.message !== 'string' || msg.message.trim().length === 0) {
        return false;
      }
      return true;
    });
    
    // Mesajları createdAt'e göre sırala (eğer varsa)
    const sortedMessages = [...validMessages].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    });

    // Mesajları formatla
    const formattedMessages = sortedMessages.map((msg) => {
      return {
        id: msg.id || Date.now() + Math.random(), // Eğer id yoksa oluştur
        message: msg.message || '',
        sender: msg.sender || 'customer',
        direction: msg.direction || (msg.sender === 'customer' ? 'incoming' : 'outgoing'),
        status: msg.status || 'sent',
        timestamp: msg.timestamp || (msg.createdAt 
          ? new Date(msg.createdAt).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : new Date().toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })),
        createdAt: msg.createdAt || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedMessages.length,
      data: formattedMessages,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Sunucu hatası', 
        details: error.message,
        data: []
      },
      { status: 500 }
    );
  }
}

