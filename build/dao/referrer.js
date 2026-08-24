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
exports.readallreferrer = readallreferrer;
exports.createreferrer = createreferrer;
exports.readonereferrer = readonereferrer;
exports.updatereferrer = updatereferrer;
exports.updatereferrerbyquery = updatereferrerbyquery;
exports.readreferreraggregate = readreferreraggregate;
const referrer_1 = __importDefault(require("../models/referrer"));
const config_1 = __importDefault(require("../config"));
//read all lab history
function readallreferrer(query, selectquery, populatequery, populatesecondquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const referrerdetails = yield referrer_1.default.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).sort({ createdAt: -1 });
            const totalreferrerdetails = yield referrer_1.default.find(query).countDocuments();
            return { referrerdetails, totalreferrerdetails };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function createreferrer(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const referrer = new referrer_1.default(input);
            return yield referrer.save();
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.errorusercreate);
        }
    });
}
//find one
function readonereferrer(query, selectquery, populatequery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield referrer_1.default.findOne(query).select(selectquery).populate(populatequery);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
//update  lab by id
function updatereferrer(id, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const referrer = yield referrer_1.default.findOneAndUpdate({ _id: id }, reqbody, {
                new: true
            });
            if (!referrer) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return referrer;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
//update  appointment by query
function updatereferrerbyquery(query, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const referrer = yield referrer_1.default.findOneAndUpdate(query, reqbody, {
                new: true
            });
            if (!referrer) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return referrer;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
function readreferreraggregate(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield referrer_1.default.aggregate(input).allowDiskUse(true);
        }
        catch (e) {
            console.log(e);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
