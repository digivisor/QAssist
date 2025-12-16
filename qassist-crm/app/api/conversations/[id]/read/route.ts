import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Konuşmanın okunmamış mesaj sayısını sıfırla
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js 15+ için params async olabilir
    const resolvedParams = await Promise.resolve(params);
    const conversationId = resolvedParams.id;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Konuşma ID gerekli' },
        { status: 400 }
      );
    }

    // Unread count'u sıfırla
    const { error } = await supabase.rpc('reset_conversation_unread_count', {
      conv_id: parseInt(conversationId),
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Okunmamış sayısı sıfırlanırken hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Okunmamış sayısı sıfırlandı',
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}

