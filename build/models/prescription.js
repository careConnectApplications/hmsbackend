"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../config"));
const prescriptionSchema = new mongoose_1.Schema({
    firstName: String,
    lastName: String,
    MRN: String,
    HMOId: String,
    HMOName: String,
    HMOPlan: String,
    isHMOCover: String,
    appointmentdate: Date,
    clinic: String,
    prescription: {
        type: String,
        required: true
    },
    pharmacy: {
        type: String,
        required: true
    },
    prescriptionnote: {
        type: String
    },
    appointment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Appointment",
        default: [],
    },
    appointmentid: {
        type: String,
        required: true
    },
    orderid: {
        type: String,
        required: true
    },
    patient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Patientsmanagement",
        default: null,
    },
    prescribersname: {
        type: String,
        required: true
    },
    pharmacistname: {
        type: String
    },
    dosageform: String,
    strength: String,
    dosage: String,
    duration: String,
    frequency: String,
    route: String,
    qty: {
        type: Number
    },
    balance: {
        type: Number
    },
    remark: {
        type: String
    },
    doctorsnote: [],
    payment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Payment",
        default: null,
    },
    dispensestatus: {
        type: String,
        default: config_1.default.status[14],
        required: true
    },
    servedstatus: {
        type: String,
        default: config_1.default.servedstatus[1]
    }
}, { timestamps: true });
const prescription = (0, mongoose_1.model)('Prescription', prescriptionSchema);
exports.default = prescription;
/*
 order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    drug_id INT,
    quantity_ordered INT,
    order_price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES PurchaseOrders(order_id),
    FOREIGN KEY (drug_id) REFERENCES Drugs(drug_id)
*/ 
