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
exports.readallprescription = readallprescription;
exports.createprescription = createprescription;
exports.readoneprescription = readoneprescription;
exports.updateprescription = updateprescription;
exports.updateprescriptionbyquery = updateprescriptionbyquery;
exports.optimizedreadprescriptionaggregate = optimizedreadprescriptionaggregate;
exports.readprescriptionaggregate = readprescriptionaggregate;
const prescription_1 = __importDefault(require("../models/prescription"));
const config_1 = __importDefault(require("../config"));
//read all lab history
function readallprescription(query, selectquery, populatequery, populatesecondquery, populatethirdquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prescriptiondetails = yield prescription_1.default.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).populate(populatethirdquery).sort({ createdAt: -1 });
            const totalprescriptiondetails = yield prescription_1.default.find(query).countDocuments();
            return { prescriptiondetails, totalprescriptiondetails };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function createprescription(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prescription = new prescription_1.default(input);
            return yield prescription.save();
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.errorusercreate);
        }
    });
}
//find one
function readoneprescription(query, selectquery, populatequery, populatesecondquery, populatethirdquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield prescription_1.default.findOne(query).select(selectquery).populate(populatequery).populate(populatesecondquery).populate(populatethirdquery);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
//update  lab by id
function updateprescription(id, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lab = yield prescription_1.default.findOneAndUpdate({ _id: id }, reqbody, {
                new: true
            });
            if (!lab) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return lab;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
//update  appointment by query
function updateprescriptionbyquery(query, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lab = yield prescription_1.default.findOneAndUpdate(query, reqbody, {
                new: true
            });
            if (!lab) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return lab;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
function optimizedreadprescriptionaggregate(input, page, size) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const skip = (page - 1) * size;
            const pharmacydetails = yield prescription_1.default.aggregate(input).allowDiskUse(true).skip(skip).limit(size).sort({ createdAt: -1 });
            const totalpharmacydetails = (yield prescription_1.default.aggregate(input).allowDiskUse(true)).length;
            const totalPages = Math.ceil(totalpharmacydetails / size);
            return { pharmacydetails, totalPages, totalpharmacydetails, size, page };
        }
        catch (e) {
            console.log(e);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
function readprescriptionaggregate(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield prescription_1.default.aggregate(input).allowDiskUse(true);
        }
        catch (e) {
            console.log(e);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
