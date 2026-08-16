"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../config"));
//create schema
const paymentSchema = new mongoose_1.Schema({
    firstName: String,
    lastName: String,
    MRN: String,
    HMOId: String,
    phoneNumber: String,
    paymentype: {
        required: true,
        type: String,
    },
    paymentcategory: {
        required: true,
        type: String,
    },
    paymentreference: {
        required: true,
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
    qty: {
        type: Number,
        default: 1,
    },
    numberoftimesprinted: {
        type: Number,
        default: 0,
    },
    cashieremail: {
        type: String
    },
    cashiername: {
        type: String
    },
    cashierid: {
        type: String
    },
    confirmationdate: {
        type: Date
    },
    patient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Patientsmanagement",
        default: null,
    },
    status: {
        required: true,
        type: String,
        default: config_1.default.status[2],
    }
}, { timestamps: true });
paymentSchema.index({ status: 1, paymentreference: 1, createdAt: -1 });
paymentSchema.index({ paymentreference: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ patient: 1 });
paymentSchema.index({ paymentcategory: 1 });
paymentSchema.index({ updatedAt: -1 });
paymentSchema.index({ paymentcategory: 1, updatedAt: -1 });
paymentSchema.index({ paymentcategory: 1, createdAt: -1 });
//create a model
const payment = (0, mongoose_1.model)("Payment", paymentSchema);
//export the model
exports.default = payment;
