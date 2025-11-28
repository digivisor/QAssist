import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Aktif müşterileri çek (status='active' ve check-out tarihi bugünden sonra veya bugün)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatı

    const { data: customers, error } = await supabase
      .from('customers')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        email,
        address,
        room_number,
        room_type,
        check_in,
        check_out,
        nights,
        total_guests,
        status,
        total_reservations,
        created_at
      `)
      .eq('status', 'active')
      .gte('check_out', today) // check_out >= bugün
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Müşteriler yüklenirken hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    // Verileri formatla
    const formattedCustomers = (customers || []).map((customer: any) => ({
      id: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      name: `${customer.first_name} ${customer.last_name}`,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      roomNumber: customer.room_number,
      roomType: customer.room_type,
      checkIn: customer.check_in,
      checkOut: customer.check_out,
      nights: customer.nights,
      totalGuests: customer.total_guests,
      status: customer.status,
      totalReservations: customer.total_reservations,
      createdAt: customer.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: formattedCustomers.length,
      data: formattedCustomers,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}


