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
exports.refertheatreadmission = void 0;
exports.getallreferedfortheatreadmission = getallreferedfortheatreadmission;
exports.getalltheatreadmissionbypatient = getalltheatreadmissionbypatient;
exports.updatetheatreadmissionstatus = updatetheatreadmissionstatus;
exports.gettheatreadmissiontoday = gettheatreadmissiontoday;
const mongoose_1 = __importDefault(require("mongoose"));
const otherservices_1 = require("../../utils/otherservices");
const theatreadmission_1 = require("../../dao/theatreadmission");
const patientmanagement_1 = require("../../dao/patientmanagement");
const theatre_1 = require("../../dao/theatre");
const clinics_1 = require("../../dao/clinics");
const config_1 = __importDefault(require("../../config"));
const price_1 = require("../../dao/price");
const payment_1 = require("../../dao/payment");
const procedure_1 = require("../../dao/procedure");
const servicetype_1 = require("../../dao/servicetype");
const admissions_1 = require("../../dao/admissions");
const { ObjectId } = mongoose_1.default.Types;
//refer for admission
var refertheatreadmission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName } = (req.user).user;
        const raiseby = `${firstName} ${lastName}`;
        const { id } = req.params;
        console.log('id', id);
        //doctorname,patient,appointment
        const { procedures, referedtheatre, clinic, appointmentdate, cptcodes, dxcodes, indicationdiagnosisprocedure } = req.body;
        (0, otherservices_1.validateinputfaulsyvalue)({ id, procedures, referedtheatre, clinic, appointmentdate });
        //confirm ward
        const referedtheatreid = new ObjectId(referedtheatre);
        const foundTheatre = yield (0, theatre_1.readonetheatremanagement)({ _id: referedtheatreid }, '');
        if (!foundTheatre) {
            throw new Error(`Theatre doesnt ${config_1.default.error.erroralreadyexit}`);
        }
        //confrim admittospecialization
        //validate specialization
        const foundSpecilization = yield (0, clinics_1.readoneclinic)({ clinic }, '');
        if (!foundSpecilization) {
            throw new Error(`Specialization doesnt ${config_1.default.error.erroralreadyexit}`);
        }
        //find the record in patient and validate
        var patient = yield (0, patientmanagement_1.readonepatient)({ _id: id, status: config_1.default.status[1] }, {}, '', '');
        if (!patient) {
            throw new Error(`Patient donot ${config_1.default.error.erroralreadyexit} or has not made payment for registration`);
        }
        // Ensure patient has made a paid Appointment payment today, unless they are currently admitted
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const findAdmissionForPayment = yield (0, admissions_1.readoneadmission)({ patient: patient._id, status: { $ne: config_1.default.admissionstatus[5] } }, {}, '');
        if (!findAdmissionForPayment) {
            // Patient is not admitted — enforce payment check
            const appointmentPayment = yield (0, payment_1.readonepayment)({
                patient: patient._id,
                status: config_1.default.status[3], // 'paid'
                paymentcategory: config_1.default.category[0], // 'Appointment'
                createdAt: { $gte: todayStart, $lte: todayEnd }
            });
            if (!appointmentPayment) {
                throw new Error('Patient has not made payment for an appointment today. Pharmacy order cannot be processed.');
            }
        }
        //check that patient have not been admitted
        var findAdmission = yield (0, theatreadmission_1.readonethearteadmission)({ patient: patient._id, status: { $ne: config_1.default.admissionstatus[5] } }, {}, '');
        if (findAdmission) {
            throw new Error(`Patient Admission to Theatre ${config_1.default.error.erroralreadyexit}`);
        }
        // validate and create  procedure 
        var procedureid = String(Date.now());
        var proceduresid = [];
        var paymentids = [];
        const { servicetypedetails } = yield (0, servicetype_1.readallservicetype)({ category: config_1.default.category[5] }, { type: 1, category: 1, department: 1, _id: 0 });
        //loop through all test and create record in lab order
        for (var i = 0; i < procedures.length; i++) {
            //search for price of test name
            var testPrice = yield (0, price_1.readoneprice)({ servicetype: procedures[i] });
            if (!testPrice) {
                throw new Error(`${config_1.default.error.errornopriceset}  ${procedures[i]}`);
            }
            //search testname in setting
            console.log(servicetypedetails);
            var testsetting = servicetypedetails.filter(item => (item.type).includes(procedures[i]));
            if (!testsetting || testsetting.length < 1) {
                throw new Error(`${procedures[i]} donot ${config_1.default.error.erroralreadyexit} in ${config_1.default.category[4]} as a service type  `);
            }
            //create payment
            var createpaymentqueryresult = yield (0, payment_1.createpayment)({ firstName: patient === null || patient === void 0 ? void 0 : patient.firstName, lastName: patient === null || patient === void 0 ? void 0 : patient.lastName, MRN: patient === null || patient === void 0 ? void 0 : patient.MRN, phoneNumber: patient === null || patient === void 0 ? void 0 : patient.phoneNumber, paymentreference: id, paymentype: procedures[i], paymentcategory: testsetting[0].category, patient: id, amount: Number(testPrice.amount) });
            //create testrecordn 
            var procedurerecord = yield (0, procedure_1.createprocedure)({ procedure: procedures[i], patient: id, payment: createpaymentqueryresult._id, procedureid, clinic, indicationdiagnosisprocedure, appointmentdate, cptcodes, dxcodes, raiseby });
            proceduresid.push(procedurerecord._id);
            paymentids.push(createpaymentqueryresult._id);
        }
        //create theatre admission
        var theatreadmissionid = String(Date.now());
        var theatreadmissionrecord = yield (0, theatreadmission_1.createthearteadmission)({ procedures: proceduresid, referedtheatre: foundTheatre._id, clinic, doctorname: firstName + " " + lastName, appointmentdate, patient: patient._id, theatreadmissionid });
        //update patient 
        var queryresult = yield (0, patientmanagement_1.updatepatient)(patient._id, { $push: { prcedure: proceduresid, payment: paymentids } });
        res.status(200).json({ queryresult: theatreadmissionrecord, status: true });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.refertheatreadmission = refertheatreadmission;
// get all admission patient
function getallreferedfortheatreadmission(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { theatre } = req.params;
            const referedtheatre = new ObjectId(theatre);
            const queryresult = yield (0, theatreadmission_1.readallthearteadmission)({ referedtheatre }, {}, 'referedtheatre', 'patient', 'conscent');
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
function getalltheatreadmissionbypatient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { patient } = req.params;
            const queryresult = yield (0, theatreadmission_1.readallthearteadmission)({ patient }, {}, 'referedtheatre', 'patient', 'conscent');
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
function updatetheatreadmissionstatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        var { status, transfterto } = req.body;
        transfterto = new ObjectId(transfterto);
        try {
            //validate that status is included in te status choice
            if (!(config_1.default.admissionstatus).includes(status))
                throw new Error(`${status} status doesnt ${config_1.default.error.erroralreadyexit}`);
            //if status = discharge
            const response = yield (0, theatreadmission_1.readonethearteadmission)({ _id: id }, {}, '');
            // check for availability of bed spaces in ward only for admitted
            if (!response) {
                throw new Error(`Theatre Admission donot ${config_1.default.error.erroralreadyexit}`);
            }
            var theatre = yield (0, theatre_1.readonetheatremanagement)({ _id: response === null || response === void 0 ? void 0 : response.referedtheatre }, {});
            if (!theatre) {
                // return error
                throw new Error(`Theatre donot ${config_1.default.error.erroralreadyexit}`);
            }
            var transftertotheatre = yield (0, theatre_1.readonetheatremanagement)({ _id: transfterto }, {});
            if (transfterto && status == config_1.default.admissionstatus[2] && !transftertotheatre) {
                // return error
                throw new Error(`Theatre to be transfered donot  ${config_1.default.error.erroralreadyexit}`);
            }
            if (transfterto && status == config_1.default.admissionstatus[2] && transftertotheatre.vacantbed < 1) {
                throw new Error(`${transftertotheatre.theatrename}  ${config_1.default.error.errorvacantspace}`);
            }
            if ((status == config_1.default.admissionstatus[1] || status == config_1.default.admissionstatus[3]) && theatre.vacantbed < 1) {
                throw new Error(`${theatre.theatrename}  ${config_1.default.error.errorvacantspace}`);
            }
            //validate if permitted base on status
            //const status= response?.status == configuration.status[0]? configuration.status[1]: configuration.status[0];
            const queryresult = yield (0, theatreadmission_1.updatethearteadmission)(id, { status });
            console.log(status);
            //if status is equal to admit reduce  ward count
            if (status == config_1.default.admissionstatus[1] || status == config_1.default.admissionstatus[3]) {
                yield (0, theatre_1.updatetheatremanagement)(queryresult.referedtheatre, { $inc: { occupiedbed: 1, vacantbed: -1 } });
            }
            // status is equal to  totransfer reduce target ward and increase source ward
            else if (status == config_1.default.admissionstatus[2]) {
                yield (0, theatreadmission_1.updatethearteadmission)(id, { status, referedtheatre: transfterto, previoustheatre: queryresult.referedtheatre });
            }
            else if (status == config_1.default.admissionstatus[5]) {
                yield (0, theatre_1.updatetheatremanagement)(queryresult.referedtheatre, { $inc: { occupiedbed: -1, vacantbed: 1 } });
            }
            // status is equal to  transfer reduce target ward and increase 
            if (status == config_1.default.admissionstatus[3]) {
                yield (0, theatre_1.updatetheatremanagement)(queryresult.previoustheatre, { $inc: { occupiedbed: -1, vacantbed: 1 } });
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
// todays theatre
function gettheatreadmissiontoday(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get today's date
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Set the time to 00:00:00
        // Get the start of tomorrow to set the range for "today"
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999); // Set the time to 23:59:59  
        try {
            const queryresult = yield (0, theatreadmission_1.readallthearteadmission)({ appointmentdate: { $gte: startOfDay, $lte: endOfDay } }, {}, 'referedtheatre', 'patient', 'conscent');
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
