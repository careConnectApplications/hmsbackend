"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../config"));
const testresultSchema = new mongoose_1.Schema({
    subcomponent: String,
    result: String,
    nranges: String,
    unit: String
});
const labSchema = new mongoose_1.Schema({
    processeddate: {
        type: Date
    },
    testname: {
        type: String,
        required: true
    },
    testid: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    testresult: [testresultSchema],
    patient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Patientsmanagement",
        default: null,
    },
    appointment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Appointment",
        default: null,
    },
    remark: {
        type: String
    },
    appointmentid: {
        type: String,
        required: true
    },
    staffname: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        default: null,
    },
    firstName: String,
    lastName: String,
    MRN: String,
    phoneNumber: String,
    HMOId: String,
    HMOName: String,
    payment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Payment",
        default: null,
    },
    amount: Number,
    status: {
        required: true,
        type: String,
        default: config_1.default.status[14],
    }
}, { timestamps: true });
const lab = (0, mongoose_1.model)('Lab', labSchema);
exports.default = lab;
