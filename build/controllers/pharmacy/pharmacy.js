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
exports.getpriceofdrug = exports.dispense = exports.confirmpharmacyorder = exports.confirmpharmacygrouporder = exports.readallpharmacytransactionbypartient = exports.readallpharmacytransaction = exports.pharmacyorderwithoutconfirmation = exports.pharmacyorder = void 0;
exports.readdrugprice = readdrugprice;
exports.readpharmacybyorderid = readpharmacybyorderid;
exports.groupreadallpharmacytransaction = groupreadallpharmacytransaction;
exports.groupreadallpharmacytransactionoptimized = groupreadallpharmacytransactionoptimized;
const mongoose_1 = __importDefault(require("mongoose"));
const otherservices_1 = require("../../utils/otherservices");
const config_1 = __importDefault(require("../../config"));
const price_1 = require("../../dao/price");
const patientmanagement_1 = require("../../dao/patientmanagement");
const payment_1 = require("../../dao/payment");
const prescription_1 = require("../../dao/prescription");
const appointment_1 = require("../../dao/appointment");
const admissions_1 = require("../../dao/admissions");
const { ObjectId } = mongoose_1.default.Types;
//pharmacy order
var pharmacyorder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("req.body", req.body);
        const { firstName, lastName } = (req.user).user;
        //accept _id from request
        const { id } = req.params;
        var { products, appointmentid, doctorsnote } = req.body;
        var orderid = String(Date.now());
        var pharcyorderid = [];
        (0, otherservices_1.validateinputfaulsyvalue)({ id, products });
        //search patient
        var patient = yield (0, patientmanagement_1.readonepatient)({ _id: id, status: config_1.default.status[1] }, {}, '', '');
        if (!patient) {
            throw new Error(`Patient donot ${config_1.default.error.erroralreadyexit} or has not made payment for registration`);
        }
        var appointment;
        if (appointmentid) {
            appointmentid = new ObjectId(appointmentid);
            appointment = yield (0, appointment_1.readoneappointment)({ _id: appointmentid }, {}, '');
            if (!appointment) {
                //create an appointment
                throw new Error(`Appointment donot ${config_1.default.error.erroralreadyexit}`);
            }
        }
        else {
            appointment = {
                _id: id,
                appointmentid: String(Date.now())
            };
        }
        //loop through all test and create record in lab order
        for (var i = 0; i < products.length; i++) {
            let { dosageform, strength, dosage, frequency, route, drug, pharmacy, prescriptionnote, duration } = products[i];
            var prescriptionrecord = yield (0, prescription_1.createprescription)({ doctorsnote, isHMOCover: patient === null || patient === void 0 ? void 0 : patient.isHMOCover, HMOPlan: patient === null || patient === void 0 ? void 0 : patient.HMOPlan, HMOName: patient === null || patient === void 0 ? void 0 : patient.HMOName, HMOId: patient === null || patient === void 0 ? void 0 : patient.HMOId, firstName: patient === null || patient === void 0 ? void 0 : patient.firstName, lastName: patient === null || patient === void 0 ? void 0 : patient.lastName, MRN: patient === null || patient === void 0 ? void 0 : patient.MRN, pharmacy, duration, dosageform, strength, dosage, frequency, route, prescription: drug, patient: patient._id, orderid, prescribersname: firstName + " " + lastName, prescriptionnote, appointment: appointment._id, appointmentid: appointment.appointmentid, appointmentdate: appointment === null || appointment === void 0 ? void 0 : appointment.appointmentdate, clinic: appointment === null || appointment === void 0 ? void 0 : appointment.clinic });
            pharcyorderid.push(prescriptionrecord._id);
            //paymentids.push(createpaymentqueryresult._id);
        }
        //var queryresult=await updatepatient(patient._id,{$push: {prescription:pharcyorderid,payment:paymentids}});
        var queryresult = yield (0, patientmanagement_1.updatepatient)(patient._id, { $push: { prescription: pharcyorderid } });
        //update appointment with pharmacy orders
        if (appointmentid) {
            yield (0, appointment_1.updateappointment)(appointment._id, { $push: { prescription: pharcyorderid } });
        }
        res.status(200).json({ queryresult, status: true });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.pharmacyorder = pharmacyorder;
//get price of drug
function readdrugprice(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //
        try {
            const { id } = req.params;
            console.log(req.body);
            const { drug, pharmacy, qty } = req.body;
            console.log("drug", drug);
            (0, otherservices_1.validateinputfaulsyvalue)({ drug, pharmacy, qty });
            var patient = yield (0, patientmanagement_1.readonepatient)({ _id: id, status: config_1.default.status[1] }, {}, '', '');
            if (!patient) {
                throw new Error(`Patient donot ${config_1.default.error.erroralreadyexit} or has not made payment for registration`);
            }
            var orderPrice = yield (0, price_1.readoneprice)({ servicetype: drug, servicecategory: config_1.default.category[1], pharmacy });
            if (!orderPrice) {
                throw new Error(`${config_1.default.error.errornopriceset} ${drug}`);
            }
            var amount = patient.isHMOCover == config_1.default.ishmo[1] ? Number(orderPrice.amount) * config_1.default.hmodrugpayment * qty : Number(orderPrice.amount) * qty;
            res.json({
                queryresult: amount,
                status: true,
            });
        }
        catch (e) {
            console.log(e);
            res.status(403).json({ status: false, msg: e.message });
        }
    });
}
//pharmacy order
var pharmacyorderwithoutconfirmation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName } = (req.user).user;
        //accept _id from request
        const { id } = req.params;
        var { products } = req.body;
        var orderid = String(Date.now());
        var pharcyorderid = [];
        var paymentids = [];
        (0, otherservices_1.validateinputfaulsyvalue)({ id, products });
        //search patient
        var patient = yield (0, patientmanagement_1.readonepatient)({ _id: id, status: config_1.default.status[1] }, {}, '', '');
        if (!patient) {
            throw new Error(`Patient donot ${config_1.default.error.erroralreadyexit} or has not made payment for registration`);
        }
        const findAdmissionForPayment = yield (0, otherservices_1.validatepayment)(patient._id, config_1.default.category[1]);
        var appointment = {
            _id: id,
            appointmentid: String(Date.now())
        };
        //loop through all test and create record in lab order
        for (var i = 0; i < products.length; i++) {
            let { dosageform, strength, dosage, frequency, route, drug, pharmacy, prescriptionnote, duration, qty } = products[i];
            (0, otherservices_1.validateinputfaulsyvalue)({ qty });
            //    console.log(testname[i]);
            //var orderPrice:any = await readoneprice({servicetype:products[i], servicecategory: configuration.category[1],pharmacy});
            var orderPrice = yield (0, price_1.readoneprice)({ servicetype: drug, servicecategory: config_1.default.category[1], pharmacy });
            if (!orderPrice) {
                throw new Error(`${config_1.default.error.errornopriceset} ${drug}`);
            }
            var amount = patient.isHMOCover == config_1.default.ishmo[1] ? Number(orderPrice.amount) * config_1.default.hmodrugpayment * qty : Number(orderPrice.amount) * qty;
            let paymentreference;
            //validate the status
            //search for patient under admission. if the patient is admitted the patient admission number will be use as payment reference
            if (findAdmissionForPayment) {
                paymentreference = findAdmissionForPayment.admissionid;
            }
            else {
                paymentreference = orderid;
            }
            var createpaymentqueryresult = yield (0, payment_1.createpayment)({ firstName: patient === null || patient === void 0 ? void 0 : patient.firstName, lastName: patient === null || patient === void 0 ? void 0 : patient.lastName, MRN: patient === null || patient === void 0 ? void 0 : patient.MRN, phoneNumber: patient === null || patient === void 0 ? void 0 : patient.phoneNumber, paymentreference, paymentype: drug, paymentcategory: pharmacy, patient: patient._id, amount, qty });
            //create 
            // console.log("got here");
            var prescriptionrecord = yield (0, prescription_1.createprescription)({ isHMOCover: patient === null || patient === void 0 ? void 0 : patient.isHMOCover, HMOPlan: patient === null || patient === void 0 ? void 0 : patient.HMOPlan, HMOName: patient === null || patient === void 0 ? void 0 : patient.HMOName, HMOId: patient === null || patient === void 0 ? void 0 : patient.HMOId, firstName: patient === null || patient === void 0 ? void 0 : patient.firstName, lastName: patient === null || patient === void 0 ? void 0 : patient.lastName, MRN: patient === null || patient === void 0 ? void 0 : patient.MRN, dispensestatus: config_1.default.status[10], payment: createpaymentqueryresult._id, qty, pharmacy, duration, dosageform, strength, dosage, frequency, route, prescription: drug, patient: patient._id, orderid, prescribersname: firstName + " " + lastName, prescriptionnote, appointment: appointment._id, appointmentid: appointment.appointmentid, appointmentdate: appointment === null || appointment === void 0 ? void 0 : appointment.appointmentdate, clinic: appointment === null || appointment === void 0 ? void 0 : appointment.clinic });
            pharcyorderid.push(prescriptionrecord._id);
            paymentids.push(createpaymentqueryresult._id);
        }
        var queryresult = yield (0, patientmanagement_1.updatepatient)(patient._id, { $push: { prescription: pharcyorderid, payment: paymentids } });
        res.status(200).json({ queryresult, status: true });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.pharmacyorderwithoutconfirmation = pharmacyorderwithoutconfirmation;
function readpharmacybyorderid(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //
        try {
            const { orderid } = req.params;
            console.log(orderid);
            //validate ticket id
            (0, otherservices_1.validateinputfaulsyvalue)({
                orderid,
            });
            const queryresult = yield (0, prescription_1.readallprescription)({ orderid }, {}, 'patient', 'appointment', 'payment');
            res.json({
                queryresult,
                status: true,
            });
        }
        catch (e) {
            console.log(e);
            res.status(403).json({ status: false, msg: e.message });
        }
    });
}
function groupreadallpharmacytransaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { clinic } = (req.user).user;
            const query = { pharmacy: clinic };
            const ordergroup = [
                //look up patient
                {
                    $match: query
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
                    $lookup: {
                        from: "appointments",
                        localField: "appointment",
                        foreignField: "_id",
                        as: "appointment",
                    },
                },
                {
                    $unwind: {
                        path: "$appointment",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$patient",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$orderid",
                        orderid: { $first: "$orderid" },
                        doctorsnote: { $first: "$doctorsnote" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        prescribersname: { $first: "$prescribersname" },
                        firstName: { $first: "$patient.firstName" },
                        lastName: { $first: "$patient.lastName" },
                        MRN: { $first: "$patient.MRN" },
                        isHMOCover: { $first: "$patient.isHMOCover" },
                        HMOName: { $first: "$patient.HMOName" },
                        HMOId: { $first: "$patient.HMOId" },
                        HMOPlan: { $first: "$patient.HMOPlan" },
                        appointmentdate: { $first: "$appointment.appointmentdate" },
                        clinic: { $first: "$appointment.clinic" },
                        appointmentid: { $first: "$appointmentid" }
                    },
                },
                {
                    $project: {
                        _id: 0,
                        orderid: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        prescribersname: 1,
                        firstName: 1,
                        lastName: 1,
                        MRN: 1,
                        isHMOCover: 1,
                        HMOName: 1,
                        HMOId: 1,
                        HMOPlan: 1,
                        appointmentdate: 1,
                        doctorsnote: 1,
                        clinic: 1,
                        appointmentid: 1
                    }
                },
                { $sort: { createdAt: -1 } },
            ];
            const queryresult = yield (0, prescription_1.readprescriptionaggregate)(ordergroup);
            res.json({
                queryresult,
                status: true,
            });
        }
        catch (e) {
            console.log(e);
            res.status(403).json({ status: false, msg: e.message });
        }
    });
}
//awaiting confirmation configuration.status[14]
//pending configuration.status[10]
//dispense configuration.status[6]
//dispense
function groupreadallpharmacytransactionoptimized(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('/////query//', req.query);
            const { clinic } = (req.user).user;
            const page = parseInt(req.query.page) || 1;
            const size = parseInt(req.query.size) || 150;
            var status;
            if (req.query.status == "pending") {
                status = config_1.default.status[10];
            }
            else if (req.query.status == "confirmation") {
                console.log("in confirmation");
                status = config_1.default.status[14];
            }
            else if (req.query.status == "dispense") {
                status = config_1.default.status[6];
            }
            else {
                status = config_1.default.status[10];
            }
            //const size = parseInt(req.query.size) || 150;
            const { firstName, MRN, HMOId, lastName, orderid } = req.query; // Get query parameters from the request
            // Add filters based on query parameters
            let matchPosts = firstName ? { firstName: new RegExp(firstName, 'i') } : MRN ? { MRN: new RegExp(MRN, 'i') } : HMOId ? { HMOId: new RegExp(HMOId, 'i') } : lastName ? { lastName: new RegExp(lastName, 'i') } : orderid ? { orderid: new RegExp(orderid, 'i') } : {}; // Case-insensitive search
            //const matchPosts = MRN ? { 'patient.MRN': new RegExp(MRN, 'i') } : {}; // Case-insensitive search 
            console.log('matchpost', matchPosts);
            console.log('clinic', clinic);
            //const query ={pharmacy:clinic,dispensestatus:status};
            matchPosts.pharmacy = clinic;
            matchPosts.dispensestatus = status;
            //console.log("query", query);
            const ordergroup = [
                //look up patient
                /*
                {
                 $match:query
               },
               */
                {
                    $match: matchPosts
                },
                /*
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
                          from: "appointments",
                          localField: "appointment",
                          foreignField: "_id",
                          as: "appointment",
                        },
                      },
                      {
                        $unwind: {
                          path: "$appointment",
                          preserveNullAndEmptyArrays: true
                        }
                        
                      },
                      
                      {
                        $unwind: {
                          path: "$patient",
                          preserveNullAndEmptyArrays: true
                        }
                        
                      },
                      */
                {
                    $group: {
                        _id: "$orderid",
                        orderid: { $first: "$orderid" },
                        doctorsnote: { $first: "$doctorsnote" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        prescribersname: { $first: "$prescribersname" },
                        firstName: { $first: "$firstName" },
                        lastName: { $first: "$lastName" },
                        MRN: { $first: "$MRN" },
                        isHMOCover: { $first: "$isHMOCover" },
                        HMOName: { $first: "$HMOName" },
                        HMOId: { $first: "$HMOId" },
                        HMOPlan: { $first: "$HMOPlan" },
                        appointmentdate: { $first: "$appointmentdate" },
                        clinic: { $first: "$clinic" },
                        appointmentid: { $first: "$appointmentid" }
                    },
                },
                {
                    $project: {
                        _id: 0,
                        orderid: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        prescribersname: 1,
                        firstName: 1,
                        lastName: 1,
                        MRN: 1,
                        doctorsnote: 1,
                        isHMOCover: 1,
                        HMOName: 1,
                        HMOId: 1,
                        HMOPlan: 1,
                        appointmentdate: 1,
                        clinic: 1,
                        appointmentid: 1
                    }
                },
                { $sort: { createdAt: -1 } },
            ];
            const queryresult = yield (0, prescription_1.optimizedreadprescriptionaggregate)(ordergroup, page, size);
            res.json({
                queryresult,
                status: true,
            });
        }
        catch (e) {
            console.log(e);
            res.status(403).json({ status: false, msg: e.message });
        }
    });
}
//get all pharmacy orderf
const readallpharmacytransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //extract staff department
        const { clinic } = (req.user).user;
        const queryresult = yield (0, prescription_1.readallprescription)({ pharmacy: clinic }, {}, 'patient', 'appointment', 'payment');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readallpharmacytransaction = readallpharmacytransaction;
//get all pharmacy order
const readallpharmacytransactionbypartient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patient } = req.params;
        const queryresult = yield (0, prescription_1.readallprescription)({ patient }, {}, 'patient', 'appointment', 'payment');
        res.status(200).json({
            queryresult,
            status: true
        });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.readallpharmacytransactionbypartient = readallpharmacytransactionbypartient;
//confirm group
const confirmpharmacygrouporder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //extract option
        var { pharmacyrequest } = req.body;
        let queryresult;
        for (let i = 0; pharmacyrequest.length > i; i++) {
            let { option, remark, qty, id } = pharmacyrequest[i];
            if (option == true) {
                (0, otherservices_1.validateinputfaulsyvalue)({ qty });
            }
            var prescriptionresponse = yield (0, prescription_1.readoneprescription)({ _id: new ObjectId(id) }, {}, 'patient', '', '');
            const { prescription, orderid, patient, pharmacy } = prescriptionresponse;
            var orderPrice = yield (0, price_1.readoneprice)({ servicetype: prescription, servicecategory: config_1.default.category[1], pharmacy });
            if (!orderPrice) {
                throw new Error(`${config_1.default.error.errornopriceset} ${prescription}`);
            }
            var amount = patient.isHMOCover == config_1.default.ishmo[1] ? Number(orderPrice.amount) * config_1.default.hmodrugpayment * qty : Number(orderPrice.amount) * qty;
            let paymentreference;
            //validate the status
            //search for patient under admission. if the patient is admitted the patient admission number will be use as payment reference
            var findAdmission = yield (0, admissions_1.readoneadmission)({ patient: patient._id, status: { $ne: config_1.default.admissionstatus[5] } }, {}, '');
            if (findAdmission) {
                paymentreference = findAdmission.admissionid;
            }
            else {
                paymentreference = orderid;
            }
            if (option == true) {
                var createpaymentqueryresult = yield (0, payment_1.createpayment)({ firstName: patient === null || patient === void 0 ? void 0 : patient.firstName, lastName: patient === null || patient === void 0 ? void 0 : patient.lastName, MRN: patient === null || patient === void 0 ? void 0 : patient.MRN, phoneNumber: patient === null || patient === void 0 ? void 0 : patient.phoneNumber, paymentreference, paymentype: prescription, paymentcategory: pharmacy, patient: patient._id, amount, qty });
                queryresult = yield (0, prescription_1.updateprescription)(id, { dispensestatus: config_1.default.status[10], payment: createpaymentqueryresult._id, remark, qty });
                yield (0, patientmanagement_1.updatepatient)(patient._id, { $push: { payment: createpaymentqueryresult._id } });
            }
            else {
                queryresult = yield (0, prescription_1.updateprescription)(id, { dispensestatus: config_1.default.status[13], remark });
            }
        }
        res.status(200).json({ queryresult, status: true });
    }
    catch (e) {
        console.log("error", e);
        res.status(403).json({ status: false, msg: e.message });
    }
});
exports.confirmpharmacygrouporder = confirmpharmacygrouporder;
const confirmpharmacyorder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //extract option
        const { option, remark, qty } = req.body;
        if (option == true) {
            (0, otherservices_1.validateinputfaulsyvalue)({ qty });
        }
        const { id } = req.params;
        //search for the lab request
        var prescriptionresponse = yield (0, prescription_1.readoneprescription)({ _id: id }, {}, 'patient', '', '');
        const { prescription, orderid, patient, pharmacy } = prescriptionresponse;
        //get amount 
        var orderPrice = yield (0, price_1.readoneprice)({ servicetype: prescription, servicecategory: config_1.default.category[1], pharmacy });
        if (!orderPrice) {
            throw new Error(`${config_1.default.error.errornopriceset} ${prescription}`);
        }
        /*
        if(orderPrice.qty <=0){
          throw new Error(`${prescription} ${configuration.error.erroravailability}`);
        
        }
          */
        //validate quantity entered
        var amount = patient.isHMOCover == config_1.default.ishmo[1] ? Number(orderPrice.amount) * config_1.default.hmodrugpayment * qty : Number(orderPrice.amount) * qty;
        let paymentreference;
        //validate the status
        //search for patient under admission. if the patient is admitted the patient admission number will be use as payment reference
        var findAdmission = yield (0, admissions_1.readoneadmission)({ patient: patient._id, status: { $ne: config_1.default.admissionstatus[5] } }, {}, '');
        if (findAdmission) {
            paymentreference = findAdmission.admissionid;
        }
        else {
            paymentreference = orderid;
        }
        let queryresult;
        if (option == true) {
            var createpaymentqueryresult = yield (0, payment_1.createpayment)({ firstName: patient === null || patient === void 0 ? void 0 : patient.firstName, lastName: patient === null || patient === void 0 ? void 0 : patient.lastName, MRN: patient === null || patient === void 0 ? void 0 : patient.MRN, phoneNumber: patient === null || patient === void 0 ? void 0 : patient.phoneNumber, paymentreference, paymentype: prescription, paymentcategory: pharmacy, patient: patient._id, amount, qty });
            queryresult = yield (0, prescription_1.updateprescription)(id, { dispensestatus: config_1.default.status[10], payment: createpaymentqueryresult._id, remark, qty });
            yield (0, patientmanagement_1.updatepatient)(patient._id, { $push: { payment: createpaymentqueryresult._id } });
        }
        else {
            queryresult = yield (0, prescription_1.updateprescription)(id, { dispensestatus: config_1.default.status[13], remark });
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
exports.confirmpharmacyorder = confirmpharmacyorder;
//get all pharmacy order
const dispense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        //dispense
        //search product in inventory
        var response = yield (0, prescription_1.readoneprescription)({ _id: id }, {}, 'patient', '', '');
        const { dispensestatus, patient, pharmacy } = response;
        //check product status
        if (dispensestatus !== config_1.default.status[10]) {
            throw new Error(`Dispense ${config_1.default.error.errortasknotpending}`);
        }
        //check payment status
        var findAdmission = yield (0, admissions_1.readoneadmission)({ patient: patient._id, status: { $ne: config_1.default.admissionstatus[5] } }, {}, '');
        console.log('findAdmission', findAdmission);
        if (!findAdmission) {
            var paymentrecord = yield (0, payment_1.readonepayment)({ _id: response.payment });
            if (paymentrecord.status !== config_1.default.status[3]) {
                throw new Error(config_1.default.error.errorpayment);
            }
        }
        // console.log(testname[i]);
        var orderPrice = yield (0, price_1.readoneprice)({ servicetype: response.prescription, servicecategory: config_1.default.category[1], pharmacy });
        console.log('orderprice', orderPrice);
        if (!orderPrice) {
            throw new Error(config_1.default.error.errornopriceset);
        }
        /*
        if(!orderPrice.qty || orderPrice.qty <=0){
          throw new Error(`${response.prescription} ${configuration.error.erroravailability} or qty not defined in inventory`);
      
        }
          */
        //reduce the quantity
        let { qty } = yield (0, price_1.updateprice)({ _id: orderPrice._id }, { qty: Number(orderPrice.qty) - Number(response.qty) });
        //change status 6
        var queryresult = yield (0, prescription_1.updateprescription)(response._id, { dispensestatus: config_1.default.status[6], balance: qty });
        res.status(200).json({ queryresult, status: true });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.dispense = dispense;
// get price of drug
const getpriceofdrug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        //search for the lab request
        var prescriptionresponse = yield (0, prescription_1.readoneprescription)({ _id: id }, {}, 'patient', '', '');
        const { prescription, patient, pharmacy } = prescriptionresponse;
        //get amount 
        var orderPrice = yield (0, price_1.readoneprice)({ servicetype: prescription, servicecategory: config_1.default.category[1], pharmacy });
        var amount = patient.isHMOCover == config_1.default.ishmo[1] ? Number(orderPrice.amount) * config_1.default.hmodrugpayment : Number(orderPrice.amount);
        res.status(200).json({ price: amount, status: true });
    }
    catch (e) {
        console.log("error", e);
        res.status(403).json({ status: false, msg: e.message });
    }
});
exports.getpriceofdrug = getpriceofdrug;
