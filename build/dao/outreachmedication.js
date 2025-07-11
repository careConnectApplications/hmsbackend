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
exports.readalloutreachmedication = readalloutreachmedication;
exports.createoutreachmedication = createoutreachmedication;
exports.readoneoutreachmedication = readoneoutreachmedication;
exports.updateoutreachmedication = updateoutreachmedication;
exports.updateoutreachmedicationbyquery = updateoutreachmedicationbyquery;
const outreachmedication_1 = __importDefault(require("../models/outreachmedication"));
const config_1 = __importDefault(require("../config"));
//read all outreach medication
function readalloutreachmedication(query, selectquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const outreachmedicationdetails = yield outreachmedication_1.default.find(query).select(selectquery).sort({ createdAt: -1 });
            const totaloutreachmedicationdetails = yield outreachmedication_1.default.find(query).countDocuments();
            return { outreachmedicationdetails, totaloutreachmedicationdetails };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function createoutreachmedication(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const outreachmedication = new outreachmedication_1.default(input);
            return yield outreachmedication.save();
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.errorusercreate);
        }
    });
}
//find one
function readoneoutreachmedication(query, selectquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield outreachmedication_1.default.findOne(query).select(selectquery);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
//update  management by id
function updateoutreachmedication(id, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const outreachmedication = yield outreachmedication_1.default.findOneAndUpdate({ _id: id }, reqbody, {
                new: true
            });
            if (!outreachmedication_1.default) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return outreachmedication;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
//update  bedmanagement by query
function updateoutreachmedicationbyquery(query, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const outreachmedication = yield outreachmedication_1.default.findOneAndUpdate(query, reqbody, {
                new: true
            });
            if (!outreachmedication) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return outreachmedication;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
