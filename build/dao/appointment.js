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
exports.countappointment = countappointment;
exports.modifiedreadallappointment = modifiedreadallappointment;
exports.optimizedreadallappointment = optimizedreadallappointment;
exports.readallappointmentfirstfive = readallappointmentfirstfive;
exports.readallappointmentpaginated = readallappointmentpaginated;
exports.readallappointment = readallappointment;
exports.createappointment = createappointment;
exports.readoneappointment = readoneappointment;
exports.updateappointment = updateappointment;
exports.updateappointmentbyquery = updateappointmentbyquery;
const appointment_1 = __importDefault(require("../models/appointment"));
const config_1 = __importDefault(require("../config"));
function countappointment(query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield appointment_1.default.countDocuments(query);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function modifiedreadallappointment(query, aggregatequery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var appointmentdetails = yield appointment_1.default.aggregate(aggregatequery);
            const totalappointmentdetails = yield appointment_1.default.find(query).countDocuments();
            return { appointmentdetails, totalappointmentdetails };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
/*
export async function optimizedreadallappointment(aggregatequery:any,page:any,size:any){

  try{
    const skip = (page - 1) * size;
   var appointmentdetails = await Appointment.aggregate(aggregatequery).skip(skip).limit(size).sort({ createdAt: -1 });;
  const totalappointmentdetails = (await Appointment.aggregate(aggregatequery)).length;
  const totalPages = Math.ceil(totalappointmentdetails / size);
  return { appointmentdetails, totalPages,totalappointmentdetails, size, page};
  
  }
  catch(err:any){
    console.log(err);
        throw new Error(configuration.error.erroruserread);
  
  }
  
  
  }
*/
/*
export async function optimizedreadallappointment(aggregatequery:any, page:any, size:any) {
  try {
    const [result] = await Appointment.aggregate(aggregatequery);
    const appointmentdetails = result.paginatedResults;
    const totalappointmentdetails = result.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalappointmentdetails / size);
    return { appointmentdetails, totalPages, totalappointmentdetails, size, page };
  } catch (err) {
    console.log(err);
    throw new Error(configuration.error.erroruserread);
  }
}
  */
function optimizedreadallappointment(aggregatequery, page, size) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Allow MongoDB to use disk for large sorts/lookups
            const [result] = yield appointment_1.default.aggregate(aggregatequery).allowDiskUse(true);
            const appointmentdetails = (result === null || result === void 0 ? void 0 : result.paginatedResults) || [];
            const totalappointmentdetails = ((_b = (_a = result === null || result === void 0 ? void 0 : result.totalCount) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.count) || 0;
            const totalPages = Math.ceil(totalappointmentdetails / size);
            return {
                appointmentdetails,
                totalPages,
                totalappointmentdetails,
                size,
                page,
            };
        }
        catch (err) {
            console.error(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
function readallappointmentfirstfive(query, selectquery, populatequery, populatesecondquery, populatethirdquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield appointment_1.default.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).populate(populatethirdquery).sort({ createdAt: -1 }).limit(5);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function readallappointmentpaginated(input, page, size) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const skip = (page - 1) * size;
            const appointmentdetails = yield appointment_1.default.aggregate(input).skip(skip).limit(size).sort({ createdAt: -1 });
            const totalappointentdetails = (yield appointment_1.default.aggregate(input)).length;
            const totalPages = Math.ceil(totalappointentdetails / size);
            return { appointmentdetails, totalPages, totalappointentdetails, size, page };
        }
        catch (e) {
            console.log(e);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
//read all patient history
function readallappointment(query, selectquery, populatequery, populatesecondquery, populatethirdquery, populatefourthquery, populatefifthquery, populatesixthquery, populateseventhquery, populateeigthquery, populateninththquery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appointmentdetails = yield appointment_1.default.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).populate(populatethirdquery).populate(populatefourthquery).populate(populatefifthquery).populate(populatesixthquery).populate(populateseventhquery).populate(populateeigthquery).populate(populateninththquery).sort({ createdAt: -1 });
            const totalappointmentdetails = yield appointment_1.default.find(query).countDocuments();
            return { appointmentdetails, totalappointmentdetails };
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
;
function createappointment(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appointment = new appointment_1.default(input);
            return yield appointment.save();
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.errorusercreate);
        }
    });
}
//find one
function readoneappointment(query, selectquery, populatequery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield appointment_1.default.findOne(query).select(selectquery).populate(populatequery);
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserread);
        }
    });
}
//update  appointment by id
function updateappointment(id, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appointment = yield appointment_1.default.findOneAndUpdate({ _id: id }, reqbody, {
                upsert: true, new: true
            });
            if (!appointment) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return appointment;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
//update  appointment by query
function updateappointmentbyquery(query, reqbody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appointment = yield appointment_1.default.findOneAndUpdate(query, reqbody, {
                upsert: true,
                new: true
            });
            if (!appointment) {
                //return json  false response
                throw new Error(config_1.default.error.errorinvalidcredentials);
            }
            return appointment;
        }
        catch (err) {
            console.log(err);
            throw new Error(config_1.default.error.erroruserupdate);
        }
    });
}
