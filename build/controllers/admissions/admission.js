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
exports.referadmission = void 0;
exports.getallreferedforadmission = getallreferedforadmission;
exports.getalladmissionbypatient = getalladmissionbypatient;
exports.updateadmissionstatus = updateadmissionstatus;
const mongoose_1 = __importDefault(require("mongoose"));
const otherservices_1 = require("../../utils/otherservices");
const appointment_1 = require("../../dao/appointment");
const admissions_1 = require("../../dao/admissions");
const patientmanagement_1 = require("../../dao/patientmanagement");
const wardmanagement_1 = require("../../dao/wardmanagement");
const clinics_1 = require("../../dao/clinics");
const payment_1 = require("../../dao/payment");
const config_1 = __importDefault(require("../../config"));
const { ObjectId } = mongoose_1.default.Types;
//refer for admission
var referadmission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName } = (req.user).user;
        var admissionid = String(Date.now());
        //accept _id from request
        const { id } = req.params;
        console.log('id', id);
        //doctorname,patient,appointment
        var { alldiagnosis, referedward, admittospecialization, referddate, appointmentid } = req.body;
        (0, otherservices_1.validateinputfaulsyvalue)({ id, alldiagnosis, referedward, admittospecialization, referddate });
        //confirm ward
        const referedwardid = new ObjectId(referedward);
        const foundWard = yield (0, wardmanagement_1.readonewardmanagement)({ _id: referedwardid }, '');
        if (!foundWard) {
            throw new Error(`Ward doesnt ${config_1.default.error.erroralreadyexit}`);
        }
        var appointment;
        if (appointmentid) {
            appointmentid = new ObjectId(appointmentid);
            console.log("appoitmentid", appointmentid);
            appointment = yield (0, appointment_1.readoneappointment)({ _id: appointmentid }, {}, '');
            console.log("appointment", appointment);
            if (!appointment) {
                //create an appointment
                throw new Error(`Appointment donot ${config_1.default.error.erroralreadyexit}`);
            }
        }
        //confrim admittospecialization
        //validate specialization
        const foundSpecilization = yield (0, clinics_1.readoneclinic)({ clinic: admittospecialization }, '');
        if (!foundSpecilization) {
            throw new Error(`Specialization doesnt ${config_1.default.error.erroralreadyexit}`);
        }
        //find the record in patient and validate
        var patient = yield (0, patientmanagement_1.readonepatient)({ _id: id, status: config_1.default.status[1] }, {}, '', '');
        if (!patient) {
            throw new Error(`Patient donot ${config_1.default.error.erroralreadyexit} or has not made payment for registration`);
        }
        //check that patient have not been admitted
        var findAdmission = yield (0, admissions_1.readoneadmission)({ patient: patient._id, status: { $ne: config_1.default.admissionstatus[5] } }, {}, '');
        if (findAdmission) {
            throw new Error(`Patient Admission ${config_1.default.error.erroralreadyexit}`);
        }
        //create admission
        var admissionrecord = yield (0, admissions_1.createadmission)({ alldiagnosis, referedward, admittospecialization, referddate, doctorname: firstName + " " + lastName, appointment: id, patient: patient._id, admissionid });
        //update patient 
        var queryresult = yield (0, patientmanagement_1.updatepatient)(patient._id, { $push: { admission: admissionrecord._id } });
        if (appointmentid) {
            yield (0, appointment_1.updateappointment)(appointment._id, { admission: admissionrecord._id });
        }
        res.status(200).json({ queryresult: admissionrecord, status: true });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.referadmission = referadmission;
// get all admission patient
function getallreferedforadmission(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { ward } = req.params;
            const referedward = new ObjectId(ward);
            const queryresult = yield (0, admissions_1.readalladmission)({ referedward }, {}, 'referedward', 'patient');
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
//get all admitted patient
// get all admission patient
function getalladmissionbypatient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { patient } = req.params;
            console.log(patient);
            const referedward = new ObjectId(patient);
            const queryresult = yield (0, admissions_1.readalladmission)({ patient }, {}, 'referedward', 'patient');
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
//admited,to transfer,transfer,to discharge, discharge
function updateadmissionstatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        var { status, transfterto, dischargereason, dischargedate } = req.body;
        if (transfterto) {
            transfterto = new ObjectId(transfterto);
        }
        try {
            //validate that status is included in te status choice
            if (!(config_1.default.admissionstatus).includes(status))
                throw new Error(`${status} status doesnt ${config_1.default.error.erroralreadyexit}`);
            // ONLY validate when status is todischarge
            var reasonValue = dischargereason;
            var dischargeDateValue = dischargedate ? new Date(dischargedate) : new Date();
            if (status == config_1.default.admissionstatus[4]) {
                if (!reasonValue) {
                    throw new Error(`dischargereason ${config_1.default.error.errorisrequired}`);
                }
                if (!(config_1.default.dischargereasons).includes(reasonValue)) {
                    throw new Error(`dischargereason ${config_1.default.error.erroroption}`);
                }
            }
            const response = yield (0, admissions_1.readoneadmission)({ _id: id }, {}, '');
            // check for availability of bed spaces in ward only for admitted
            if (!response) {
                throw new Error(`Admission donot ${config_1.default.error.erroralreadyexit}`);
            }
            var ward = yield (0, wardmanagement_1.readonewardmanagement)({ _id: response === null || response === void 0 ? void 0 : response.referedward }, {});
            if (!ward) {
                // return error
                throw new Error(`Ward donot ${config_1.default.error.erroralreadyexit}`);
            }
            var transftertoward = transfterto ? yield (0, wardmanagement_1.readonewardmanagement)({ _id: transfterto }, {}) : null;
            if (transfterto && status == config_1.default.admissionstatus[2] && !transftertoward) {
                // return error
                throw new Error(`Ward to be transfered donot  ${config_1.default.error.erroralreadyexit}`);
            }
            if (transfterto && status == config_1.default.admissionstatus[2] && transftertoward.vacantbed < 1) {
                throw new Error(`${transftertoward.wardname}  ${config_1.default.error.errorvacantspace}`);
            }
            if ((status == config_1.default.admissionstatus[1] || status == config_1.default.admissionstatus[3]) && ward.vacantbed < 1) {
                throw new Error(`${ward.wardname}  ${config_1.default.error.errorvacantspace}`);
            }
            var updatePayload = { status };
            if (status == config_1.default.admissionstatus[4]) {
                updatePayload.dischargereason = reasonValue;
                updatePayload.dischargedate = dischargeDateValue;
            }
            const queryresult = yield (0, admissions_1.updateadmission)(id, updatePayload);
            //if status is equal to admit reduce  ward count
            if (status == config_1.default.admissionstatus[1] || status == config_1.default.admissionstatus[3]) {
                yield (0, wardmanagement_1.updatewardmanagement)(queryresult.referedward, { $inc: { occupiedbed: 1, vacantbed: -1 } });
            }
            // status is equal to  totransfer reduce target ward and increase source ward
            else if (status == config_1.default.admissionstatus[2]) {
                yield (0, admissions_1.updateadmission)(id, { status, referedward: transfterto, previousward: queryresult.referedward });
            }
            else if (status == config_1.default.admissionstatus[5]) {
                //check that the patient is not owing
                var paymentrecord = yield (0, payment_1.readallpayment)({ paymentreference: response.admissionid, status: { $ne: config_1.default.status[3] } }, '');
                if ((paymentrecord.paymentdetails).length > 0) {
                    throw new Error(config_1.default.error.errorpayment);
                }
                yield (0, wardmanagement_1.updatewardmanagement)(queryresult.referedward, { $inc: { occupiedbed: -1, vacantbed: 1 } });
            }
            // status is equal to  transfer reduce target ward and increase 
            if (status == config_1.default.admissionstatus[3]) {
                yield (0, wardmanagement_1.updatewardmanagement)(queryresult.previousward, { $inc: { occupiedbed: -1, vacantbed: 1 } });
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
