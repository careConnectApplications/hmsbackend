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
exports.countprocedure = countprocedure;
exports.readallprocedure = readallprocedure;
exports.createprocedure = createprocedure;
exports.readoneprocedure = readoneprocedure;
exports.updateprocedure = updateprocedure;
exports.updateprocedurebyquery = updateprocedurebyquery;
exports.readprocedureaggregate = readprocedureaggregate;
const procedure_1 = __importDefault(require("../models/procedure"));
const config_1 = __importDefault(require("../config"));
function countprocedure(query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield procedure_1.default.countDocuments(query);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
//read all lab history
function readallprocedure(query, selectquery, populatequery, populatesecondquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const proceduredetails = yield procedure_1.default.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).sort({ createdAt: -1 });
            const totalproceduredetails = yield procedure_1.default.find(query).countDocuments();
            return { proceduredetails, totalproceduredetails };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function createprocedure(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const procedure = new procedure_1.default(input);
            return yield procedure.save();
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.errorusercreate);
        }
    });
}
//find one
function readoneprocedure(query, selectquery, populatequery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield procedure_1.default.findOne(query).select(selectquery).populate(populatequery);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
//update  lab by id
function updateprocedure(id, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const procedure = yield procedure_1.default.findOneAndUpdate({ _id: id }, reqbody, {
                new: true
            });
            if (!procedure) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return procedure;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
//update  appointment by query
function updateprocedurebyquery(query, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const procedure = yield procedure_1.default.findOneAndUpdate(query, reqbody, {
                new: true
            });
            if (!procedure) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return procedure;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
function readprocedureaggregate(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield procedure_1.default.aggregate(input).allowDiskUse(true);
        }
        catch (e) {
            console.log(e);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
