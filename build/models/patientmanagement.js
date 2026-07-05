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
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../config"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
//create schema
const patientSchema = new mongoose_1.Schema({
    title: {
        type: String
    },
    firstName: {
        required: true,
        type: String,
    },
    patienttype: {
        type: String,
        default: config_1.default.patienttype[0]
    },
    authorizationcode: String,
    facilitypateintreferedfrom: String,
    middleName: {
        type: String,
    },
    lastName: {
        required: true,
        type: String,
    },
    country: {
        type: String
    },
    stateOfResidence: {
        type: String,
    },
    LGA: {
        type: String
    },
    address: {
        type: String
    },
    age: {
        type: String
    },
    dateOfBirth: {
        type: String
    },
    gender: {
        required: true,
        type: String,
    },
    nin: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    email: {
        type: String,
    },
    oldMRN: {
        type: String,
    },
    nextOfKinName: {
        type: String,
    },
    nextOfKinRelationship: {
        type: String,
    },
    nextOfKinPhoneNumber: {
        type: String,
    },
    nextOfKinAddress: {
        type: String,
    },
    maritalStatus: {
        type: String,
    },
    disability: {
        type: String,
    },
    occupation: {
        type: String,
    },
    isHMOCover: {
        type: String,
        default: config_1.default.ishmo[0],
    },
    HMOName: {
        type: String,
    },
    HMOId: {
        type: String,
    },
    HMOPlan: {
        type: String,
    },
    passport: {
        type: String,
    },
    MRN: {
        required: true,
        type: String,
    },
    password: {
        required: true,
        type: String,
    },
    appointment: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Appointment",
            default: [],
        },
    ],
    admission: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Admission",
            default: [],
        },
    ],
    prescription: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Prescription",
            default: [],
        },
    ],
    lab: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Lab",
            default: [],
        },
    ],
    radiology: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Radiology",
            default: [],
        },
    ],
    prcedure: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Procedure",
            default: [],
        },
    ],
    status: {
        required: true,
        type: String,
        default: config_1.default.status[2],
    },
    payment: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Payment",
            default: [],
        },
    ]
}, { timestamps: true });
patientSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //GENERATE A SALT
            const salt = yield bcryptjs_1.default.genSalt(10);
            //generate password hash
            const passwordHash = yield bcryptjs_1.default.hash(this.password, salt);
            //re-assign hashed version of original
            this.password = passwordHash;
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
patientSchema.index({ _id: 1, firstName: 1, MRN: 1, HMOId: 1, lastName: 1, phoneNumber: 1 });
patientSchema.index({ firstName: 1, lastName: 1, MRN: 1, HMOId: 1, phoneNumber: 1 });
patientSchema.index({ firstName: 1 });
patientSchema.index({ lastName: 1 });
patientSchema.index({ MRN: 1 });
patientSchema.index({ phoneNumber: 1 });
patientSchema.index({ HMOId: 1 });
//create a model
const patientsmanagement = (0, mongoose_1.model)("Patientsmanagement", patientSchema);
//export the model
exports.default = patientsmanagement;
