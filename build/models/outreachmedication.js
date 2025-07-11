"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../config"));
const outreachMedicationSchema = new mongoose_1.Schema({
    outreachmedicationname: {
        type: String,
        required: true
    },
    outreachmedicationid: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: config_1.default.status[1],
        required: true
    }
}, { timestamps: true });
const outreachMedications = (0, mongoose_1.model)('OutreachMedication', outreachMedicationSchema);
exports.default = outreachMedications;
