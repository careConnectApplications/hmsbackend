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
exports.countradiology = countradiology;
exports.readallradiology = readallradiology;
exports.optimizedreadallradiology = optimizedreadallradiology;
exports.createradiology = createradiology;
exports.readoneradiology = readoneradiology;
exports.updateradiology = updateradiology;
exports.updateradiologybyquery = updateradiologybyquery;
exports.readradiologyaggregate = readradiologyaggregate;
const radiology_1 = __importDefault(require("../models/radiology"));
const config_1 = __importDefault(require("../config"));
function countradiology(query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield radiology_1.default.countDocuments(query);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
//read all lab history
function readallradiology(query, selectquery, populatequery, populatesecondquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const radiologydetails = yield radiology_1.default.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).sort({ createdAt: -1 });
            const totalradiologydetails = yield radiology_1.default.find(query).countDocuments();
            return { radiologydetails, totalradiologydetails };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function optimizedreadallradiology(aggregatequery, page, size) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const skip = (page - 1) * size;
            var radiologydetails = yield radiology_1.default.aggregate(aggregatequery).allowDiskUse(true).skip(skip).limit(size).sort({ createdAt: -1 });
            ;
            const totalradiologydetails = (yield radiology_1.default.aggregate(aggregatequery).allowDiskUse(true)).length;
            const totalPages = Math.ceil(totalradiologydetails / size);
            return { radiologydetails, totalPages, totalradiologydetails, size, page };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
function createradiology(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const radiology = new radiology_1.default(input);
            return yield radiology.save();
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.errorusercreate);
        }
    });
}
//find one
function readoneradiology(query, selectquery, populatequery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield radiology_1.default.findOne(query).select(selectquery).populate(populatequery);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
//update  lab by id
function updateradiology(id, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const radiology = yield radiology_1.default.findOneAndUpdate({ _id: id }, reqbody, {
                new: true
            });
            if (!radiology) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return radiology;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
//update  appointment by query
function updateradiologybyquery(query, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const radiology = yield radiology_1.default.findOneAndUpdate(query, reqbody, {
                new: true
            });
            if (!radiology) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return radiology;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
function readradiologyaggregate(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield radiology_1.default.aggregate(input).allowDiskUse(true);
        }
        catch (e) {
            console.log(e);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
