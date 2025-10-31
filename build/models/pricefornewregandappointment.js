"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../config"));
const priceappointmentnewregistrationSchema = new mongoose_1.Schema({
    servicecategory: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0,
    },
    servicetype: {
        type: String,
        required: true
    },
    isHMOCover: {
        type: String,
        default: config_1.default.ishmo[0],
    },
    category: {
        type: String
    },
    productid: {
        type: String
    },
    pharmacy: {
        type: String
    },
    percentageofhmocover: {
        type: Number,
        required: true,
        default: 100
    },
    qty: {
        type: Number
    },
    lowstocklevel: {
        type: Number
    },
    expirationdate: {
        type: Date
    },
    lastrestockdate: {
        type: Date
    },
    status: {
        required: true,
        type: String,
        default: config_1.default.status[1],
    }
});
const price = (0, mongoose_1.model)('Price', priceappointmentnewregistrationSchema);
exports.default = price;
