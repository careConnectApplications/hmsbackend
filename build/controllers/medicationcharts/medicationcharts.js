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
exports.createmedicationchart = exports.createmedicationchartfornursingcare = exports.readAllmedicationByPatient = exports.readallmedicationchartByAdmission = void 0;
exports.updatemedicalchart = updatemedicalchart;
const medicationcharts_1 = require("../../dao/medicationcharts");
const prescription_1 = require("../../dao/prescription");
const admissions_1 = require("../../dao/admissions");
const patientmanagement_1 = require("../../dao/patientmanagement");
const otherservices_1 = require("../../utils/otherservices");
const mongoose_1 = __importDefault(require("mongoose"));
const { ObjectId } = mongoose_1.default.Types;
const config_1 = __importDefault(require("../../config"));
// Get all lab records
const readallmedicationchartByAdmission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { admission } = req.params;
        const queryresult = yield (0, medicationcharts_1.readallmedicationcharts)({ $or: [{ admission: admission }, { patient: admission }] }, {}, 'prescription', '');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readallmedicationchartByAdmission = readallmedicationchartByAdmission;
//get lab order by patient
const readAllmedicationByPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //const {clinic} = (req.user).user;
        const { patient } = req.params;
        //const queryresult = await readalllab({patient:id,department:clinic},{},'patient','appointment','payment');
        const queryresult = yield (0, medicationcharts_1.readallmedicationcharts)({ patient }, {}, 'patient', 'admission');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readAllmedicationByPatient = readAllmedicationByPatient;
const createmedicationchartfornursingcare = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // admission,patient,height,weight,temperature,heartrate,bloodpressuresystolic,bloodpressurediastolic,respiration,saturation,bmi,painscore,rbs,gcs,wardname,staffname,
        const { id } = req.params;
        const { firstName, lastName } = (req.user).user;
        const staffname = `${firstName} ${lastName}`;
        // Get prescription ID from req.body
        const { prescription } = req.body;
        if (!prescription) {
            throw new Error("Prescription ID is required");
        }
        // Read prescription record to extract medication details
        const prescriptionRecord = yield (0, prescription_1.readoneprescription)({ _id: prescription }, {}, '', '', '');
        if (!prescriptionRecord) {
            throw new Error("Prescription not found");
        }
        // Extract medication fields from prescription
        const drug = prescriptionRecord.prescription || "";
        const note = prescriptionRecord.prescriptionnote || ((_a = prescriptionRecord.doctorsnote) === null || _a === void 0 ? void 0 : _a.join("; ")) || "";
        const dose = prescriptionRecord.dosage || "";
        const frequency = prescriptionRecord.frequency || "";
        const route = prescriptionRecord.route || "";
        // Validate extracted fields
        //frequency must inlcude
        //route must contain allowed options
        const foundPatient = yield (0, patientmanagement_1.readonepatient)({ _id: id }, {}, '', '');
        var admissionrecord;
        if (foundPatient) {
            admissionrecord = {
                patient: id,
                referedward: new ObjectId(),
                _id: new ObjectId(),
            };
        }
        else {
            admissionrecord = yield (0, admissions_1.readoneadmission)({ _id: id }, {}, '');
            if (!admissionrecord) {
                throw new Error(`Admission donot ${config_1.default.error.erroralreadyexit}`);
            }
        }
        const queryresult = yield (0, medicationcharts_1.createmedicationcharts)({ referedward: admissionrecord.referedward, prescription, admission: admissionrecord._id, patient: admissionrecord.patient, drug, note, dose, frequency, route, staffname });
        //find prescription and change status
        yield (0, prescription_1.updateprescription)(prescription, { servedstatus: config_1.default.servedstatus[0] });
        //configuration.servedstatus[]
        res.status(200).json({ queryresult, status: true });
    }
    catch (e) {
        res.status(403).json({ status: false, msg: e.message });
    }
});
exports.createmedicationchartfornursingcare = createmedicationchartfornursingcare;
//create vital charts
// Create a new schedule
const createmedicationchart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // admission,patient,height,weight,temperature,heartrate,bloodpressuresystolic,bloodpressurediastolic,respiration,saturation,bmi,painscore,rbs,gcs,wardname,staffname,
        const { id } = req.params;
        const { firstName, lastName } = (req.user).user;
        req.body.staffname = `${firstName} ${lastName}`;
        var { drug, note, dose, frequency, route, staffname, prescription } = req.body;
        (0, otherservices_1.validateinputfaulsyvalue)({ drug, note, dose, frequency, route, staffname });
        //frequency must inlcude
        //route must contain allowed options
        const foundPatient = yield (0, patientmanagement_1.readonepatient)({ _id: id }, {}, '', '');
        var admissionrecord;
        if (foundPatient) {
            admissionrecord = {
                patient: id,
                referedward: new ObjectId(),
                _id: new ObjectId(),
            };
        }
        else {
            admissionrecord = yield (0, admissions_1.readoneadmission)({ _id: id }, {}, '');
            if (!admissionrecord) {
                throw new Error(`Admission donot ${config_1.default.error.erroralreadyexit}`);
            }
        }
        const queryresult = yield (0, medicationcharts_1.createmedicationcharts)({ referedward: admissionrecord.referedward, prescription, admission: admissionrecord._id, patient: admissionrecord.patient, drug, note, dose, frequency, route, staffname });
        //find prescription and change status
        yield (0, prescription_1.updateprescription)(prescription, { servedstatus: config_1.default.servedstatus[0] });
        //configuration.servedstatus[]
        res.status(200).json({ queryresult, status: true });
    }
    catch (e) {
        res.status(403).json({ status: false, msg: e.message });
    }
});
exports.createmedicationchart = createmedicationchart;
//update medical charts
function updatemedicalchart(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get id
            const { id } = req.params;
            const { firstName, lastName } = (req.user).user;
            req.body.staffname = `${firstName} ${lastName}`;
            var { drug, note, dose, frequency, route, staffname } = req.body;
            (0, otherservices_1.validateinputfaulsyvalue)({ drug, note, dose, frequency, route, staffname });
            var queryresult = yield (0, medicationcharts_1.updatemedicationcharts)(id, { drug, note, dose, frequency, route, staffname });
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
