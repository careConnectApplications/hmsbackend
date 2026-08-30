import express from 'express';
import { validateApiKey } from '../utils/apiKeyMiddleware';
import {
  getInvoiceByPaymentReference,
  markInvoiceAsPaid,
  markInvoiceAsPaidById,
} from '../controllers/externalpartner/externalpartner';

const router = express.Router();

/**
 * External Partner API Routes
 * All routes are secured by the `validateApiKey` middleware.
 * Consumers must supply the correct `X-API-Key` header with every request.
 */

// GET /api/v1/external/invoices/reference/:paymentReference
// Retrieves invoice details for a given payment reference.
router.get(
  '/invoices/reference/:paymentReference',
  validateApiKey,
  getInvoiceByPaymentReference
);

// PATCH /api/v1/external/invoices/reference/:paymentReference/pay
// Marks an invoice (by payment reference) as PAID. Idempotent — safe to retry.
router.patch(
  '/invoices/reference/:paymentReference/pay',
  validateApiKey,
  markInvoiceAsPaid
);

// PATCH /api/v1/external/payments/:id/pay
// Marks a single payment record as PAID by payment _id. Idempotent — safe to retry.
router.patch(
  '/payments/:id/pay',
  validateApiKey,
  markInvoiceAsPaidById
);

export default router;
