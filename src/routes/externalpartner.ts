import express from 'express';
import { validateApiKey } from '../utils/apiKeyMiddleware';
import {
  getInvoiceByPaymentReference,
  markInvoiceAsPaid,
} from '../controllers/externalpartner/externalpartner';

const router = express.Router();

/**
 * External Partner API Routes
 * All routes are secured by the `validateApiKey` middleware.
 * Consumers must supply the correct `X-API-Key` header with every request.
 */

// GET /api/external/invoices/reference/:paymentReference
// Retrieves invoice details for a given payment reference.
router.get(
  '/invoices/reference/:paymentReference',
  validateApiKey,
  getInvoiceByPaymentReference
);

// PATCH /api/external/invoices/reference/:paymentReference/pay
// Marks an invoice (by payment reference) as PAID. Idempotent — safe to retry.
router.patch(
  '/invoices/reference/:paymentReference/pay',
  validateApiKey,
  markInvoiceAsPaid
);

export default router;
