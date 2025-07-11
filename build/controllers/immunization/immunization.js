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
exports.createimmunizations = exports.readAllimmunizationByPatient = void 0;
exports.updateimmunizations = updateimmunizations;
const immunization_1 = require("../../dao/immunization");
const patientmanagement_1 = require("../../dao/patientmanagement");
const otherservices_1 = require("../../utils/otherservices");
const mongoose_1 = __importDefault(require("mongoose"));
const { ObjectId } = mongoose_1.default.Types;
const config_1 = __importDefault(require("../../config"));
/*
export const readallimmunizationByAdmission = async (req:any, res:any) => {
    try {
     const {admission} = req.params;
      const queryresult = await readallimmunization({admission},{},'patient');
      res.status(200).json({
        queryresult,
        status:true
      });
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };
  */
//get lab order by patient
const readAllimmunizationByPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //const {clinic} = (req.user).user;
        const { patient } = req.params;
        //const queryresult = await readalllab({patient:id,department:clinic},{},'patient','appointment','payment');
        const queryresult = yield (0, immunization_1.readallimmunization)({ patient }, {}, 'patient');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readAllimmunizationByPatient = readAllimmunizationByPatient;
//create vital charts
// Create a new schedule
const createimmunizations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { firstName, lastName } = (req.user).user;
        req.body.staffname = `${firstName} ${lastName}`;
        var { vaccinationlocation, outreachMedications, adverseEffectVaccine, isFullyImmunized, isZeroDoseChild, vaccination, medicationgiventomanageadverseeffect, adverseeffectseverity, anynotedadverseeffect, schedule, vaccinecode, vaccinename, vaccinetype, manufacturer, batchno, expirydate, dose, doseamount, administrationsite, administrationroute, consent, immunizationstatus, comment, onsetdateofreaction, reactcode, reporter, reportingsource, staffname } = req.body;
        (0, otherservices_1.validateinputfaulsyvalue)({ vaccinationlocation, outreachMedications, adverseEffectVaccine, vaccination, schedule, expirydate, dose, doseamount, administrationsite, administrationroute, consent, immunizationstatus, comment, onsetdateofreaction, reactcode, reporter, reportingsource, staffname });
        //frequency must inlcude
        //route must contain allowed options
        const patientrecord = yield (0, patientmanagement_1.readonepatient)({ _id: id }, {}, '', '');
        //console.log(admissionrecord);   
        if (!patientrecord) {
            throw new Error(`Patient donot ${config_1.default.error.erroralreadyexit}`);
        }
        const queryresult = yield (0, immunization_1.createimmunization)({ patient: patientrecord._id, vaccinationlocation, outreachMedications, adverseEffectVaccine, isFullyImmunized, isZeroDoseChild, vaccination, medicationgiventomanageadverseeffect, adverseeffectseverity, anynotedadverseeffect, schedule, vaccinecode, vaccinename, vaccinetype, manufacturer, batchno, expirydate, dose, doseamount, administrationsite, administrationroute, consent, immunizationstatus, comment, onsetdateofreaction, reactcode, reporter, reportingsource, staffname });
        res.status(200).json({ queryresult, status: true });
    }
    catch (e) {
        res.status(403).json({ status: false, msg: e.message });
    }
});
exports.createimmunizations = createimmunizations;
//insulin
function updateimmunizations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get id
            const { id } = req.params;
            const { firstName, lastName } = (req.user).user;
            req.body.staffname = `${firstName} ${lastName}`;
            var { vaccinationlocation, outreachMedications, adverseEffectVaccine, isFullyImmunized, isZeroDoseChild, vaccination, medicationgiventomanageadverseeffect, adverseeffectseverity, anynotedadverseeffect, schedule, vaccinecode, vaccinename, vaccinetype, manufacturer, batchno, expirydate, dose, doseamount, administrationsite, administrationroute, consent, immunizationstatus, comment, onsetdateofreaction, reactcode, reporter, reportingsource, staffname } = req.body;
            (0, otherservices_1.validateinputfaulsyvalue)({ vaccinationlocation, outreachMedications, adverseEffectVaccine, vaccination, schedule, expirydate, dose, doseamount, administrationsite, administrationroute, consent, immunizationstatus, comment, onsetdateofreaction, reactcode, reporter, reportingsource, staffname });
            var queryresult = yield (0, immunization_1.updateimmunization)(id, { vaccinationlocation, outreachMedications, adverseEffectVaccine, isFullyImmunized, isZeroDoseChild, vaccination, medicationgiventomanageadverseeffect, adverseeffectseverity, anynotedadverseeffect, schedule, vaccinecode, vaccinename, vaccinetype, manufacturer, batchno, expirydate, dose, doseamount, administrationsite, administrationroute, consent, immunizationstatus, comment, onsetdateofreaction, reactcode, reporter, reportingsource, staffname });
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
