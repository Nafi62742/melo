import { NextResponse } from 'next/server';
import { Order } from '@/core/models/order.model';

const isValidUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

/**
 * POST /api/orders
 * Secure server-side endpoint to persist new client orders to Supabase PostgreSQL.
 * Handles schema adaptation (full tracking schema vs base schema) and RLS safety.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = body?.order as Order | undefined;

    if (!order || !order.id || !order.orderNumber || !order.customer) {
      return NextResponse.json(
        { success: false, error: 'Invalid order payload' },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '';

    // Offline / unconfigured graceful mode:
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: true,
        offline: true,
        message:
          'Supabase credentials not configured in environment. Order recorded locally.',
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: 'return=representation',
    };

    // Sanitize string limits to prevent text overflow & database flooding
    const safeCustomerName = (order.customer.fullName || '').trim().slice(0, 30);
    const safeCustomerPhone = (order.customerPhone || order.customer.phone || '').trim().slice(0, 14);
    const safeDeliveryAddress = (order.customer.address || '').trim().slice(0, 250);
    const safeCustomerEmail = order.customer.email ? order.customer.email.trim().slice(0, 30) : undefined;
    const safeNotes = order.customer.notes ? order.customer.notes.trim().slice(0, 200) : undefined;
    const safeTrxId = order.trxId ? order.trxId.trim().toUpperCase().slice(0, 15) : null;
    const safeBkashSenderNumber = order.bkashSenderNumber ? order.bkashSenderNumber.trim().slice(0, 14) : null;
    const safeTrackingNumber = order.trackingNumber ? order.trackingNumber.trim().slice(0, 40) : null;
    const safeCourierName = order.courierName ? order.courierName.trim().slice(0, 50) : null;
    const safeCourierTrackingUrl = order.courierTrackingUrl ? order.courierTrackingUrl.trim().slice(0, 250) : null;
    const safeEstimatedDelivery = order.estimatedDelivery ? order.estimatedDelivery.trim().slice(0, 40) : null;

    const sanitizedCustomer = {
      ...order.customer,
      fullName: safeCustomerName,
      phone: safeCustomerPhone,
      email: safeCustomerEmail,
      address: safeDeliveryAddress,
      notes: safeNotes,
    };

    // Tier 1: Extended relational schema payload (with tracking & customer references)
    const fullPayload = {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerId: isValidUuid(order.customerId) ? order.customerId : null,
      customerPhone: safeCustomerPhone,
      customerName: safeCustomerName,
      deliveryAddress: safeDeliveryAddress,
      deliveryZone: order.customer.deliveryZone,
      orderSource: order.customer.orderSource || 'website',
      customer: sanitizedCustomer,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trxId: safeTrxId,
      bkashSenderNumber: safeBkashSenderNumber,
      cardLast4: order.cardLast4 || null,
      trackingNumber: safeTrackingNumber,
      courierName: safeCourierName,
      courierTrackingUrl: safeCourierTrackingUrl,
      estimatedDelivery: safeEstimatedDelivery,
      dispatchedAt: order.dispatchedAt || null,
      deliveredAt: order.deliveredAt || null,
    };

    let res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(fullPayload),
    });

    if (res.ok) {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    const fullErr = await res.text();
    console.warn(
      `[API /orders] Full payload insert returned ${res.status}: ${fullErr}. Attempting base schema fallback...`
    );

    // Tier 2: Base schema fallback (strictly standard columns defined in schema.sql)
    const basePayload = {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customer: sanitizedCustomer,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trxId: safeTrxId,
      bkashSenderNumber: safeBkashSenderNumber,
      cardLast4: order.cardLast4 || null,
    };

    res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(basePayload),
    });

    if (res.ok) {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        fallback: true,
      });
    }

    const baseErr = await res.text();
    console.error(
      `[API /orders] Base schema insert failed with status ${res.status}: ${baseErr}`
    );

    return NextResponse.json(
      {
        success: false,
        error: `Supabase database error (${res.status}): ${baseErr}`,
      },
      { status: 500 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[API /orders] Unexpected error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
