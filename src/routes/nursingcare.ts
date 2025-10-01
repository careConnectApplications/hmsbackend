import express from 'express';
import {protect} from "../utils/middleware";
import {createvitalchart,readAllvitalsByPatient,readallvitalchartByAdmission,updatevitalchart} from '../controllers/vitalcharts/vitalcharts';
import {createbloodmonitorings,readAllbloodmonitoringByPatient,readallbloodmonitoringByAdmission,updatebloodmonitorings} from '../controllers/bloodmonitoring/bloodmonitoringchart';
import {createmedicationchartfornursingcare,createmedicationchart,readAllmedicationByPatient,readallmedicationchartByAdmission,updatemedicalchart} from '../controllers/medicationcharts/medicationcharts';
import {createprogressreport,readAllprogressreportByPatient,readallprogressreportByAdmission,updateprogressreport} from '../controllers/progressreport/progressreport';
import {createinsulin,readAllinsulinByPatient,readallinsulinByAdmission,updateinsulin} from '../controllers/insulin/insulin';
import {createtubefeedingchart,readAlltubefeedingchartByPatient,readalltubefeedingchartByAdmission,updatetubefeedingchart} from '../controllers/tubefeedingchart/tubefeedingchart';
import {createfluidbalance,readAllfluidbalanceByPatient,readallfluidbalanceByAdmission,updatefluidbalance} from '../controllers/fluidbalance/fluidbalance';
import {readAllnursingcareplanByPatient,readallnursingcareByAdmission, updatenursingcareplans, createnursingcareplans} from '../controllers/nursingcareplan/nursingcareplan';
import {readalldailywardreports,readalldailywardreportsByward, createdailywardreport, updatedailywardreport} from '../controllers/dailywardreport/dailywardreport';
const router = express.Router();

router.post('/createvitalchart/:id', createvitalchart);
router.get('/readallvitalchartbyadmission/:admission', readallvitalchartByAdmission);
router.get('/readAllvitalsbypatient/:patient', readAllvitalsByPatient);
router.put('/updatevitalchart/:id', updatevitalchart);


//medical charts
router.post('/createmedicationchart/:id', createmedicationchart);
router.post('/createmedicationchartfornursingcare/:id', createmedicationchartfornursingcare);
router.get('/readallmedicationchartByAdmission/:admission', readallmedicationchartByAdmission);
router.get('/readAllmedicationchartsByPatient/:patient', readAllmedicationByPatient);
router.put('/updatemedicalchart/:id', updatemedicalchart);

//progress report
router.post('/createprogressreport/:id', createprogressreport);
router.get('/readallprogressreportByAdmission/:admission', readallprogressreportByAdmission);
router.get('/readAllprogressreportByPatient/:patient', readAllprogressreportByPatient);
router.put('/updateprogressreport/:id', updateprogressreport);

//insulin chart
router.post('/createinsulin/:id', createinsulin);
router.get('/readallinsulinByAdmission/:admission', readallinsulinByAdmission);
router.get('/readAllinsulinByPatient/:patient', readAllinsulinByPatient);
router.put('/updateinsulin/:id', updateinsulin);

//tubefeedingchart
router.post('/createtubefeedingchart/:id', createtubefeedingchart);
router.get('/readalltubefeedingchartbyadmission/:admission', readalltubefeedingchartByAdmission);
router.get('/readAlltubefeedingchartbypatient/:patient', readAlltubefeedingchartByPatient);
router.put('/updatetubefeedingchart/:id', updatetubefeedingchart);

//fluidbalance
router.post('/createfluidbalance/:id', createfluidbalance);
router.get('/readallfluidbalancebyadmission/:admission', readallfluidbalanceByAdmission);
router.get('/readAllfluidbalancebypatient/:patient', readAllfluidbalanceByPatient);
router.put('/updatefluidbalance/:id', updatefluidbalance);

//blood monntoring
router.post('/createbloodmonitoring/:id', createbloodmonitorings);
router.get('/readallbloodmonitoringbyadmission/:admission', readallbloodmonitoringByAdmission);
router.get('/readallbloodmonitoringbypatient/:patient', readAllbloodmonitoringByPatient);
router.put('/updatebloodmonitoring/:id', updatebloodmonitorings);

//nursing care plan
router.post('/createnursingcareplans/:id', createnursingcareplans);
router.put('/updatenursingcareplans/:id', updatenursingcareplans);
router.get('/readallnursingcareplanbypatient/:patient', readAllnursingcareplanByPatient);
router.get('/readallnursingcarebyadmission/:admission', readallnursingcareByAdmission);

//daily word report
router.post('/createdailywardreport', createdailywardreport);
router.put('/updatedailywardreport/:id', updatedailywardreport);
router.get('/readalldailywardreports', readalldailywardreports);
router.get('/readalldailywardreportsByward/:ward', readalldailywardreportsByward);






export default router;

