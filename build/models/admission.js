"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../config"));
const admissionSchema = new mongoose_1.Schema({
    alldiagnosis: [{
            note: String,
            diagnosis: String
        }],
    referedward: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Wardmanagement",
        default: null,
    },
    previousward: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Wardmanagement",
        default: null,
    },
    admittospecialization: {
        type: String
    },
    admissionid: {
        type: String
    },
    referddate: {
        type: Date,
        required: true
    },
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
    doctorname: {
        type: String,
        required: true
    },
    staffname: {
        type: String
    },
    dischargereason: {
        type: String
    },
    dischargedate: {
        type: Date
    },
    status: {
        type: String,
        default: config_1.default.admissionstatus[0],
        required: true
    }
}, { timestamps: true });
admissionSchema.index({ referddate: -1 });
admissionSchema.index({ patient: 1 });
admissionSchema.index({ referedward: 1 });
admissionSchema.index({ status: 1 });
admissionSchema.index({ referedward: 1, referddate: -1 });
admissionSchema.index({ createdAt: -1 });
const admission = (0, mongoose_1.model)('Admission', admissionSchema);
exports.default = admission;
/*
 order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    drug_id INT,
    quantity_ordered INT,
    order_price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES PurchaseOrders(order_id),
    FOREIGN KEY (drug_id) REFERENCES Drugs(drug_id)
*/ 
