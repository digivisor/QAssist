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

    // Telefon numarasına göre aktif müşteriyi bul
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .eq('status', 'active')
      .gte('check_out', today)
      .single();

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Aktif müşteri bulunamadı', details: 'Bu telefon numarasına sahip aktif müşteri bulunamadı' },
          { status: 404 }
        );
      }
      console.error('Supabase error:', customerError);
      return NextResponse.json(
        { error: 'Müşteri yüklenirken hata oluştu', details: customerError.message },
        { status: 500 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Aktif müşteri bulunamadı', details: 'Bu telefon numarasına sahip aktif müşteri bulunamadı' },
        { status: 404 }
      );
    }

    const customerId = customer.id;

    // İlişkili verileri yükle
    const [
      { data: roomGuests, error: roomGuestsError },
      { data: requests, error: requestsError },
      { data: issues, error: issuesError },
      { data: aiAnalysis, error: aiAnalysisError },
      { data: eventReservations, error: eventReservationsError },
      { data: restaurantReservations, error: restaurantReservationsError }
    ] = await Promise.all([
      supabase.from('room_guests').select('*').eq('customer_id', customerId),
      supabase.from('customer_requests').select('*').eq('customer_id', customerId),
      supabase.from('customer_issues').select('*').eq('customer_id', customerId),
      supabase.from('customer_ai_analysis').select('*').eq('customer_id', customerId).maybeSingle(),
      supabase.from('event_reservations').select('*').eq('customer_id', customerId),
      supabase.from('restaurant_reservations').select('*').eq('customer_id', customerId)
    ]);

    // Hataları kontrol et
    if (roomGuestsError) {
      console.error('Room guests error:', roomGuestsError);
    }
    if (requestsError) {
      console.error('Requests error:', requestsError);
    }
    if (issuesError) {
      console.error('Issues error:', issuesError);
    }
    if (aiAnalysisError) {
      console.error('AI Analysis error:', aiAnalysisError);
    }
    if (eventReservationsError) {
      console.error('Event reservations error:', eventReservationsError);
    }
    if (restaurantReservationsError) {
      console.error('Restaurant reservations error:', restaurantReservationsError);
    }

    // Verileri formatla
    const formattedCustomer = {
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
      updatedAt: customer.updated_at,
      
      // İlişkili veriler
      roomGuests: (roomGuests || []).map((rg: any) => ({
        id: rg.id,
        firstName: rg.first_name,
        lastName: rg.last_name,
        phone: rg.phone,
        email: rg.email,
        relationship: rg.relationship,
        createdAt: rg.created_at
      })),
      
      requests: (requests || []).map((req: any) => ({
        id: req.id,
        type: req.type,
        description: req.description,
        date: req.date,
        status: req.status,
        createdAt: req.created_at
      })),
      
      issues: (issues || []).map((issue: any) => ({
        id: issue.id,
        topic: issue.topic,
        description: issue.description,
        date: issue.date,
        resolved: issue.resolved,
        resolvedAt: issue.resolved_at,
        createdAt: issue.created_at
      })),
      
      aiAnalysis: aiAnalysis ? {
        id: aiAnalysis.id,
        behavior: aiAnalysis.behavior,
        preferences: aiAnalysis.preferences || [],
        suggestions: aiAnalysis.suggestions || [],
        satisfaction: aiAnalysis.satisfaction,
        riskLevel: aiAnalysis.risk_level,
        createdAt: aiAnalysis.created_at,
        updatedAt: aiAnalysis.updated_at
      } : null,
      
      eventReservations: (eventReservations || []).map((er: any) => ({
        id: er.id,
        eventName: er.event_name,
        eventType: er.event_type,
        eventDate: er.event_date,
        eventTime: er.event_time,
        numberOfGuests: er.number_of_guests,
        status: er.status,
        notes: er.notes,
        createdAt: er.created_at,
        updatedAt: er.updated_at
      })),
      
      restaurantReservations: (restaurantReservations || []).map((rr: any) => ({
        id: rr.id,
        restaurantName: rr.restaurant_name,
        reservationDate: rr.reservation_date,
        reservationTime: rr.reservation_time,
        numberOfGuests: rr.number_of_guests,
        tableNumber: rr.table_number,
        status: rr.status,
        specialRequests: rr.special_requests,
        createdAt: rr.created_at,
        updatedAt: rr.updated_at
      }))
    };

    return NextResponse.json({
      success: true,
      data: formattedCustomer
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}


