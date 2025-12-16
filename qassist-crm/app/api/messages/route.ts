import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Yeni mesaj ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, message, sender, direction, status } = body;

    // Boş mesajları reddet
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Mesaj boş olamaz' },
        { status: 400 }
      );
    }

    if (!conversationId || !sender) {
      return NextResponse.json(
        { error: 'Konuşma ID ve gönderen bilgisi gerekli' },
        { status: 400 }
      );
    }

    // Direction otomatik belirlenir
    const messageDirection = direction || (sender === 'customer' ? 'incoming' : 'outgoing');
    const messageStatus = status || 'sent';

    // JSONB array'e mesaj ekle (RPC fonksiyonu kullan)
    const { error: rpcError } = await supabase.rpc('add_message_to_conversation', {
      conv_id: conversationId,
      msg_text: message,
      msg_sender: sender,
      msg_direction: messageDirection,
      msg_status: messageStatus,
    });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      return NextResponse.json(
        { error: 'Mesaj gönderilirken hata oluştu', details: rpcError.message },
        { status: 500 }
      );
    }

    // Eğer mesaj admin/ai tarafından gönderildiyse unread_count'u sıfırla
    if (sender === 'ai' || sender === 'admin') {
      await supabase.rpc('reset_conversation_unread_count', {
        conv_id: conversationId,
      });
    }

    // Mesaj limitini kontrol et (performans için)
    await supabase.rpc('limit_conversation_messages', {
      conv_id: conversationId,
      max_messages: 1000,
    });

    // Yeni mesaj objesi oluştur (response için)
    const newMessage = {
      id: Date.now(), // Unique ID
      message: message,
      sender: sender,
      direction: messageDirection,
      status: messageStatus,
      timestamp: new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}

// Mesaj durumunu güncelle (okundu olarak işaretle) - JSONB içindeki mesajı güncelle
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { messageId, status, conversationId } = body;

    if (!messageId || !status || !conversationId) {
      return NextResponse.json(
        { error: 'Mesaj ID, durum ve konuşma ID gerekli' },
        { status: 400 }
      );
    }

    // Conversation'ı al
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('messages')
      .eq('id', conversationId)
      .single();

    if (fetchError || !conversation) {
      return NextResponse.json(
        { error: 'Konuşma bulunamadı', details: fetchError?.message },
        { status: 404 }
      );
    }

    // JSONB array içindeki mesajı bul ve güncelle
    const messages = conversation.messages || [];
    const updatedMessages = messages.map((msg: any) => {
      if (msg.id === messageId || msg.id?.toString() === messageId.toString()) {
        return { ...msg, status: status };
      }
      return msg;
    });

    // Güncellenmiş mesajları kaydet
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ messages: updatedMessages })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Supabase error:', updateError);
      return NextResponse.json(
        { error: 'Mesaj durumu güncellenirken hata oluştu', details: updateError.message },
        { status: 500 }
      );
    }

    // Eğer mesaj okundu olarak işaretlendiyse unread_count'u sıfırla
    if (status === 'read') {
      await supabase.rpc('reset_conversation_unread_count', {
        conv_id: conversationId,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Mesaj durumu güncellendi',
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}

