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
exports.scheduleappointment = exports.createreferrers = exports.readAllreferrerByClinic = exports.readAllreferrerByPatient = void 0;
exports.updatereferrers = updatereferrers;
exports.acceptreferrers = acceptreferrers;
const referrer_1 = require("../../dao/referrer");
const patientmanagement_1 = require("../../dao/patientmanagement");
const otherservices_1 = require("../../utils/otherservices");
const price_1 = require("../../dao/price");
const payment_1 = require("../../dao/payment");
const appointment_1 = require("../../dao/appointment");
const patientmanagement_2 = require("../../dao/patientmanagement");
const mongoose_1 = __importDefault(require("mongoose"));
const { ObjectId } = mongoose_1.default.Types;
const config_1 = __importDefault(require("../../config"));
//get lab order by patient
const readAllreferrerByPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //const {clinic} = (req.user).user;
        const { patient } = req.params;
        const queryresult = yield (0, referrer_1.readallreferrer)({ patient }, {}, 'patient', 'payment');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readAllreferrerByPatient = readAllreferrerByPatient;
//get referrers by clinic
const readAllreferrerByClinic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clinic } = req.params;
        const queryresult = yield (0, referrer_1.readallreferrer)({ receivingclinic: clinic }, {}, 'patient', 'payment');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readAllreferrerByClinic = readAllreferrerByClinic;
const createreferrers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { firstName, lastName } = (req.user).user;
        req.body.referredby = `${firstName} ${lastName}`;
        var { diagnosis, referredclinic, referraldate, receivingclinic, preferredconsultant, priority, reasonforreferral, presentingcomplaints, presentingcomplaintsnotes, additionalnotes, salienthistory, findingsonexamination, investigationdoneifany, laboratoryfindings, requiredinputintervention, referredby } = req.body;
        (0, otherservices_1.validateinputfaulsyvalue)({ diagnosis, referredclinic, referraldate, receivingclinic, preferredconsultant, priority, reasonforreferral, presentingcomplaints, presentingcomplaintsnotes, additionalnotes, salienthistory, findingsonexamination, laboratoryfindings, requiredinputintervention, referredby });
        //frequency must inlcude
        //route must contain allowed options
        const patientrecord = yield (0, patientmanagement_1.readonepatient)({ _id: id }, {}, '', '');
        //console.log(admissionrecord);   
        if (!patientrecord) {
            throw new Error(`Patient donot ${config_1.default.error.erroralreadyexit}`);
        }
        preferredconsultant = new ObjectId(preferredconsultant);
        const queryresult = yield (0, referrer_1.createreferrer)({ patient: patientrecord._id, diagnosis, referredclinic, referraldate, receivingclinic, preferredconsultant, priority, reasonforreferral, presentingcomplaints, presentingcomplaintsnotes, additionalnotes, salienthistory, findingsonexamination, investigationdoneifany, laboratoryfindings, requiredinputintervention, referredby });
        res.status(200).json({ queryresult, status: true });
    }
    catch (e) {
        res.status(403).json({ status: false, msg: e.message });
    }
});
exports.createreferrers = createreferrers;
//insulin
function updatereferrers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get id
            const { id } = req.params;
            const { firstName, lastName } = (req.user).user;
            req.body.referredby = `${firstName} ${lastName}`;
            var { diagnosis, referredclinic, referraldate, preferredconsultant, priority, reasonforreferral, presentingcomplaints, presentingcomplaintsnotes, additionalnotes, salienthistory, findingsonexamination, investigationdoneifany, laboratoryfindings, requiredinputintervention, referredby } = req.body;
            (0, otherservices_1.validateinputfaulsyvalue)({ diagnosis, referredclinic, referraldate, preferredconsultant, priority, reasonforreferral, presentingcomplaints, presentingcomplaintsnotes, additionalnotes, salienthistory, findingsonexamination, laboratoryfindings, requiredinputintervention, referredby });
            preferredconsultant = new ObjectId(preferredconsultant);
            var queryresult = yield (0, referrer_1.updatereferrer)(id, { diagnosis, referredclinic, referraldate, preferredconsultant, priority, reasonforreferral, presentingcomplaints, presentingcomplaintsnotes, additionalnotes, salienthistory, findingsonexamination, investigationdoneifany, laboratoryfindings, requiredinputintervention, referredby });
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
//accept referrer  
function acceptreferrers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get id
            const { id } = req.params;
            var searchrecord = yield (0, referrer_1.readonereferrer)({ _id: id }, {}, 'preferredconsultant');
            if (searchrecord.status !== config_1.default.status[9]) {
                //errorservicetray
                throw new Error(config_1.default.error.errorservicetray);
            }
            var { status } = req.body;
            var queryresult;
            if (status == true) {
                yield (0, referrer_1.updatereferrer)(id, { status: config_1.default.status[12] });
            }
            else {
                yield (0, referrer_1.updatereferrer)(id, { status: config_1.default.status[13] });
            }
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
// schedule appoitment for referrer
// Create a new schedule
const scheduleappointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        var searchrecord = yield (0, referrer_1.readonereferrer)({ _id: id }, {}, 'preferredconsultant');
        if (searchrecord.status !== config_1.default.status[12]) {
            //errorservicetray
            throw new Error(config_1.default.error.errorservicetray);
        }
        //req.body.appointmentdate=new Date(req.body.appointmentdate);
        var appointmentid = String(Date.now());
        const { patient, receivingclinic } = searchrecord;
        //const {id} = req.params;
        var { reason, appointmentdate, appointmentcategory, appointmenttype } = req.body;
        (0, otherservices_1.validateinputfaulsyvalue)({ reason, appointmentdate, appointmentcategory, appointmenttype, patient });
        //search for price if available
        var patients = yield (0, patientmanagement_1.readonepatient)({ _id: patient, status: config_1.default.status[1] }, {}, '', '');
        if (!patients) {
            throw new Error(`Patient donot ${config_1.default.error.erroralreadyexit} or has not made payment for registration`);
        }
        var appointmentPrice = yield (0, price_1.readoneprice)({ servicecategory: appointmentcategory, servicetype: appointmenttype });
        if (!appointmentPrice) {
            throw new Error(config_1.default.error.errornopriceset);
        }
        const createpaymentqueryresult = yield (0, payment_1.createpayment)({ firstName: patients === null || patients === void 0 ? void 0 : patients.firstName, lastName: patients === null || patients === void 0 ? void 0 : patients.lastName, MRN: patients === null || patients === void 0 ? void 0 : patients.MRN, phoneNumber: patients === null || patients === void 0 ? void 0 : patients.phoneNumber, paymentreference: appointmentid, paymentype: appointmenttype, paymentcategory: appointmentcategory, patient, amount: Number(appointmentPrice.amount) });
        const queryresult = yield (0, appointment_1.createappointment)({ appointmentid, payment: createpaymentqueryresult._id, patient, clinic: receivingclinic, reason, appointmentdate, appointmentcategory, appointmenttype, encounter: { vitals: { status: config_1.default.status[8] } } });
        console.log(queryresult);
        //update patient
        yield (0, patientmanagement_2.updatepatient)(patient, { $push: { payment: createpaymentqueryresult._id, appointment: queryresult._id } });
        res.status(200).json({ queryresult, status: true });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.scheduleappointment = scheduleappointment;
