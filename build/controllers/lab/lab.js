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
exports.confirmlaborder = exports.listlabreportbypatient = exports.printlabreport = exports.listlabreport = exports.readallscheduledlaboptimized = exports.readallscheduledlab = exports.readAllLabByPatient = exports.readalllabb = void 0;
exports.labresultprocessing = labresultprocessing;
const lab_1 = require("../../dao/lab");
const patientmanagement_1 = require("../../dao/patientmanagement");
const otherservices_1 = require("../../utils/otherservices");
const payment_1 = require("../../dao/payment");
const mongoose_1 = __importDefault(require("mongoose"));
const { ObjectId } = mongoose_1.default.Types;
const users_1 = require("../../dao/users");
const config_1 = __importDefault(require("../../config"));
const admissions_1 = require("../../dao/admissions");
//adjust lab to view from department
// Get all lab records
const readalllabb = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //const {clinic} = (req.user).user;
        //const queryresult = await readalllab({department:clinic},{},'patient','appointment','payment');
        const queryresult = yield (0, lab_1.readalllab)({}, {}, 'patient', 'appointment', 'payment');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readalllabb = readalllabb;
//get lab order by patient
const readAllLabByPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //const {clinic} = (req.user).user;
        const { id } = req.params;
        //const queryresult = await readalllab({patient:id,department:clinic},{},'patient','appointment','payment');
        const queryresult = yield (0, lab_1.readalllab)({ patient: id }, {}, 'patient', 'appointment', 'payment');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readAllLabByPatient = readAllLabByPatient;
//lab processing
function labresultprocessing(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get id
            const { id } = req.params;
            const { subcomponents } = req.body;
            const { email, staffId } = (req.user).user;
            //find id and validate
            var lab = yield (0, lab_1.readonelab)({ _id: id }, {}, '');
            //if not lab or status !== scheduled return error
            if (!lab || lab.status !== config_1.default.status[5]) {
                throw new Error(config_1.default.error.errorservicetray);
            }
            (0, otherservices_1.validateinputfaulsyvalue)({ lab, subcomponents });
            const user = yield (0, users_1.readone)({ email, staffId });
            //loop through array of subcomponent 
            for (var i = 0; i < subcomponents.length; i++) {
                //throw error if no subcomponent
                const { subcomponent, result, nranges, unit } = subcomponents[i];
                // validateinputfaulsyvalue({subcomponent,result,nranges,unit})
                (0, otherservices_1.validateinputfaulsyvalue)({ subcomponent });
            }
            var processeddate = new Date();
            //update test, lab technical name and test status
            var queryresult = yield (0, lab_1.updatelab)({ _id: id }, { $push: { testresult: subcomponents }, status: config_1.default.status[7], processeddate, staffname: user === null || user === void 0 ? void 0 : user._id });
            //update status of appointment
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
//view all schedule lab
// Get all lab records
const readallscheduledlab = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clinic } = (req.user).user;
        //const queryresult = await readalllab({department:clinic},{},'patient','appointment','payment');
        const queryresult = yield (0, lab_1.readalllab)({ $or: [{ status: config_1.default.status[5] }, { status: config_1.default.status[13] }, { status: config_1.default.status[14] }], department: clinic }, {}, 'patient', 'appointment', 'payment');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readallscheduledlab = readallscheduledlab;
const readallscheduledlaboptimized = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var { status, firstName, MRN, HMOId, lastName, phoneNumber, testname } = req.query;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 150;
        var filter = status ? { status } : testname ? { testname } : {};
        if (firstName) {
            filter.firstName = new RegExp(firstName, 'i'); // Case-insensitive search for name
        }
        if (MRN) {
            filter.MRN = new RegExp(MRN, 'i');
        }
        if (HMOId) {
            filter.HMOId = new RegExp(HMOId, 'i'); // Case-insensitive search for email
        }
        if (lastName) {
            filter.lastName = new RegExp(lastName, 'i'); // Case-insensitive search for email
        }
        if (phoneNumber) {
            filter.phoneNumber = new RegExp(phoneNumber, 'i'); // Case-insensitive search for email
        }
        const skip = (page - 1) * size;
        let aggregatequery = [
            {
                $match: filter
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: size },
            {
                $lookup: {
                    from: 'patientsmanagements',
                    localField: 'patient',
                    foreignField: '_id',
                    as: 'patient'
                }
            },
            {
                $unwind: {
                    path: '$patient',
                    preserveNullAndEmptyArrays: true
                } // Deconstruct the patient array (from the lookup)
            },
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    testname: 1,
                    updatedAt: 1,
                    testid: 1,
                    department: 1,
                    firstName: { $ifNull: ["$firstName", "$patient.firstName"] },
                    lastName: { $ifNull: ["$lastName", "$patient.lastName"] },
                    phoneNumber: { $ifNull: ["$phoneNumber", "$patient.phoneNumber"] },
                    MRN: { $ifNull: ["$MRN", "$patient.MRN"] },
                    patient: "$patient",
                    HMOId: { $ifNull: ["$HMOId", "$patient.HMOId"] },
                    HMOName: { $ifNull: ["$HMOName", "$patient.HMOName"] },
                    status: 1,
                }
            }
        ];
        const labdetails = yield (0, lab_1.readlabaggregate)(aggregatequery);
        const totallabdetails = yield (0, lab_1.countlab)(filter);
        const totalPages = Math.ceil(totallabdetails / size);
        res.status(200).json({
            queryresult: { labdetails, totalPages, totallabdetails, size, page },
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readallscheduledlaboptimized = readallscheduledlaboptimized;
//lab reports
const listlabreport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find related
        const { clinic } = (req.user).user;
        const query = { status: config_1.default.status[7], department: clinic };
        const queryresult = yield (0, lab_1.readlabaggregate)([
            {
                $lookup: {
                    from: "appointments",
                    localField: "appointment",
                    foreignField: "_id",
                    as: "appointments",
                },
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
                $match: query,
            },
            {
                $group: {
                    _id: "$appointment",
                    MRN: { $first: { $first: "$patient.MRN" } },
                    firstName: { $first: { $first: "$patient.firstName" } },
                    lastName: { $first: { $first: "$patient.lastName" } },
                    phoneNumber: { $first: { $first: "$patient.phoneNumber" } },
                    appointmentid: { $first: "$appointmentid" },
                    //appointmentid: {$first: {$first:"$appointments.appointmentid"}},
                    appointmentdate: { $first: { $first: "$appointments.appointmentdate" } },
                    createdAt: { $first: "$createdAt" }
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
        res.json({
            queryresult,
            status: true,
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.listlabreport = listlabreport;
//print lab report
const printlabreport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //const {clinic} = (req.user).user;
        //const queryresult = await readalllab({department:clinic},{},'patient','appointment','payment');
        var populatequery = {
            path: "staffname",
            select: {
                firstName: 1,
                middleName: 1,
                _id: 0
            },
        };
        var patientpopulatequery = {
            path: "patient",
            select: {
                MRN: 1,
                firstName: 1,
                lastName: 1,
                age: 1,
                gender: 1
                //_id:0
            },
        };
        const { id } = req.params;
        const queryresult = yield (0, lab_1.readalllab)({ appointment: id, testresult: { $exists: true, $not: { $size: 0 } } }, { testname: 1, testid: 1, testresult: 1, status: 1, appointmentid: 1, createdAt: 1, processeddate: 1 }, populatequery, patientpopulatequery, '');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.printlabreport = printlabreport;
//list lab report by patient
//lab reports
const listlabreportbypatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const objectId = new ObjectId(id);
        // find related
        //const query = { patient._id:id};
        const query = { patient: objectId, status: config_1.default.status[7] };
        const queryresult = yield (0, lab_1.readlabaggregate)([
            {
                $match: query,
            },
            {
                $lookup: {
                    from: "appointments",
                    localField: "appointment",
                    foreignField: "_id",
                    as: "appointments",
                },
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
                $group: {
                    _id: "$appointment",
                    MRN: { $first: { $first: "$patient.MRN" } },
                    firstName: { $first: { $first: "$patient.firstName" } },
                    lastName: { $first: { $first: "$patient.lastName" } },
                    phoneNumber: { $first: { $first: "$patient.phoneNumber" } },
                    appointmentid: { $first: { $first: "$appointments.appointmentid" } },
                    appointmentdate: { $first: { $first: "$appointments.appointmentdate" } }
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
        res.json({
            queryresult,
            status: true,
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.listlabreportbypatient = listlabreportbypatient;
//this endpoint is use to accept or reject lab order
const confirmlaborder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //extract option
        const { option, remark } = req.body;
        const { id } = req.params;
        console.log('////confirmbodyrequest body////', req.body);
        console.log('////confirmbodyrequest params////', id);
        //search for the lab request
        var lab = yield (0, lab_1.readonelab)({ _id: id }, {}, 'patient');
        console.log('lab', lab);
        const { testname, testid, patient, amount } = lab;
        //validate the status
        let queryresult;
        //search for patient under admission. if the patient is admitted the patient admission number will be use as payment reference
        let paymentreference;
        //let status;
        //validate the status
        //search for patient under admission. if the patient is admitted the patient admission number will be use as payment reference
        var findAdmission = yield (0, admissions_1.readoneadmission)({ patient: patient._id, status: { $ne: config_1.default.admissionstatus[5] } }, {}, '');
        if (findAdmission) {
            paymentreference = findAdmission.admissionid;
            //status=configuration.status[5];
        }
        else {
            paymentreference = testid;
            //status=configuration.status[2];
        }
        if (option == true && amount > 0) {
            var createpaymentqueryresult = yield (0, payment_1.createpayment)({ firstName: patient === null || patient === void 0 ? void 0 : patient.firstName, lastName: patient === null || patient === void 0 ? void 0 : patient.lastName, MRN: patient === null || patient === void 0 ? void 0 : patient.MRN, phoneNumber: patient === null || patient === void 0 ? void 0 : patient.phoneNumber, paymentreference, paymentype: testname, paymentcategory: config_1.default.category[2], patient: patient._id, amount });
            queryresult = yield (0, lab_1.updatelab)({ _id: id }, { status: config_1.default.status[2], payment: createpaymentqueryresult._id, remark });
            yield (0, patientmanagement_1.updatepatient)(patient._id, { $push: { payment: createpaymentqueryresult._id } });
        }
        else if (option == true && amount == 0) {
            queryresult = yield (0, lab_1.updatelab)({ _id: id }, { status: config_1.default.status[5], remark });
        }
        else {
            queryresult = yield (0, lab_1.updatelab)({ _id: id }, { status: config_1.default.status[13], remark });
        }
        res.status(200).json({ queryresult, status: true });
        //if accept
        //accept or reject lab order
        //var createpaymentqueryresult =await createpayment({paymentreference:id,paymentype:testname[i],paymentcategory:testsetting[0].category,patient:appointment.patient,amount:Number(testPrice.amount)})
        //paymentids.push(createpaymentqueryresult._id);
        //var queryresult=await updatepatient(appointment.patient,{$push: {payment:paymentids}});
        //var testrecord = await createlab({payment:createpaymentqueryresult._id});
        //change status to 2 or  13 for reject
    }
    catch (e) {
        console.log("error", e);
        res.status(403).json({ status: false, msg: e.message });
    }
});
exports.confirmlaborder = confirmlaborder;
