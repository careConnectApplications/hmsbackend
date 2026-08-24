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
exports.countlab = countlab;
exports.readalllablimitfive = readalllablimitfive;
exports.readalllab = readalllab;
exports.optimizedreadalllab = optimizedreadalllab;
exports.createlab = createlab;
exports.readonelab = readonelab;
exports.updatelab = updatelab;
exports.updatelabbyquery = updatelabbyquery;
exports.readlabaggregate = readlabaggregate;
const lab_1 = __importDefault(require("../models/lab"));
const config_1 = __importDefault(require("../config"));
//read all lab history
//sort({createdAt: -1}).limit(5)
function countlab(query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield lab_1.default.countDocuments(query);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function readalllablimitfive(query, selectquery, populatequery, populatesecondquery, populatethirdquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield lab_1.default.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).populate(populatethirdquery).sort({ createdAt: -1 }).limit(5);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function readalllab(query, selectquery, populatequery, populatesecondquery, populatethirdquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const labdetails = yield lab_1.default.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).populate(populatethirdquery).sort({ createdAt: -1 });
            const totallabdetails = yield lab_1.default.find(query).countDocuments();
            return { labdetails, totallabdetails };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function optimizedreadalllab(aggregatequery, page, size) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const skip = (page - 1) * size;
            var labdetails = yield lab_1.default.aggregate(aggregatequery).allowDiskUse(true).skip(skip).limit(size).sort({ createdAt: -1 });
            ;
            const totallabdetails = (yield lab_1.default.aggregate(aggregatequery).allowDiskUse(true)).length;
            const totalPages = Math.ceil(totallabdetails / size);
            return { labdetails, totalPages, totallabdetails, size, page };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
function createlab(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lab = new lab_1.default(input);
            return yield lab.save();
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.errorusercreate);
        }
    });
}
//find one
function readonelab(query, selectquery, populatequery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield lab_1.default.findOne(query).select(selectquery).populate(populatequery);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
//update  lab by id
function updatelab(id, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lab = yield lab_1.default.findOneAndUpdate({ _id: id }, reqbody, {
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
function updatelabbyquery(query, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lab = yield lab_1.default.findOneAndUpdate(query, reqbody, {
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
function readlabaggregate(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield lab_1.default.aggregate(input).allowDiskUse(true);
        }
        catch (e) {
            console.log(e);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
