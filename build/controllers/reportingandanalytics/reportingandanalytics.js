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
exports.reportsummary = exports.cashierreport = exports.reports = void 0;
const config_1 = __importDefault(require("../../config"));
const reports_1 = require("../../dao/reports");
const payment_1 = require("../../dao/payment");
const settings_1 = require("../settings/settings");
const moment_1 = __importDefault(require("moment"));
function buildGeneralAttendanceTable(appointments) {
    const counts = {
        "0-28d": { male: 0, female: 0, total: 0 },
        "1-11m": { male: 0, female: 0, total: 0 },
        "1-4y": { male: 0, female: 0, total: 0 },
        "5-9y": { male: 0, female: 0, total: 0 },
        "10-19y": { male: 0, female: 0, total: 0 },
        "20y+": { male: 0, female: 0, total: 0 },
    };
    let grandMale = 0;
    let grandFemale = 0;
    let grandTotal = 0;
    appointments.forEach((item) => {
        const patientObj = item.patient || {};
        const genderStr = (patientObj.gender || item.gender || "").toString().trim().toLowerCase();
        const isMale = genderStr.startsWith("m");
        const isFemale = genderStr.startsWith("f");
        const appDate = item.appointmentdate ? (0, moment_1.default)(item.appointmentdate) : (0, moment_1.default)();
        const dob = patientObj.dateOfBirth || item.dateOfBirth;
        let ageInDays = null;
        let ageInMonths = null;
        let ageInYears = null;
        if (dob) {
            const dobMoment = (0, moment_1.default)(dob, ["YYYY-MM-DD", "DD/MM/YYYY", "YYYY/MM/DD", moment_1.default.ISO_8601]);
            if (dobMoment.isValid()) {
                ageInDays = appDate.diff(dobMoment, "days");
                ageInMonths = appDate.diff(dobMoment, "months");
                ageInYears = appDate.diff(dobMoment, "years");
            }
        }
        if (ageInYears === null && (patientObj.age || item.age)) {
            const parsedAge = parseInt((patientObj.age || item.age).toString(), 10);
            if (!isNaN(parsedAge)) {
                ageInYears = parsedAge;
            }
        }
        let catKey = "";
        if (ageInDays !== null && ageInDays >= 0 && ageInDays <= 28) {
            catKey = "0-28d";
        }
        else if (ageInMonths !== null && ageInMonths >= 0 && ageInMonths <= 11) {
            catKey = "1-11m";
        }
        else if (ageInYears !== null) {
            if (ageInYears >= 1 && ageInYears <= 4) {
                catKey = "1-4y";
            }
            else if (ageInYears >= 5 && ageInYears <= 9) {
                catKey = "5-9y";
            }
            else if (ageInYears >= 10 && ageInYears <= 19) {
                catKey = "10-19y";
            }
            else if (ageInYears >= 20) {
                catKey = "20y+";
            }
        }
        if (catKey && counts[catKey]) {
            if (isMale) {
                counts[catKey].male++;
                grandMale++;
            }
            else if (isFemale) {
                counts[catKey].female++;
                grandFemale++;
            }
            counts[catKey].total++;
            grandTotal++;
        }
    });
    const table = [
        { ageGroup: "0-28d", M: counts["0-28d"].male, F: counts["0-28d"].female, male: counts["0-28d"].male, female: counts["0-28d"].female, total: counts["0-28d"].total, TOTAL: counts["0-28d"].total },
        { ageGroup: "1-11m", M: counts["1-11m"].male, F: counts["1-11m"].female, male: counts["1-11m"].male, female: counts["1-11m"].female, total: counts["1-11m"].total, TOTAL: counts["1-11m"].total },
        { ageGroup: "1-4y", M: counts["1-4y"].male, F: counts["1-4y"].female, male: counts["1-4y"].male, female: counts["1-4y"].female, total: counts["1-4y"].total, TOTAL: counts["1-4y"].total },
        { ageGroup: "5-9y", M: counts["5-9y"].male, F: counts["5-9y"].female, male: counts["5-9y"].male, female: counts["5-9y"].female, total: counts["5-9y"].total, TOTAL: counts["5-9y"].total },
        { ageGroup: "10-19y", M: counts["10-19y"].male, F: counts["10-19y"].female, male: counts["10-19y"].male, female: counts["10-19y"].female, total: counts["10-19y"].total, TOTAL: counts["10-19y"].total },
        { ageGroup: "20y+", M: counts["20y+"].male, F: counts["20y+"].female, male: counts["20y+"].male, female: counts["20y+"].female, total: counts["20y+"].total, TOTAL: counts["20y+"].total },
        { ageGroup: "TOTAL", M: grandMale, F: grandFemale, male: grandMale, female: grandFemale, total: grandTotal, TOTAL: grandTotal }
    ];
    return table;
}
const reports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //paymentcategory
        //cashieremail
        var { querygroup, querytype, startdate, enddate } = req.params;
        if (!querygroup) {
            throw new Error(`querygroup ${config_1.default.error.errorisrequired}`);
        }
        if (!startdate || !enddate) {
            var todaydate = new Date();
            enddate = todaydate;
            startdate = new Date(todaydate.getFullYear(), todaydate.getMonth() - 6, todaydate.getDate());
        }
        else {
            startdate = new Date(startdate);
            enddate = new Date(enddate);
        }
        const financialMatch = (querygroup && querygroup !== "All") ? { paymentcategory: querygroup } : {};
        const reportbyfinancialreport = [
            {
                $match: {
                    $and: [
                        financialMatch,
                        { updatedAt: { $gt: startdate, $lt: enddate } }
                    ]
                }
            },
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            }
        ];
        //admission
        //referedward
        //status
        //appointment
        //clinic
        /*
        patient: {
              type: Schema.Types.ObjectId,
              ref: "Patientsmanagement",
              default: null,
            },
        
            referedward:
          {
            type: Schema.Types.ObjectId,
            ref: "Wardmanagement",
            default: null,
          },
        */
        const wardMatch = (querygroup && querygroup !== "All") ? { "referedward.wardname": querygroup } : {};
        const reportbyadmissionreport = [
            {
                $match: {
                    referddate: { $gte: startdate, $lte: enddate }
                }
            },
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "wardmanagements",
                    localField: "referedward",
                    foreignField: "_id",
                    as: "referedward",
                },
            },
            {
                $unwind: {
                    path: "$referedward",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: wardMatch
            },
            {
                $project: {
                    wardName: { $ifNull: ["$referedward.wardname", "Unassigned Ward"] },
                    referddate: 1,
                    patientSurname: "$patient.lastName",
                    patientFirstName: "$patient.firstName",
                    patientNumber: "$patient.MRN",
                    sex: "$patient.gender",
                    age: "$patient.age",
                    alldiagnosis: 1,
                    dischargereason: 1,
                    dischargedate: 1,
                    status: 1,
                    patient: 1,
                    referedward: 1,
                    doctorname: 1,
                    staffname: 1,
                    admissionid: 1,
                    admittospecialization: 1
                }
            },
            {
                $sort: { wardName: 1, referddate: 1 }
            }
        ];
        const clinicMatch = (querygroup && querygroup !== "All") ? { clinic: querygroup } : {};
        const reportbyappointmentreport = [
            {
                $match: {
                    $and: [
                        clinicMatch,
                        { appointmentdate: { $gte: startdate, $lte: enddate } }
                    ]
                }
            },
            {
                $sort: { appointmentdate: 1 }
            },
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "labs",
                    localField: "lab",
                    foreignField: "_id",
                    as: "labDetails",
                },
            }
        ];
        const reportbyhmoreport = [
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $and: [{ "patient.HMOName": querygroup }, {
                            createdAt: { $gt: startdate, $lt: enddate }
                        }]
                }
            },
        ];
        const appointmentreportbyhmoreport = [
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $and: [{ "patient.HMOName": querygroup }, {
                            appointmentdate: { $gt: startdate, $lt: enddate }
                        }]
                }
            },
        ];
        const secondaryservice = [
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { $and: [{ "patient.patienttype": config_1.default.patienttype[1] }, { createdAt: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $addFields: {
                    servicetype: {
                        $ifNull: ["$testname", "$appointmenttype"]
                    }
                }
            },
            {
                $project: {
                    servicetype: 1,
                    patient: 1
                }
            }
        ];
        const proceduresecondaryservice = [
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { $and: [{ "patient.patienttype": config_1.default.patienttype[1] }, { createdAt: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $addFields: {
                    servicetype: {
                        $reduce: {
                            input: { $ifNull: ["$procedure", []] },
                            initialValue: "",
                            in: {
                                $cond: {
                                    if: { $eq: ["$$value", ""] },
                                    then: "$$this",
                                    else: { $concat: ["$$value", ",", "$$this"] }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    servicetype: 1,
                    patient: 1
                }
            }
        ];
        const patientsecondaryservice = [
            {
                $match: { $and: [{ patienttype: config_1.default.patienttype[1] }, { createdAt: { $gt: startdate, $lt: enddate } }] }
            }
        ];
        const pharmacysecondaryservice = [
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { $and: [{ pharmacy: querygroup }, { "patient.patienttype": config_1.default.patienttype[1] }, { createdAt: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $addFields: {
                    servicetype: "$prescription"
                }
            },
            {
                $project: {
                    servicetype: 1,
                    patient: 1
                }
            }
        ];
        var queryresult;
        //var c = await configuration.settings2();
        let { reports } = yield (0, settings_1.settings)();
        //Financial report
        if (querytype == reports[0].querytype) {
            queryresult = yield (0, reports_1.readpaymentaggregate)(reportbyfinancialreport);
        }
        else if (querytype == reports[1].querytype || querytype == "outpatientregister" || querytype == "outpatient register" || querytype == "appointmentreport") {
            const rawAppointments = yield (0, reports_1.readappointmentaggregate)(reportbyappointmentreport);
            queryresult = rawAppointments.map((item, index) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const patientObj = item.patient || {};
                const surname = patientObj.lastName || item.lastName || '';
                const firstname = patientObj.firstName || item.firstName || '';
                const fullName = `${surname} ${firstname}`.trim();
                const attendanceType = item.appointmenttype || "";
                let complaint = "";
                if (((_a = item.clinicalencounter) === null || _a === void 0 ? void 0 : _a.clinicalnote) && Array.isArray(item.clinicalencounter.clinicalnote) && item.clinicalencounter.clinicalnote.length > 0) {
                    complaint = item.clinicalencounter.clinicalnote.filter(Boolean).join(", ");
                }
                if (!complaint) {
                    complaint = ((_c = (_b = item.encounter) === null || _b === void 0 ? void 0 : _b.history) === null || _c === void 0 ? void 0 : _c.presentingcomplaints)
                        || item.reason
                        || ((_d = item.encounter) === null || _d === void 0 ? void 0 : _d.presentingcomplaint)
                        || "";
                }
                let diagnosisStr = "";
                if (((_e = item.clinicalencounter) === null || _e === void 0 ? void 0 : _e.diagnosisicd10) && Array.isArray(item.clinicalencounter.diagnosisicd10) && item.clinicalencounter.diagnosisicd10.length > 0) {
                    diagnosisStr = item.clinicalencounter.diagnosisicd10.filter(Boolean).join(", ");
                }
                if (!diagnosisStr && item.diagnosis) {
                    diagnosisStr = item.diagnosis;
                }
                if (!diagnosisStr && ((_g = (_f = item.encounter) === null || _f === void 0 ? void 0 : _f.assessmentdiagnosis) === null || _g === void 0 ? void 0 : _g.diagosis)) {
                    diagnosisStr = item.encounter.assessmentdiagnosis.diagosis;
                }
                if (!diagnosisStr && ((_h = item.clinicalencounter) === null || _h === void 0 ? void 0 : _h.diagnosisnote) && Array.isArray(item.clinicalencounter.diagnosisnote) && item.clinicalencounter.diagnosisnote.length > 0) {
                    diagnosisStr = item.clinicalencounter.diagnosisnote.filter(Boolean).join(", ");
                }
                let labStr = "";
                const labResultsArray = [];
                if (item.labDetails && Array.isArray(item.labDetails) && item.labDetails.length > 0) {
                    const resultsList = [];
                    item.labDetails.forEach((lab) => {
                        if (lab.testresult && Array.isArray(lab.testresult) && lab.testresult.length > 0) {
                            lab.testresult.forEach((tr) => {
                                if (tr && tr.result) {
                                    const entry = {
                                        subcomponent: tr.subcomponent || "",
                                        result: tr.result,
                                        formatted: tr.subcomponent ? `${tr.subcomponent}: ${tr.result}` : tr.result
                                    };
                                    labResultsArray.push(entry);
                                    resultsList.push(entry.formatted);
                                }
                            });
                        }
                    });
                    if (resultsList.length > 0) {
                        labStr = resultsList.join(", ");
                    }
                }
                return Object.assign(Object.assign({}, item), { patient: patientObj, sn: index + 1, date: item.appointmentdate, nameOfPt: fullName, patientName: fullName, ptNumber: patientObj.MRN || item.MRN || "", patientNumber: patientObj.MRN || item.MRN || "", sex: patientObj.gender || "", age: patientObj.age || "", typeOfAttendance: attendanceType, presentingComplaint: complaint, diagnosis: diagnosisStr, labinvestigation: labStr, labResults: labResultsArray });
            });
        }
        else if (querytype == reports[2].querytype || querytype == "inpatientregister" || querytype == "inpatient register" || querytype == "admissionreport") {
            const rawAdmissions = yield (0, reports_1.readadmissionaggregate)(reportbyadmissionreport);
            queryresult = rawAdmissions.map((item, index) => {
                const diagnosisList = item.alldiagnosis && Array.isArray(item.alldiagnosis)
                    ? item.alldiagnosis.map((d) => d.diagnosis || d.note).filter(Boolean).join(", ")
                    : "";
                const reason = (item.dischargereason || "").toUpperCase();
                const dischargeDateStr = item.dischargedate ? item.dischargedate : null;
                const patientObj = item.patient || {};
                return Object.assign(Object.assign({}, item), { patient: patientObj, sn: index + 1, wardName: item.wardName || "Unassigned Ward", dateOfAdmission: item.referddate, patientName: `${patientObj.lastName || item.patientSurname || ''} ${patientObj.firstName || item.patientFirstName || ''}`.trim(), patientNumber: patientObj.MRN || item.patientNumber || "", sex: patientObj.gender || item.sex || "", age: patientObj.age || item.age || "", diagnosis: diagnosisList, admissionOutcome: {
                        abs: reason.includes("ABS") ? dischargeDateStr : null,
                        disch: reason.includes("DISCH") ? dischargeDateStr : null,
                        ref: reason.includes("REF") ? dischargeDateStr : null,
                        lama: reason.includes("LAMA") ? dischargeDateStr : null,
                        death: (reason.includes("DEATH") || reason.includes("DEAD")) ? dischargeDateStr : null
                    } });
            });
        }
        else if (querytype == reports[3].querytype) {
            queryresult = yield (0, reports_1.readlabaggregate)(reportbyhmoreport);
        }
        else if (querytype == reports[4].querytype) {
            queryresult = yield (0, reports_1.readprocedureaggregate)(reportbyhmoreport);
        }
        else if (querytype == reports[5].querytype) {
            queryresult = yield (0, reports_1.readprescriptionaggregate)(reportbyhmoreport);
        }
        else if (querytype == reports[6].querytype) {
            queryresult = yield (0, reports_1.readappointmentaggregate)(appointmentreportbyhmoreport);
        }
        else if (querytype == reports[7].querytype) {
            queryresult = yield (0, reports_1.readradiologyaggregate)(reportbyhmoreport);
        }
        else if (querytype == reports[8].querytype && querygroup == reports[8].querygroup[0]) {
            //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
            queryresult = yield (0, reports_1.readappointmentaggregate)(secondaryservice);
        }
        else if (querytype == reports[8].querytype && querygroup == reports[8].querygroup[1]) {
            //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
            queryresult = yield (0, reports_1.readlabaggregate)(secondaryservice);
        }
        /*
        else if(querytype == reports[8].querytype && querygroup ==reports[8].querygroup[2]){
          //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
          queryresult= await readpatientsmanagementaggregate(patientsecondaryservice);
        
        }
          */
        else if (querytype == reports[8].querytype && querygroup == reports[8].querygroup[2]) {
            //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
            queryresult = yield (0, reports_1.readradiologyaggregate)(secondaryservice);
        }
        else if (querytype == reports[8].querytype && querygroup == reports[8].querygroup[3]) {
            //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
            queryresult = yield (0, reports_1.readprocedureaggregate)(proceduresecondaryservice);
        }
        else if (querytype == reports[8].querytype && querygroup == reports[8].querygroup[4]) {
            const [result1, result2, result3] = yield Promise.all([
                (0, reports_1.readprocedureaggregate)(proceduresecondaryservice),
                (0, reports_1.readradiologyaggregate)(secondaryservice),
                (0, reports_1.readlabaggregate)(secondaryservice),
                (0, reports_1.readappointmentaggregate)(secondaryservice)
            ]);
            queryresult = [...result1, ...result2, ...result3];
            //queryresult= await readprocedureaggregate(proceduresecondaryservice);
        }
        else if (querytype == reports[8].querytype) {
            //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
            queryresult = yield (0, reports_1.readprescriptionaggregate)(pharmacysecondaryservice);
        }
        else if (querytype == "generalattendance" || querytype == "general attendance" || querytype == "generalattendanceaggregate" || (reports[9] && querytype == reports[9].querytype)) {
            const rawAppointments = yield (0, reports_1.readappointmentaggregate)(reportbyappointmentreport);
            const table = buildGeneralAttendanceTable(rawAppointments);
            const byUnit = {};
            if (!querygroup || querygroup === "All") {
                const grouped = {};
                rawAppointments.forEach((item) => {
                    const unit = item.clinic || "Unassigned";
                    if (!grouped[unit])
                        grouped[unit] = [];
                    grouped[unit].push(item);
                });
                Object.keys(grouped).forEach((unit) => {
                    byUnit[unit] = buildGeneralAttendanceTable(grouped[unit]);
                });
            }
            queryresult = Object.assign(table, {
                unit: querygroup || "All",
                table: table,
                byUnit: byUnit
            });
        }
        else {
            throw new Error(`querytype ${config_1.default.error.errorisrequired}`);
        }
        res.json({ queryresult, status: true });
    }
    catch (e) {
        console.log(e.message);
        res.json({ status: false, msg: e.message });
    }
});
exports.reports = reports;
// cashier reconcillation
const cashierreport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //find cashier with status
        //paymentcategory
        //cashieremail
        var { startdate, enddate, email } = req.params;
        if (!startdate || !enddate) {
            var todaydate = new Date();
            enddate = todaydate;
            startdate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate());
        }
        else {
            startdate = new Date(startdate);
            enddate = new Date(enddate);
        }
        var query = { cashieremail: email, updatedAt: { $gt: startdate, $lt: enddate } };
        var populatequery = 'patient';
        const cashieraggregatependingpaid = [
            {
                $match: { $and: [{ status: config_1.default.status[3] }, { cashieremail: email }, { updatedAt: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $group: {
                    _id: "$cashieremail", // Group by product
                    totalAmount: { $sum: "$amount" },
                    cashierid: { $first: "$cashierid" }
                }
            },
            {
                $project: {
                    cashieremail: "$_id",
                    totalAmount: 1,
                    cashierid: 1,
                    status: config_1.default.status[3],
                    _id: 0
                }
            }
        ];
        const queryresult = { paymentrecords: (yield (0, payment_1.readallpayment)(query, populatequery)).paymentdetails, paymentsummary: yield (0, reports_1.readpaymentaggregate)(cashieraggregatependingpaid) };
        res.json({
            queryresult,
            status: true,
        });
        //return total  
    }
    catch (e) {
        res.json({ status: false, msg: e.message });
    }
});
exports.cashierreport = cashierreport;
//report summary
const reportsummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("////////////////////////");
        var { querytype, startdate, enddate } = req.params;
        if (!startdate || !enddate) {
            var todaydate = new Date();
            enddate = todaydate;
            startdate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate());
        }
        else {
            startdate = new Date(startdate);
            enddate = new Date(enddate);
        }
        let { summary } = yield (0, settings_1.settings)();
        const financialaggregatepaid = [
            {
                $match: { $and: [{ status: config_1.default.status[3] }, { updatedAt: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $group: {
                    _id: "$paymentcategory", // Group by product
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    paymentcategory: "$_id",
                    totalAmount: 1,
                    status: config_1.default.status[3],
                    _id: 0
                }
            }
        ];
        const financialaggregategrandtotalpaid = [
            {
                $match: { $and: [{ status: config_1.default.status[3] }, { updatedAt: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $group: {
                    _id: null, // Group by product
                    grandtotalAmount: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    grandtotalAmount: 1,
                    _id: 0
                }
            }
        ];
        const financialaggregatependingpaid = [
            {
                $match: { $and: [{ status: config_1.default.status[2] }, { updatedAt: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $group: {
                    _id: "$paymentcategory", // Group by product
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    paymentcategory: "$_id",
                    totalAmount: 1,
                    status: config_1.default.status[2],
                    _id: 0
                }
            }
        ];
        const cashieraggregatepaid = [
            {
                $match: { $and: [{ status: config_1.default.status[3] }, { updatedAt: { $gt: startdate, $lt: enddate } }] }
            },
            /*
            {
                $group: {
                  _id: "$userId",
                  emails: {
                    $push: {
                      $cond: [{ $ne: ["$email", null] }, "$email", "$$REMOVE"]
                    }
                  }
                }
              },
              {
                $addFields: {
                  firstNonNullEmail: { $arrayElemAt: ["$emails", 0] }
                }
              },
              {
                $project: { emails: 0 }
              }
            */
            {
                $group: {
                    _id: "$cashieremail", // Group by product
                    totalAmount: { $sum: "$amount" },
                    cashierid: { $first: "$cashierid" },
                    tempcashiername: {
                        $push: {
                            $cond: [{ $ne: ["$cashiername", null] }, "$cashiername", "$$REMOVE"]
                        }
                    },
                    //cashiername:{$first:"$cashiername"}
                }
            },
            {
                $addFields: {
                    cashiername: { $arrayElemAt: ["$tempcashiername", 0] }
                }
            },
            {
                $project: {
                    cashieremail: "$_id",
                    cashiername: 1,
                    totalAmount: 1,
                    cashierid: 1,
                    status: config_1.default.status[3],
                    _id: 0
                }
            }
        ];
        const cashieraggregatepaidgrandtotal = [
            {
                $match: { $and: [{ status: config_1.default.status[3] }, { updatedAt: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $group: {
                    _id: null, // Group by product
                    grandtotalAmount: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    grandtotalAmount: 1,
                    _id: 0
                }
            }
        ];
        //5 , 6 ,9
        const appointmentaggregatescheduled = [
            {
                $match: {
                    $and: [{ status: config_1.default.status[5] }, {
                            appointmentdate: { $gt: startdate, $lt: enddate }
                        }]
                }
            },
            {
                $group: {
                    _id: "$clinic", // Group by product
                    Numberofappointment: { $sum: 1 },
                }
            },
            {
                $project: {
                    clinic: "$_id",
                    Numberofappointment: 1,
                    status: config_1.default.status[5],
                    _id: 0
                }
            }
        ];
        const appointmentaggregatecomplete = [
            {
                $match: {
                    $and: [{ status: config_1.default.status[6] }, {
                            appointmentdate: { $gt: startdate, $lt: enddate }
                        }]
                }
            },
            {
                $group: {
                    _id: "$clinic", // Group by product
                    Numberofappointment: { $sum: 1 },
                }
            },
            {
                $project: {
                    clinic: "$_id",
                    Numberofappointment: 1,
                    status: config_1.default.status[6],
                    _id: 0
                }
            }
        ];
        const appointmentaggregateinprogress = [
            {
                $match: {
                    $and: [{ status: config_1.default.status[9] }, {
                            appointmentdate: { $gt: startdate, $lt: enddate }
                        }]
                }
            },
            {
                $group: {
                    _id: "$clinic", // Group by product
                    Numberofappointment: { $sum: 1 },
                }
            },
            {
                $project: {
                    clinic: "$_id",
                    Numberofappointment: 1,
                    status: config_1.default.status[9],
                    _id: 0
                }
            }
        ];
        const appointmentaggregatetotalnumberofappointments = [
            {
                $match: { $or: [{ status: config_1.default.status[5] }, { status: config_1.default.status[6] }, { status: config_1.default.status[9] }], appointmentdate: { $gt: startdate, $lt: enddate } }
            },
            {
                $group: {
                    _id: null, // Group by product
                    GrandTotalNumberofappointment: { $sum: 1 },
                }
            },
            {
                $project: {
                    GrandTotalNumberofappointment: 1,
                    _id: 0
                }
            }
        ];
        //3,5,
        const admissionaggregateadmited = [
            {
                $lookup: {
                    from: "wardmanagements",
                    localField: "referedward",
                    foreignField: "_id",
                    as: "referedward",
                },
            },
            {
                $unwind: {
                    path: "$referedward",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { $and: [{ status: config_1.default.admissionstatus[1] }, { referddate: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $group: {
                    _id: "$referedward.wardname", // Group by product
                    Numberofadmission: { $sum: 1 },
                }
            },
            {
                $project: {
                    wardname: "$_id",
                    Numberofadmission: 1,
                    status: config_1.default.admissionstatus[1],
                    _id: 0
                }
            }
        ];
        const admissionaggregatetransfered = [
            {
                $lookup: {
                    from: "wardmanagements",
                    localField: "referedward",
                    foreignField: "_id",
                    as: "referedward",
                },
            },
            {
                $unwind: {
                    path: "$referedward",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { $and: [{ status: config_1.default.admissionstatus[3] }, { referddate: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $group: {
                    _id: "$referedward.wardname", // Group by product
                    Numberofadmission: { $sum: 1 },
                }
            },
            {
                $project: {
                    wardname: "$_id",
                    Numberofadmission: 1,
                    status: config_1.default.admissionstatus[3],
                    _id: 0
                }
            }
        ];
        const admissionaggregatedischarged = [
            {
                $lookup: {
                    from: "wardmanagements",
                    localField: "referedward",
                    foreignField: "_id",
                    as: "referedward",
                },
            },
            {
                $unwind: {
                    path: "$referedward",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { $and: [{ status: config_1.default.admissionstatus[5] }, { referddate: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $group: {
                    _id: "$referedward.wardname", // Group by product
                    Numberofadmission: { $sum: 1 },
                }
            },
            {
                $project: {
                    wardname: "$_id",
                    Numberofadmission: 1,
                    status: config_1.default.admissionstatus[5],
                    _id: 0
                }
            }
        ];
        const admissionaggregatetotalnumberofadmissions = [
            {
                $match: { $or: [{ status: config_1.default.admissionstatus[1] }, { status: config_1.default.admissionstatus[3] }, { status: config_1.default.admissionstatus[5] }], referddate: { $gt: startdate, $lt: enddate } }
            },
            {
                $group: {
                    _id: null, // Group by product
                    TotalNumberofadmission: { $sum: 1 },
                }
            },
            {
                $project: {
                    TotalNumberofadmission: 1,
                    _id: 0
                }
            }
        ];
        //procedure aggregate
        //9, 7
        const procedureaggregatepaid = [
            {
                $lookup: {
                    from: "payments",
                    localField: "payment",
                    foreignField: "_id",
                    as: "payment",
                },
            },
            {
                $unwind: {
                    path: "$payment",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { "payment.status": config_1.default.status[3], createdAt: { $gt: startdate, $lt: enddate } }
            },
            {
                $group: {
                    _id: "$clinic", // Group by product
                    Numberofprocedures: { $sum: 1 },
                    totalAmount: { $sum: "$payment.amount" }
                }
            },
            {
                $project: {
                    clinic: "$_id",
                    Numberofprocedures: 1,
                    totalAmount: 1,
                    _id: 0
                }
            }
        ];
        const totalprocedureaggregate = [
            {
                $lookup: {
                    from: "payments",
                    localField: "payment",
                    foreignField: "_id",
                    as: "payment",
                },
            },
            {
                $unwind: {
                    path: "$payment",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { "payment.status": config_1.default.status[3], createdAt: { $gt: startdate, $lt: enddate } }
            },
            {
                $group: {
                    _id: null, // Group by product
                    TotalNumberofprocedures: { $sum: 1 },
                    GrandtotalAmount: { $sum: "$payment.amount" }
                }
            },
            {
                $project: {
                    TotalNumberofprocedures: 1,
                    GrandtotalAmount: 1,
                    _id: 0
                }
            }
        ];
        //clinical aggregate
        const clinicalaggregate = [
            {
                $match: { appointmentdate: { $gt: startdate, $lt: enddate } }
            },
            {
                $group: {
                    _id: {
                        $ifNull: ["$clinicalencounter.diagnosisicd10", "No Diagnosis"] // Group by product
                    },
                    Numberofappointment: { $sum: 1 },
                }
            },
            {
                $project: {
                    diagnosis: "$_id",
                    Numberofappointment: 1,
                    _id: 0
                }
            }
        ];
        const aggregatebyhmo = [
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $and: [
                        {
                            "patient.isHMOCover": config_1.default.ishmo[1]
                        },
                        { createdAt: { $gt: startdate, $lt: enddate } }
                    ]
                }
            },
            {
                $group: {
                    _id: { $ifNull: ["$patient.HMOName", "HMO Not Found"] },
                    //"$patient.HMOName",                // Group by product
                    TotalNumber: { $sum: 1 },
                }
            },
            {
                $project: {
                    HMOName: "$_id",
                    TotalNumber: 1,
                    _id: 0
                }
            }
        ];
        ///////procedure ////////
        const appointmentaggregatebyhmo = [
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $and: [
                        {
                            "patient.isHMOCover": config_1.default.ishmo[1]
                        },
                        { appointmentdate: { $gt: startdate, $lt: enddate } }
                    ]
                }
            },
            {
                $group: {
                    _id: { $ifNull: ["$patient.HMOName", "HMO Not Found"] },
                    //"$patient.HMOName",                // Group by product
                    TotalNumber: { $sum: 1 },
                }
            },
            {
                $project: {
                    HMOName: "$_id",
                    TotalNumber: 1,
                    _id: 0
                }
            }
        ];
        const nutritionaggregatechildren0to59thatreceivednutirtion = [
            {
                $match: { createdAt: { $gt: startdate, $lt: enddate } }
            },
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        ageinmonths: "$ageinmonths",
                        typeofvisit: "$typeofvisit",
                        gender: "$patient.gender"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 } // Optional: sort descending by count
            },
            {
                $project: {
                    parameters: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ];
        const nutritionaggregatechildren0to59growingwell = [
            {
                $match: { $and: [{ createdAt: { $gt: startdate, $lt: enddate } }, { growthaccordingtothechildhealthcard: config_1.default.growthaccordingtothechildhealthcard[0] }] }
                //growthaccordingtothechildhealthcard
            },
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        gender: "$patient.gender"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 } // Optional: sort descending by count
            },
            {
                $project: {
                    parameters: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ];
        const nutritionaggregatechildren0to5exclusivebreadstfeeding = [
            {
                $match: { $and: [{ createdAt: { $gt: startdate, $lt: enddate } }, { infactandyoungchildfeeding: config_1.default.infactandyoungchildfeeding[0] }, { ageinmonths: config_1.default.ageinmonths[0] }] }
            },
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        gender: "$patient.gender"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 } // Optional: sort descending by count
            },
            {
                $project: {
                    parameters: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ];
        const nutritionaggregatechildren0to59givenvitaminasupplement = [
            {
                $match: { $and: [{ createdAt: { $gt: startdate, $lt: enddate } }] }
            },
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        gender: "$patient.gender",
                        vitaminasupplement: "$vitaminasupplement"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 } // Optional: sort descending by count
            },
            {
                $project: {
                    parameters: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ];
        const nutritionaggregatechildren12to59receiveddeworming = [
            {
                $match: { $and: [{ createdAt: { $gt: startdate, $lt: enddate } }, { deworming: { $ne: null } }] }
            },
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $unwind: {
                    path: "$patient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        gender: "$patient.gender"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 } // Optional: sort descending by count
            },
            {
                $project: {
                    parameters: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ];
        //children12to59receiveddeworming
        //console.log("//////////", querytype);
        let queryresult;
        if (querytype == summary[0]) {
            //queryresult = {paid: await readpaymentaggregate(financialaggregatepaid), pendingpayment:await readpaymentaggregate(financialaggregatependingpaid)};
            queryresult = { paid: yield (0, reports_1.readpaymentaggregate)(financialaggregatepaid), grandtotal: yield (0, reports_1.readpaymentaggregate)(financialaggregategrandtotalpaid) };
        }
        else if (querytype == summary[1]) {
            //cashier summary
            queryresult = { paid: yield (0, reports_1.readpaymentaggregate)(cashieraggregatepaid), grandtotal: yield (0, reports_1.readpaymentaggregate)(cashieraggregatepaidgrandtotal) };
        }
        else if (querytype == summary[2]) {
            queryresult = { scheduled: yield (0, reports_1.readappointmentaggregate)(appointmentaggregatescheduled), complete: yield (0, reports_1.readappointmentaggregate)(appointmentaggregatecomplete), inprogress: yield (0, reports_1.readappointmentaggregate)(appointmentaggregateinprogress), totalnumberofappointments: yield (0, reports_1.readappointmentaggregate)(appointmentaggregatetotalnumberofappointments) };
            //appointmentaggregatetotalnumberofappointments
            //appointment summary
        }
        else if (querytype == summary[3]) {
            //wardadmission summary
            queryresult = { admited: yield (0, reports_1.readadmissionaggregate)(admissionaggregateadmited), transfered: yield (0, reports_1.readadmissionaggregate)(admissionaggregatetransfered), discharged: yield (0, reports_1.readadmissionaggregate)(admissionaggregatedischarged), totalnumberofadmissions: yield (0, reports_1.readadmissionaggregate)(admissionaggregatetotalnumberofadmissions) };
        }
        else if (querytype == summary[4]) {
            console.log("procedure");
            queryresult = { paid: yield (0, reports_1.readprocedureaggregate)(procedureaggregatepaid), grandtotal: yield (0, reports_1.readprocedureaggregate)(totalprocedureaggregate) };
        }
        else if (querytype == summary[5]) {
            //clinicalaggregate
            queryresult = { clinicalreport: yield (0, reports_1.readappointmentaggregate)(clinicalaggregate) };
        }
        else if (querytype == summary[6]) {
            //clinicalaggregate
            //"hmoappointmentaggregate","hmoradiologyreport"];
            queryresult = {
                hmolabsummary: yield (0, reports_1.readlabaggregate)(aggregatebyhmo),
                hmoproceduresummary: yield (0, reports_1.readprocedureaggregate)(aggregatebyhmo),
                hmopharmacysummary: yield (0, reports_1.readprescriptionaggregate)(aggregatebyhmo),
                hmoradiologysummary: yield (0, reports_1.readradiologyaggregate)(aggregatebyhmo),
                hmsappointmentsummary: yield (0, reports_1.readappointmentaggregate)(appointmentaggregatebyhmo)
            };
        }
        else if (querytype == summary[7]) {
            const [children0to59thatreceivednutirtion, children0to59growingwell, children0to5exclusivebreadstfeeding, children0to59givenvitaminasupplement, children12to59receiveddeworming] = yield Promise.all([
                (0, reports_1.readnutritionaggregate)(nutritionaggregatechildren0to59thatreceivednutirtion),
                (0, reports_1.readnutritionaggregate)(nutritionaggregatechildren0to59growingwell),
                (0, reports_1.readnutritionaggregate)(nutritionaggregatechildren0to5exclusivebreadstfeeding),
                (0, reports_1.readnutritionaggregate)(nutritionaggregatechildren0to59givenvitaminasupplement),
                (0, reports_1.readnutritionaggregate)(nutritionaggregatechildren12to59receiveddeworming)
            ]);
            queryresult = { children0to59thatreceivednutirtion, children0to59growingwell, children0to5exclusivebreadstfeeding, children0to59givenvitaminasupplement, children12to59receiveddeworming };
        }
        else if (querytype == summary[8] || querytype == "generalattendance" || querytype == "generalattendanceaggregate" || querytype == "general attendance") {
            const generalAttendanceMatch = [
                {
                    $lookup: {
                        from: "patientsmanagements",
                        localField: "patient",
                        foreignField: "_id",
                        as: "patient",
                    },
                },
                {
                    $unwind: {
                        path: "$patient",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        appointmentdate: { $gte: startdate, $lte: enddate }
                    }
                }
            ];
            const rawAppointments = yield (0, reports_1.readappointmentaggregate)(generalAttendanceMatch);
            queryresult = buildGeneralAttendanceTable(rawAppointments);
        }
        else {
            throw new Error(`querytype ${config_1.default.error.errorisrequired}`);
        }
        res.json({ queryresult, status: true });
    }
    catch (e) {
        res.json({ status: false, msg: e.message });
    }
});
exports.reportsummary = reportsummary;
//add pharmacy 1 , pharmacy 2
//add agggreate appointbyicnd10
