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
        const reportbyfinancialreport = [
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $match: { $and: [{ paymentcategory: querygroup }, { updatedAt: { $gt: startdate, $lt: enddate } }] }
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
        const reportbyadmissionreport = [
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
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
                $match: { $and: [{ "referedward.wardname": querygroup }, { referddate: { $gt: startdate, $lt: enddate } }] }
            },
        ];
        const reportbyappointmentreport = [
            {
                $lookup: {
                    from: "patientsmanagements",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            {
                $match: { $and: [{ clinic: querygroup }, {
                            appointmentdate: { $gt: startdate, $lt: enddate }
                        }] }
            },
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
                $match: { $and: [{ "patient.HMOName": querygroup }, {
                            createdAt: { $gt: startdate, $lt: enddate }
                        }] }
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
                $match: { $and: [{ "patient.HMOName": querygroup }, {
                            appointmentdate: { $gt: startdate, $lt: enddate }
                        }] }
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
        else if (querytype == reports[1].querytype) {
            queryresult = yield (0, reports_1.readappointmentaggregate)(reportbyappointmentreport);
        }
        else if (querytype == reports[2].querytype) {
            queryresult = yield (0, reports_1.readadmissionaggregate)(reportbyadmissionreport);
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
        var query = { cashieremail: email, createdAt: { $gt: startdate, $lt: enddate } };
        var populatequery = 'patient';
        const cashieraggregatependingpaid = [
            {
                $match: { $and: [{ status: config_1.default.status[3] }, { cashieremail: email }, { createdAt: { $gt: startdate, $lt: enddate } }] }
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
                $match: { $and: [{ status: config_1.default.status[5] }, {
                            appointmentdate: { $gt: startdate, $lt: enddate }
                        }] }
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
                $match: { $and: [{ status: config_1.default.status[6] }, {
                            appointmentdate: { $gt: startdate, $lt: enddate }
                        }] }
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
                $match: { $and: [{ status: config_1.default.status[9] }, {
                            appointmentdate: { $gt: startdate, $lt: enddate }
                        }] }
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
                $match: { $and: [
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
                $match: { $and: [
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
