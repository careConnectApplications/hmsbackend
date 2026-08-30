"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiKeyMiddleware_1 = require("../utils/apiKeyMiddleware");
const externalpartner_1 = require("../controllers/externalpartner/externalpartner");
const router = express_1.default.Router();
/**
 * External Partner API Routes
 * All routes are secured by the `validateApiKey` middleware.
 * Consumers must supply the correct `X-API-Key` header with every request.
 */
// GET /api/v1/external/invoices/reference/:paymentReference
// Retrieves invoice details for a given payment reference.
router.get('/invoices/reference/:paymentReference', apiKeyMiddleware_1.validateApiKey, externalpartner_1.getInvoiceByPaymentReference);
// PATCH /api/v1/external/invoices/reference/:paymentReference/pay
// Marks an invoice (by payment reference) as PAID. Idempotent — safe to retry.
router.patch('/invoices/reference/:paymentReference/pay', apiKeyMiddleware_1.validateApiKey, externalpartner_1.markInvoiceAsPaid);
// PATCH /api/v1/external/payments/:id/pay
// Marks a single payment record as PAID by payment _id. Idempotent — safe to retry.
router.patch('/payments/:id/pay', apiKeyMiddleware_1.validateApiKey, externalpartner_1.markInvoiceAsPaidById);
exports.default = router;
