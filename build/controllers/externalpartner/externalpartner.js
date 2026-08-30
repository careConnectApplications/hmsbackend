"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoiceByPaymentReference = getInvoiceByPaymentReference;
exports.markInvoiceAsPaid = markInvoiceAsPaid;
const payment_1 = require("../../dao/payment");
const config_1 = __importDefault(require("../../config"));
/**
 * Sanitizes and validates a payment reference parameter.
 * - Must be a non-empty string.
 * - Allows only alphanumeric characters and hyphens (prevents injection).
 * Throws if the value is invalid.
 */
function sanitizePaymentReference(value) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
        throw new Error('paymentReference is required and must be a non-empty string.');
    }
    const trimmed = value.trim();
    // Allow alphanumeric characters, hyphens, and underscores only
    if (!/^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
        throw new Error('paymentReference contains invalid characters. Only alphanumeric characters, hyphens, and underscores are allowed.');
    }
    return trimmed;
}
// ---------------------------------------------------------------------------
// GET /api/external/invoices/reference/:paymentReference
// Returns invoice details grouped by payment reference.
// ---------------------------------------------------------------------------
function getInvoiceByPaymentReference(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        try {
            const paymentReference = sanitizePaymentReference(req.params.paymentReference);
            // Fetch all payment line items for this reference
            const result = yield (0, payment_1.readallpayment)({ paymentreference: paymentReference }, 'patient');
            if (!result || !result.paymentdetails || result.paymentdetails.length === 0) {
                res.status(404).json({
                    status: false,
                    msg: `No invoice found for payment reference: ${paymentReference}`,
                });
                return;
            }
            // Derive a representative invoice object from the line items
            const lineItems = result.paymentdetails;
            const firstItem = lineItems[0];
            const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
            // Determine consolidated status:
            // If every line item is paid → "PAID", otherwise reflect the raw status value
            const allPaid = lineItems.every((item) => item.status === config_1.default.status[3]);
            const consolidatedStatus = allPaid ? 'PAID' : 'INCOMPLETE PAYMENT';
            const invoice = {
                paymentReference: firstItem.paymentreference,
                invoiceNumber: firstItem.paymentreference, // payment reference doubles as invoice number
                customerName: `${(_c = (_b = (_a = firstItem.patient) === null || _a === void 0 ? void 0 : _a.firstName) !== null && _b !== void 0 ? _b : firstItem.firstName) !== null && _c !== void 0 ? _c : ''} ${(_f = (_e = (_d = firstItem.patient) === null || _d === void 0 ? void 0 : _d.lastName) !== null && _e !== void 0 ? _e : firstItem.lastName) !== null && _f !== void 0 ? _f : ''}`.trim() || 'N/A',
                MRN: (_j = (_h = (_g = firstItem.patient) === null || _g === void 0 ? void 0 : _g.MRN) !== null && _h !== void 0 ? _h : firstItem.MRN) !== null && _j !== void 0 ? _j : null,
                phoneNumber: (_m = (_l = (_k = firstItem.patient) === null || _k === void 0 ? void 0 : _k.phoneNumber) !== null && _l !== void 0 ? _l : firstItem.phoneNumber) !== null && _m !== void 0 ? _m : null,
                gender: (_o = firstItem.patient) === null || _o === void 0 ? void 0 : _o.gender,
                totalAmount,
                currency: 'NGN',
                paymentStatus: consolidatedStatus,
                lineItemCount: lineItems.length,
                lineItems: lineItems.map((item) => {
                    var _a, _b;
                    return ({
                        id: item._id,
                        description: item.paymentcategory,
                        paymentType: item.paymentype,
                        amount: item.amount,
                        quantity: item.qty,
                        status: item.status,
                        cashierName: (_a = item.cashiername) !== null && _a !== void 0 ? _a : null,
                        confirmedAt: (_b = item.confirmationdate) !== null && _b !== void 0 ? _b : null,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                    });
                }),
                createdAt: firstItem.createdAt,
                updatedAt: firstItem.updatedAt,
            };
            res.status(200).json({
                status: true,
                data: invoice,
            });
        }
        catch (e) {
            console.error('[externalpartner] getInvoiceByPaymentReference error:', e.message);
            res.status(500).json({
                status: false,
                msg: 'Internal server error while retrieving invoice.',
                error: e.message,
            });
        }
    });
}
// ---------------------------------------------------------------------------
// PATCH /api/external/invoices/reference/:paymentReference/pay
// Marks all line items for a payment reference as PAID (idempotent).
// ---------------------------------------------------------------------------
function markInvoiceAsPaid(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const paymentReference = sanitizePaymentReference(req.params.paymentReference);
            // Step 1: Find all records for this payment reference
            const result = yield (0, payment_1.readallpayment)({ paymentreference: paymentReference }, '');
            if (!result || !result.paymentdetails || result.paymentdetails.length === 0) {
                res.status(404).json({
                    status: false,
                    msg: `No invoice found for payment reference: ${paymentReference}`,
                });
                return;
            }
            const lineItems = result.paymentdetails;
            const paidStatus = config_1.default.status[3]; // "paid"
            // Step 2: Check idempotency — if every item is already paid, return success immediately
            const alreadyFullyPaid = lineItems.every((item) => item.status === paidStatus);
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
            yield (0, payment_1.updatepaymentbyquery)({ paymentreference: paymentReference, status: { $ne: paidStatus } }, updatePayload);
            // Step 4: Re-fetch updated records to return accurate state
            const updatedResult = yield (0, payment_1.readallpayment)({ paymentreference: paymentReference }, '');
            const updatedItems = (_a = updatedResult === null || updatedResult === void 0 ? void 0 : updatedResult.paymentdetails) !== null && _a !== void 0 ? _a : [];
            const firstItem = (_b = updatedItems[0]) !== null && _b !== void 0 ? _b : lineItems[0];
            const totalAmount = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
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
                    customerName: `${(_c = firstItem.firstName) !== null && _c !== void 0 ? _c : ''} ${(_d = firstItem.lastName) !== null && _d !== void 0 ? _d : ''}`.trim() || 'N/A',
                    MRN: (_e = firstItem.MRN) !== null && _e !== void 0 ? _e : null,
                },
            });
        }
        catch (e) {
            console.error('[externalpartner] markInvoiceAsPaid error:', e.message);
            res.status(500).json({
                status: false,
                msg: 'Internal server error while updating payment status.',
                error: e.message,
            });
        }
    });
}
