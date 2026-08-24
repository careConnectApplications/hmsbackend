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
exports.readpaymentaggregate = readpaymentaggregate;
exports.readpaymentaggregateoptimized = readpaymentaggregateoptimized;
exports.readallpayment = readallpayment;
exports.readallpaymentaggregate = readallpaymentaggregate;
exports.createpayment = createpayment;
exports.readonepayment = readonepayment;
exports.updatepayment = updatepayment;
exports.updatepaymentbyquery = updatepaymentbyquery;
const payment_1 = __importDefault(require("../models/payment"));
const config_1 = __importDefault(require("../config"));
function readpaymentaggregate(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield payment_1.default.aggregate(input).allowDiskUse(true);
        }
        catch (e) {
            console.log(e);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
function readpaymentaggregateoptimized(input, page, size) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const skip = (page - 1) * size;
            const paymentdetails = yield payment_1.default.aggregate(input).allowDiskUse(true).skip(skip).limit(size).sort({ createdAt: -1 });
            const totalpaymentdetails = (yield payment_1.default.aggregate(input).allowDiskUse(true)).length;
            const totalPages = Math.ceil(totalpaymentdetails / size);
            return { paymentdetails, totalPages, totalpaymentdetails, size, page };
        }
        catch (e) {
            console.log(e);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
//read all payment history
function readallpayment(query, populatequery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const paymentdetails = yield payment_1.default.find(query).populate(populatequery).sort({ createdAt: -1 });
            ;
            const totalpaymentdetails = yield payment_1.default.find(query).countDocuments();
            return { paymentdetails, totalpaymentdetails };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function readallpaymentaggregate(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield payment_1.default.aggregate(input).allowDiskUse(true);
        }
        catch (e) {
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
function createpayment(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = new payment_1.default(input);
            return yield user.save();
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.errorusercreate);
        }
    });
}
//find one
function readonepayment(query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield payment_1.default.findOne(query);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
//update  users
function updatepayment(id, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transaction = yield payment_1.default.findOneAndUpdate({ _id: id }, reqbody, {
                new: true
            });
            if (!transaction) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return transaction;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
//update  appointment by query
function updatepaymentbyquery(query, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const payment = yield payment_1.default.updateMany(query, reqbody, {
                new: true
            });
            if (!payment) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return payment;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
