"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vitalcharts_1 = require("../controllers/vitalcharts/vitalcharts");
const bloodmonitoringchart_1 = require("../controllers/bloodmonitoring/bloodmonitoringchart");
const medicationcharts_1 = require("../controllers/medicationcharts/medicationcharts");
const progressreport_1 = require("../controllers/progressreport/progressreport");
const insulin_1 = require("../controllers/insulin/insulin");
const tubefeedingchart_1 = require("../controllers/tubefeedingchart/tubefeedingchart");
const fluidbalance_1 = require("../controllers/fluidbalance/fluidbalance");
const nursingcareplan_1 = require("../controllers/nursingcareplan/nursingcareplan");
const dailywardreport_1 = require("../controllers/dailywardreport/dailywardreport");
const router = express_1.default.Router();
router.post('/createvitalchart/:id', vitalcharts_1.createvitalchart);
router.get('/readallvitalchartbyadmission/:admission', vitalcharts_1.readallvitalchartByAdmission);
router.get('/readAllvitalsbypatient/:patient', vitalcharts_1.readAllvitalsByPatient);
router.put('/updatevitalchart/:id', vitalcharts_1.updatevitalchart);
//medical charts
router.post('/createmedicationchart/:id', medicationcharts_1.createmedicationchart);
router.post('/createmedicationchartfornursingcare/:id', medicationcharts_1.createmedicationchartfornursingcare);
router.get('/readallmedicationchartByAdmission/:admission', medicationcharts_1.readallmedicationchartByAdmission);
router.get('/readAllmedicationchartsByPatient/:patient', medicationcharts_1.readAllmedicationByPatient);
router.put('/updatemedicalchart/:id', medicationcharts_1.updatemedicalchart);
//progress report
router.post('/createprogressreport/:id', progressreport_1.createprogressreport);
router.get('/readallprogressreportByAdmission/:admission', progressreport_1.readallprogressreportByAdmission);
router.get('/readAllprogressreportByPatient/:patient', progressreport_1.readAllprogressreportByPatient);
router.put('/updateprogressreport/:id', progressreport_1.updateprogressreport);
//insulin chart
router.post('/createinsulin/:id', insulin_1.createinsulin);
router.get('/readallinsulinByAdmission/:admission', insulin_1.readallinsulinByAdmission);
router.get('/readAllinsulinByPatient/:patient', insulin_1.readAllinsulinByPatient);
router.put('/updateinsulin/:id', insulin_1.updateinsulin);
//tubefeedingchart
router.post('/createtubefeedingchart/:id', tubefeedingchart_1.createtubefeedingchart);
router.get('/readalltubefeedingchartbyadmission/:admission', tubefeedingchart_1.readalltubefeedingchartByAdmission);
router.get('/readAlltubefeedingchartbypatient/:patient', tubefeedingchart_1.readAlltubefeedingchartByPatient);
router.put('/updatetubefeedingchart/:id', tubefeedingchart_1.updatetubefeedingchart);
//fluidbalance
router.post('/createfluidbalance/:id', fluidbalance_1.createfluidbalance);
router.get('/readallfluidbalancebyadmission/:admission', fluidbalance_1.readallfluidbalanceByAdmission);
router.get('/readAllfluidbalancebypatient/:patient', fluidbalance_1.readAllfluidbalanceByPatient);
router.put('/updatefluidbalance/:id', fluidbalance_1.updatefluidbalance);
//blood monntoring
router.post('/createbloodmonitoring/:id', bloodmonitoringchart_1.createbloodmonitorings);
router.get('/readallbloodmonitoringbyadmission/:admission', bloodmonitoringchart_1.readallbloodmonitoringByAdmission);
router.get('/readallbloodmonitoringbypatient/:patient', bloodmonitoringchart_1.readAllbloodmonitoringByPatient);
router.put('/updatebloodmonitoring/:id', bloodmonitoringchart_1.updatebloodmonitorings);
//nursing care plan
router.post('/createnursingcareplans/:id', nursingcareplan_1.createnursingcareplans);
router.put('/updatenursingcareplans/:id', nursingcareplan_1.updatenursingcareplans);
router.get('/readallnursingcareplanbypatient/:patient', nursingcareplan_1.readAllnursingcareplanByPatient);
router.get('/readallnursingcarebyadmission/:admission', nursingcareplan_1.readallnursingcareByAdmission);
//daily word report
router.post('/createdailywardreport', dailywardreport_1.createdailywardreport);
router.put('/updatedailywardreport/:id', dailywardreport_1.updatedailywardreport);
router.get('/readalldailywardreports', dailywardreport_1.readalldailywardreports);
router.get('/readalldailywardreportsByward/:ward', dailywardreport_1.readalldailywardreportsByward);
exports.default = router;
