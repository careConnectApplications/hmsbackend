import { Request, Response } from 'express';
import { readonepayment, readallpayment, updatepaymentbyquery } from '../../dao/payment';
import configuration from '../../config';

/**
 * Sanitizes and validates a payment reference parameter.
 * - Must be a non-empty string.
 * - Allows only alphanumeric characters and hyphens (prevents injection).
 * Throws if the value is invalid.
 */
function sanitizePaymentReference(value: any): string {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error('paymentReference is required and must be a non-empty string.');
  }

  const trimmed = value.trim();

  // Allow alphanumeric characters, hyphens, and underscores only
  if (!/^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
    throw new Error(
      'paymentReference contains invalid characters. Only alphanumeric characters, hyphens, and underscores are allowed.'
    );
  }

  return trimmed;
}

// ---------------------------------------------------------------------------
// GET /api/external/invoices/reference/:paymentReference
// Returns invoice details grouped by payment reference.
// ---------------------------------------------------------------------------
export async function getInvoiceByPaymentReference(req: Request, res: Response): Promise<void> {
  try {
    const paymentReference = sanitizePaymentReference(req.params.paymentReference);

    // Fetch all payment line items for this reference
    const result: any = await readallpayment({ paymentreference: paymentReference }, 'patient');

    if (!result || !result.paymentdetails || result.paymentdetails.length === 0) {
      res.status(404).json({
        status: false,
        msg: `No invoice found for payment reference: ${paymentReference}`,
      });
      return;
    }

    // Derive a representative invoice object from the line items
    const lineItems: any[] = result.paymentdetails;
    const firstItem = lineItems[0];

    const totalAmount: number = lineItems.reduce(
      (sum: number, item: any) => sum + (item.amount || 0),
      0
    );

    // Determine consolidated status:
    // If every line item is paid → "PAID", otherwise reflect the raw status value
    const allPaid = lineItems.every(
      (item: any) => item.status === configuration.status[3]
    );
    const consolidatedStatus = allPaid ? 'PAID' : 'INCOMPLETE PAYMENT';

    const invoice = {
      paymentReference: firstItem.paymentreference,
      invoiceNumber: firstItem.paymentreference, // payment reference doubles as invoice number
      customerName: `${firstItem.patient?.firstName ?? firstItem.firstName ?? ''} ${firstItem.patient?.lastName ?? firstItem.lastName ?? ''}`.trim() || 'N/A',
      MRN: firstItem.patient?.MRN ?? firstItem.MRN ?? null,
      phoneNumber: firstItem.patient?.phoneNumber ?? firstItem.phoneNumber ?? null,
      gender: firstItem.patient?.gender,
      totalAmount,
      currency: 'NGN',
      paymentStatus: consolidatedStatus,
      lineItemCount: lineItems.length,
      lineItems: lineItems.map((item: any) => ({
        id: item._id,
        description: item.paymentcategory,
        paymentType: item.paymentype,
        amount: item.amount,
        quantity: item.qty,
        status: item.status,
        cashierName: item.cashiername ?? null,
        confirmedAt: item.confirmationdate ?? null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: firstItem.createdAt,
      updatedAt: firstItem.updatedAt,
    };

    res.status(200).json({
      status: true,
      data: invoice,
    });
  } catch (e: any) {
    console.error('[externalpartner] getInvoiceByPaymentReference error:', e.message);
    res.status(500).json({
      status: false,
      msg: 'Internal server error while retrieving invoice.',
      error: e.message,
    });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/external/invoices/reference/:paymentReference/pay
// Marks all line items for a payment reference as PAID (idempotent).
// ---------------------------------------------------------------------------
export async function markInvoiceAsPaid(req: Request, res: Response): Promise<void> {
  try {
    const paymentReference = sanitizePaymentReference(req.params.paymentReference);

    // Step 1: Find all records for this payment reference
    const result: any = await readallpayment({ paymentreference: paymentReference }, '');

    if (!result || !result.paymentdetails || result.paymentdetails.length === 0) {
      res.status(404).json({
        status: false,
        msg: `No invoice found for payment reference: ${paymentReference}`,
      });
      return;
    }

    const lineItems: any[] = result.paymentdetails;
    const paidStatus = configuration.status[3]; // "paid"

    // Step 2: Check idempotency — if every item is already paid, return success immediately
    const alreadyFullyPaid = lineItems.every((item: any) => item.status === paidStatus);
    if (alreadyFullyPaid) {
      res.status(200).json({
        status: true,
        msg: 'Invoice was already marked as PAID. No changes made.',
        data: {
          paymentReference,
          paymentStatus: 'PAID',
          alreadyPaid: true,
          lineItemCount: lineItems.length,
          updatedAt: lineItems[0].updatedAt,
        },
      });
      return;
    }

    // Step 3: Update all pending-payment items to paid
    const confirmationdate = new Date();
    const updatePayload = {
      status: paidStatus,
      confirmationdate,
      cashiername: 'External Partner System',
      cashieremail: 'external-partner@system.api',
    };

    await updatepaymentbyquery(
      { paymentreference: paymentReference, status: { $ne: paidStatus } },
      updatePayload
    );

    // Step 4: Re-fetch updated records to return accurate state
    const updatedResult: any = await readallpayment({ paymentreference: paymentReference }, '');
    const updatedItems: any[] = updatedResult?.paymentdetails ?? [];

    const firstItem = updatedItems[0] ?? lineItems[0];
    const totalAmount: number = updatedItems.reduce(
      (sum: number, item: any) => sum + (item.amount || 0),
      0
    );

    res.status(200).json({
      status: true,
      msg: 'Invoice payment status successfully updated to PAID.',
      data: {
        paymentReference,
        paymentStatus: 'PAID',
        alreadyPaid: false,
        totalAmount,
        currency: 'NGN',
        lineItemCount: updatedItems.length,
        paidAt: confirmationdate,
        customerName:
          `${firstItem.firstName ?? ''} ${firstItem.lastName ?? ''}`.trim() || 'N/A',
        MRN: firstItem.MRN ?? null,
      },
    });
  } catch (e: any) {
    console.error('[externalpartner] markInvoiceAsPaid error:', e.message);
    res.status(500).json({
      status: false,
      msg: 'Internal server error while updating payment status.',
      error: e.message,
    });
  }
}
