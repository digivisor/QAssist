import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Telefon numarası parametresi gerekli', details: 'phone parametresi eksik' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatı

    // Telefon numarasına göre aktif müşteriyi kontrol et
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, first_name, last_name, phone, status, check_out')
      .eq('phone', phone)
      .eq('status', 'active')
      .gte('check_out', today)
      .maybeSingle(); // Tek kayıt bekliyor, yoksa null döner

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Müşteri kontrol edilirken hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    // Müşteri var mı kontrolü
    const exists = customer !== null;

    return NextResponse.json({
      success: true,
      exists,
      customer: exists ? {
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        phone: customer.phone,
        status: customer.status,
        checkOut: customer.check_out
      } : null
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}

