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
exports.confirmgrouppayment = confirmgrouppayment;
exports.readpaymentbyreferencenumber = readpaymentbyreferencenumber;
exports.groupreadallpayment = groupreadallpayment;
exports.groupreadallpaymentoptimized = groupreadallpaymentoptimized;
exports.readbillinghistoryforapatient = readbillinghistoryforapatient;
exports.readbillinghistoryforallapatient = readbillinghistoryforallapatient;
exports.confirmpayment = confirmpayment;
exports.printreceipt = printreceipt;
const payment_1 = require("../../dao/payment");
const patientmanagement_1 = require("../../dao/patientmanagement");
const lab_1 = require("../../dao/lab");
const config_1 = __importDefault(require("../../config"));
const otherservices_1 = require("../../utils/otherservices");
//deactivate a user
/*
export async function confirmpayment(req:any, res:any){
    const {id} = req.params;
    try{
        const response = await readone({_id:id});
       const status= response?.status == configuration.userstatus[0]? configuration.userstatus[1]: configuration.userstatus[0];
        const queryresult:any =await updateuser(id,{status});
        res.status(200).json({
            queryresult,
            status:true
          });

    }
    catch(e:any){
        console.log(e);
      res.status(403).json({status: false, msg:e.message});

    }

}
    */
//confirm payment
function confirmgrouppayment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //console.log(req.user);
        try {
            const { paymentreferenceid } = req.params;
            //check for null of id
            const response = yield (0, payment_1.readallpayment)({ paymentreference: paymentreferenceid, status: config_1.default.status[2] }, '');
            const { paymentdetails } = response;
            console.log('before', paymentdetails);
            console.log('length', paymentdetails.length);
            for (var i = 0; i < paymentdetails.length; i++) {
                console.log('paymentdetails', paymentdetails[i]);
                let { paymentype, paymentcategory, paymentreference, patient, _id } = paymentdetails[i];
                //const {patient} = paymentdetails[i];
                const patientrecord = yield (0, patientmanagement_1.readonepatient)({ _id: patient, status: config_1.default.status[1] }, {}, '', '');
                console.log('patient', patientrecord);
                if (!patientrecord && paymentcategory !== config_1.default.category[3]) {
                    console.log('true');
                    throw new Error(`Patient donot ${config_1.default.error.erroralreadyexit} or has not made payment for registration`);
                }
                //var settings =await  configuration.settings();
                const status = config_1.default.status[3];
                const { email, staffId, firstName, lastName } = (req.user).user;
                var cashiername = `${firstName} ${lastName}`;
                const queryresult = yield (0, payment_1.updatepayment)(_id, { status, cashieremail: email, cashiername, cashierid: staffId, confirmationdate: new Date() });
                //const {paymentype,paymentcategory,paymentreference} = queryresult;
                //for patient registration
                if (paymentcategory == config_1.default.category[3]) {
                    //update patient registration status
                    yield (0, patientmanagement_1.updatepatientbyanyquery)({ _id: patient }, { status: config_1.default.status[1], paymentstatus: status, paymentreference });
                }
                /*
                
                else if(paymentcategory == configuration.category[0]){
                  //schedule the patient
                  //payment
                  await updateappointmentbyquery({payment:_id},{status:configuration.status[5]});
          
                }
                  */
                //for lab test
                else if (paymentcategory == config_1.default.category[2]) {
                    //update lab test
                    yield (0, lab_1.updatelabbyquery)({ payment: _id }, { status: config_1.default.status[5] });
                }
            }
            res.status(200).json({
                queryresult: paymentreferenceid,
                status: true
            });
        }
        catch (e) {
            console.log(e);
            res.status(403).json({ status: false, msg: e.message });
        }
    });
}
function readpaymentbyreferencenumber(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //
        try {
            const { paymentreference } = req.params;
            //validate ticket id
            (0, otherservices_1.validateinputfaulsyvalue)({
                paymentreference,
            });
            var populatequery = 'patient';
            // Aggregation to calculate sum and add it as a new field
            var query = { paymentreference };
            let totalAmount = yield (0, payment_1.readallpaymentaggregate)([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: null, // null means no grouping, we just want the total sum for the entire collection
                        totalAmount: { $sum: "$amount" } // Sum of the itemPrice for all documents
                    }
                },
                {
                    $project: {
                        totalAmount: 1,
                        _id: 0
                    }
                }
            ]);
            const queryresult = yield (0, payment_1.readallpayment)({ paymentreference }, populatequery);
            res.json({
                queryresult,
                totalAmount,
                status: true,
            });
        }
        catch (e) {
            console.log(e);
            res.status(403).json({ status: false, msg: e.message });
        }
    });
}
//recall
function groupreadallpayment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //const { paymentreference } = req.params;
            var { status } = req.params;
            var filter = {};
            if (status == "paid") {
                filter.status = config_1.default.status[3];
            }
            else {
                filter.status = config_1.default.status[2];
            }
            const referencegroup = [
                //look up patient
                //add query
                {
                    $match: filter
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
                        _id: "$paymentreference",
                        paymentreference: { $first: "$paymentreference" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        amount: { $sum: "$amount" },
                        patient: { $first: "$patient" }
                    },
                },
                {
                    $project: {
                        _id: 0,
                        paymentreference: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        amount: 1,
                        patient: 1
                    }
                },
                { $sort: { createdAt: -1 } },
            ];
            const queryresult = yield (0, payment_1.readpaymentaggregate)(referencegroup);
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
function groupreadallpaymentoptimized(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //const { paymentreference } = req.params;
            var { status, firstName, MRN, HMOId, lastName, phoneNumber, email, paymentreference } = req.query;
            //var filter:any = {};
            var statusfilter = {};
            console.log('/////query//', req.query);
            var page = parseInt(req.query.page) || 1;
            var size = parseInt(req.query.size) || 150;
            if (status == "paid") {
                statusfilter.status = config_1.default.status[3];
            }
            else {
                statusfilter.status = config_1.default.status[2];
            }
            if (paymentreference)
                statusfilter.paymentreference = paymentreference;
            if (firstName)
                statusfilter.firstName = new RegExp(`^${firstName}`, 'i');
            if (lastName)
                statusfilter.lastName = new RegExp(`^${lastName}`, 'i');
            if (MRN)
                statusfilter.MRN = new RegExp(`^${MRN}`, 'i');
            if (phoneNumber)
                statusfilter.phoneNumber = new RegExp(`^${phoneNumber}`, 'i');
            //paymentreference
            ////////////////////////////////////
            const pipeline = [];
            // Add status filter
            pipeline.push({ $match: statusfilter });
            pipeline.push({
                $group: {
                    _id: "$paymentreference",
                    paymentreference: { $first: "$paymentreference" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    amount: { $sum: "$amount" },
                    firstName: { $first: "$firstName" },
                    phoneNumber: { $first: "$phoneNumber" },
                    lastName: { $first: "$lastName" },
                    MRN: { $first: "$MRN" }
                },
            });
            pipeline.push({
                $project: {
                    _id: 0,
                    paymentreference: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    amount: 1,
                    firstName: 1,
                    phoneNumber: 1,
                    lastName: 1,
                    MRN: 1,
                },
            });
            // Lookup patient
            /*
             statusfilter.status==configuration.status[2] && pipeline.push({
              $lookup: {
                from: 'patientsmanagements',
                localField: 'patient',
                foreignField: '_id',
                as: 'patient',
              },
            });
            */
            //statusfilter.status==configuration.status[2] && pipeline.push({ $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } });
            // Build patient match condition dynamically
            /*
            const patientMatch:any = {};
            
            if (firstName && statusfilter.status==configuration.status[2]) patientMatch['patient.firstName'] = new RegExp(`^${firstName}`, 'i');
            if (lastName && statusfilter.status==configuration.status[2]) patientMatch['patient.lastName'] = new RegExp(`^${lastName}`, 'i');
            if (MRN && statusfilter.status==configuration.status[2]) patientMatch['patient.MRN'] = new RegExp(`^${MRN}`, 'i');
            if (HMOId && statusfilter.status==configuration.status[2]) patientMatch['patient.HMOId'] = new RegExp(`^${HMOId}`, 'i');
            if (phoneNumber && statusfilter.status==configuration.status[2]) patientMatch['patient.phoneNumber'] = new RegExp(`^${phoneNumber}`, 'i');
            
            if (Object.keys(patientMatch).length > 0) {
              pipeline.push({ $match: patientMatch });
            }
              */
            // Grouping
            /*
            statusfilter.status==configuration.status[2]?pipeline.push({
              $group: {
                _id: "$paymentreference",
                paymentreference: { $first: "$paymentreference" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                amount: { $sum: "$amount" },
                firstName: { $first: "$patient.firstName" },
                phoneNumber: { $first: "$patient.phoneNumber" },
                lastName: { $first: "$patient.lastName" },
                MRN: { $first: "$patient.MRN" },
                isHMOCover: { $first: "$patient.isHMOCover" },
                HMOName: { $first: "$patient.HMOName" },
                HMOId: { $first: "$patient.HMOId" },
                HMOPlan: { $first: "$patient.HMOPlan" },
              },
            }):pipeline.push({
              $group: {
                _id: "$paymentreference",
                paymentreference: { $first: "$paymentreference" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                amount: { $sum: "$amount" },
               // firstName: { $first: "$patient.firstName" },
                //phoneNumber: { $first: "$patient.phoneNumber" },
                //lastName: { $first: "$patient.lastName" },
                //MRN: { $first: "$patient.MRN" },
                //isHMOCover: { $first: "$patient.isHMOCover" },
                //HMOName: { $first: "$patient.HMOName" },
                //HMOId: { $first: "$patient.HMOId" },
                //HMOPlan: { $first: "$patient.HMOPlan" },
              },
            });
            
            
            // Projection
            statusfilter.status==configuration.status[2]?pipeline.push({
              $project: {
                _id: 0,
                paymentreference: 1,
                createdAt: 1,
                updatedAt: 1,
                amount: 1,
                firstName: 1,
                phoneNumber: 1,
                lastName: 1,
                MRN: 1,
                isHMOCover: 1,
                HMOName: 1,
                HMOId: 1,
                HMOPlan: 1,
              },
            }):pipeline.push({
              $project: {
                _id: 0,
                paymentreference: 1,
                createdAt: 1,
                updatedAt: 1,
                amount: 1,
              //  firstName: 1,
               // phoneNumber: 1,
               // lastName: 1,
                //MRN: 1,
                //isHMOCover: 1,
                //HMOName: 1,
                //HMOId: 1,
                //HMOPlan: 1,
              },
            });
            */
            // Sorting
            pipeline.push({ $sort: { createdAt: -1 } });
            const queryresult = yield (0, payment_1.readpaymentaggregateoptimized)(pipeline, page, size);
            console.log('*******', queryresult);
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
//read particular patient payment history
function readbillinghistoryforapatient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            var query = { patient: id };
            var populatequery = 'patient';
            const queryresult = yield (0, payment_1.readallpayment)(query, populatequery);
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
//get billing history for all patient
function readbillinghistoryforallapatient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var query = {};
            var populatequery = 'patient';
            const queryresult = yield (0, payment_1.readallpayment)(query, populatequery);
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
//confirm payment
function confirmpayment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //console.log(req.user);
        try {
            const { id } = req.params;
            //check for null of id
            const response = yield (0, payment_1.readonepayment)({ _id: id });
            const { patient } = response;
            const patientrecord = yield (0, patientmanagement_1.readonepatient)({ _id: patient, status: config_1.default.status[1] }, {}, '', '');
            console.log('patient', patientrecord);
            if (!patientrecord && response.paymentcategory !== config_1.default.category[3]) {
                throw new Error(`Patient donot ${config_1.default.error.erroralreadyexit} or has not made payment for registration`);
            }
            //var settings =await  configuration.settings();
            const status = config_1.default.status[3];
            const { email, staffId } = (req.user).user;
            const queryresult = yield (0, payment_1.updatepayment)(id, { status, cashieremail: email, cashierid: staffId, confirmationdate: new Date() });
            //const queryresult:any =await updatepayment(id,{status});
            //confirm payment of the service paid for 
            const { paymentype, paymentcategory, paymentreference } = queryresult;
            //for patient registration
            if (paymentcategory == config_1.default.category[3]) {
                //update patient registration status
                yield (0, patientmanagement_1.updatepatientbyanyquery)({ _id: patient }, { status: config_1.default.status[1] });
            }
            /*
            
            //for appointment
            else if(paymentcategory == configuration.category[0]){
              //schedule the patient
              //payment
              await updateappointmentbyquery({payment:id},{status:configuration.status[5]});
      
            }
              */
            //for lab test
            else if (paymentcategory == config_1.default.category[2]) {
                //update lab test
                yield (0, lab_1.updatelabbyquery)({ payment: id }, { status: config_1.default.status[5] });
            }
            //update for pharmacy
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
//print receipt
function printreceipt(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { paymentreference } = req.params;
            const { firstName, lastName } = (req.user).user;
            var staffname = `${firstName} ${lastName}`;
            //paymentreference
            var query = { paymentreference, status: config_1.default.status[3] };
            var populatequery = 'patient';
            let queryresult = yield (0, payment_1.readallpayment)({ paymentreference, status: config_1.default.status[3] }, populatequery);
            //get total sum
            // Aggregation to calculate sum and add it as a new field
            let totalAmount = yield (0, payment_1.readallpaymentaggregate)([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: null, // null means no grouping, we just want the total sum for the entire collection
                        totalAmount: { $sum: "$amount" } // Sum of the itemPrice for all documents
                    }
                },
                {
                    $project: {
                        totalAmount: 1,
                        _id: 0
                    }
                }
            ]);
            //update numberoftimesprinted
            yield (0, payment_1.updatepaymentbyquery)(query, { $inc: { numberoftimesprinted: 1 } });
            res.json({
                queryresult,
                totalAmount,
                timestamp: new Date().toLocaleString("en-NG", {
                    timeZone: "Africa/Lagos"
                }),
                printedbystaffname: staffname,
                status: true,
            });
        }
        catch (e) {
            console.log(e);
            res.status(403).json({ status: false, msg: e.message });
        }
    });
}
