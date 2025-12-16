import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Tüm konuşmaları getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';

    // Konuşmaları çek (son mesaj zamanına göre sırala)
    let query = supabase
      .from('conversations')
      .select('*')
      .order('last_message_time', { ascending: false, nullsFirst: false });

    // Arama sorgusu varsa filtrele
    if (searchQuery) {
      query = query.or(`customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`);
    }

    const { data: conversations, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Konuşmalar yüklenirken hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    // Her konuşma için mesaj sayısını JSONB array'den al
    const conversationsWithMessageCount = (conversations || []).map((conv) => {
      const messages = conv.messages || [];
      const messageCount = Array.isArray(messages) ? messages.length : 0;
      
      // Eğer last_message boşsa ama mesajlar varsa, son mesajı al
      let displayLastMessage = conv.last_message && conv.last_message.trim() ? conv.last_message : null;
      let displayLastMessageTime = conv.last_message_time;
      
      if (!displayLastMessage && Array.isArray(messages) && messages.length > 0) {
        // Mesajları tarihe göre sırala ve son mesajı al
        const sortedMessages = [...messages].sort((a: any, b: any) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA; // En yeni önce
        });
        
        const lastMsg = sortedMessages[0];
        if (lastMsg && lastMsg.message && lastMsg.message.trim()) {
          displayLastMessage = lastMsg.message;
          displayLastMessageTime = lastMsg.createdAt || lastMsg.timestamp || conv.last_message_time;
        }
      }

      return {
        id: conv.id,
        customerId: conv.customer_id,
        customerName: conv.customer_name,
        customerPhone: conv.customer_phone,
        lastMessage: displayLastMessage,
        lastMessageTime: displayLastMessageTime,
        unreadCount: conv.unread_count || 0,
        messageCount: messageCount,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      count: conversationsWithMessageCount.length,
      data: conversationsWithMessageCount,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}

// Yeni konuşma oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, customerName, customerPhone } = body;

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Müşteri adı ve telefon numarası gerekli' },
        { status: 400 }
      );
    }

    // Aynı müşteri için aktif konuşma var mı kontrol et
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('customer_phone', customerPhone)
      .maybeSingle();

    if (existingConv) {
      return NextResponse.json({
        success: true,
        data: {
          id: existingConv.id,
          message: 'Mevcut konuşma bulundu',
        },
      });
    }

    // Yeni konuşma oluştur
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        customer_id: customerId || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        unread_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Konuşma oluşturulurken hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newConversation.id,
        customerId: newConversation.customer_id,
        customerName: newConversation.customer_name,
        customerPhone: newConversation.customer_phone,
        lastMessage: newConversation.last_message,
        lastMessageTime: newConversation.last_message_time,
        unreadCount: newConversation.unread_count || 0,
        createdAt: newConversation.created_at,
        updatedAt: newConversation.updated_at,
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}

