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
exports.createoutreachmedications = void 0;
exports.getalloutreachmedications = getalloutreachmedications;
exports.updateoutreachmedications = updateoutreachmedications;
const config_1 = __importDefault(require("../../config"));
const outreachmedication_1 = require("../../dao/outreachmedication");
const otherservices_1 = require("../../utils/otherservices");
const audit_1 = require("../../dao/audit");
//add outreach medication
var createoutreachmedications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { outreachmedicationname } = req.body;
        (0, otherservices_1.validateinputfaulsyvalue)({ outreachmedicationname });
        var outreachmedicationid = `${outreachmedicationname[0]}${(0, otherservices_1.generateRandomNumber)(5)}${outreachmedicationname[outreachmedicationname.length - 1]}`;
        // validate Outreachmedication
        const foundOutreachmedicationname = yield (0, outreachmedication_1.readoneoutreachmedication)({ outreachmedicationname }, '');
        if (foundOutreachmedicationname) {
            throw new Error(`Outreachmedication ${config_1.default.error.erroralreadyexit}`);
        }
        const queryresult = yield (0, outreachmedication_1.createoutreachmedication)({ outreachmedicationname, outreachmedicationid });
        const { firstName, lastName } = (req.user).user;
        var actor = `${firstName} ${lastName}`;
        yield (0, audit_1.createaudit)({ action: "Created outreachMedicationid", actor, affectedentity: outreachmedicationname });
        res.status(200).json({ queryresult, status: true });
    }
    catch (error) {
        console.log(error);
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.createoutreachmedications = createoutreachmedications;
//read all wards
function getalloutreachmedications(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const queryresult = yield (0, outreachmedication_1.readalloutreachmedication)({}, '');
            res.status(200).json({
                queryresult,
                status: true
            });
        }
        catch (e) {
            res.status(403).json({ status: false, msg: e.message });
        }
    });
}
//update updateoutreachmedication
function updateoutreachmedications(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get id
            const { id } = req.params;
            const { outreachmedicationname } = req.body;
            (0, otherservices_1.validateinputfaulsyvalue)({ outreachmedicationname });
            var queryresult = yield (0, outreachmedication_1.updateoutreachmedication)(id, { outreachmedicationname });
            const { firstName, lastName } = (req.user).user;
            var actor = `${firstName} ${lastName}`;
            yield (0, audit_1.createaudit)({ action: "Updated Outreachmedication", actor, affectedentity: queryresult.wardname });
            res.status(200).json({
                queryresult,
                status: true
            });
        }
        catch (e) {
            console.log(e);
            res.status(403).json({ status: false, msg: e.message });
        }
    });
}
