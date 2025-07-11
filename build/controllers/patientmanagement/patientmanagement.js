"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.uploadpix = exports.createpatients = void 0;
exports.searchpartient = searchpartient;
exports.getallhmopatients = getallhmopatients;
exports.bulkuploadhmopatients = bulkuploadhmopatients;
exports.updateauthorizationcode = updateauthorizationcode;
exports.getallpatients = getallpatients;
exports.getonepatients = getonepatients;
exports.updatepatients = updatepatients;
const config_1 = __importDefault(require("../../config"));
const uuid_1 = require("uuid");
const moment_1 = __importDefault(require("moment"));
const path = __importStar(require("path"));
const patientmanagement_1 = require("../../dao/patientmanagement");
const price_1 = require("../../dao/price");
const payment_1 = require("../../dao/payment");
const vitalcharts_1 = require("../../dao/vitalcharts");
const otherservices_1 = require("../../utils/otherservices");
const appointment_1 = require("../../dao/appointment");
const pricingmodel_1 = require("../../dao/pricingmodel");
const audit_1 = require("../../dao/audit");
//Insurance upload
//get hmo patient 
//read all patients
//search patients 
function searchpartient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //var settings = await configuration.settings();
            var selectquery = { "title": 1, "firstName": 1, "status": 1, "middleName": 1, "lastName": 1, "country": 1, "stateOfResidence": 1, "LGA": 1, "address": 1, "age": 1, "dateOfBirth": 1, "gender": 1, "nin": 1, "phoneNumber": 1, "email": 1, "oldMRN": 1, "nextOfKinName": 1, "nextOfKinRelationship": 1, "nextOfKinPhoneNumber": 1, "nextOfKinAddress": 1,
                "maritalStatus": 1, "disability": 1, "occupation": 1, "isHMOCover": 1, "HMOName": 1, "HMOId": 1, "HMOPlan": 1, "MRN": 1, "createdAt": 1, "passport": 1 };
            const { searchparams } = req.params;
            const queryresult = yield (0, patientmanagement_1.readallpatient)({ $or: [{ lastName: { $regex: searchparams, $options: 'i' } }, { firstName: { $regex: searchparams, $options: 'i' } }, { HMOId: { $regex: searchparams, $options: 'i' } }, { MRN: { $regex: searchparams, $options: 'i' } }, { phoneNumber: { $regex: searchparams, $options: 'i' } }] }, selectquery, '', '');
            res.status(200).json({
                queryresult,
                status: true
            });
        }
        catch (e) {
        }
    });
}
function getallhmopatients(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //var settings = await configuration.settings();
            var selectquery = { "title": 1, "firstName": 1, "status": 1, "middleName": 1, "lastName": 1, "country": 1, "stateOfResidence": 1, "LGA": 1, "address": 1, "age": 1, "dateOfBirth": 1, "gender": 1, "nin": 1, "phoneNumber": 1, "email": 1, "oldMRN": 1, "nextOfKinName": 1, "nextOfKinRelationship": 1, "nextOfKinPhoneNumber": 1, "nextOfKinAddress": 1,
                "maritalStatus": 1, "disability": 1, "occupation": 1, "isHMOCover": 1, "HMOName": 1, "HMOId": 1, "HMOPlan": 1, "MRN": 1, "createdAt": 1, "passport": 1 };
            //var populatequery="payment";
            const queryresult = yield (0, patientmanagement_1.readallpatient)({ isHMOCover: config_1.default.ishmo[1] }, selectquery, '', '');
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
//bulk upload users
function bulkuploadhmopatients(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { firstName, lastName } = (req.user).user;
            var actor = `${firstName} ${lastName}`;
            const file = req.files.file;
            const { HMOName } = req.body;
            const filename = config_1.default.hmouploadfilename;
            let allowedextension = ['.csv', '.xlsx'];
            let uploadpath = `${process.cwd()}/${config_1.default.useruploaddirectory}`;
            //acieve document
            yield (0, patientmanagement_1.updatepatientmanybyquery)({ HMOName }, { status: config_1.default.status[15] });
            //await createpatientachieve(patientdetails);
            //delete patient management
            //await deletePatietsByCondition({HMOName});
            var columnmapping = {
                A: "title",
                B: "firstName",
                C: "middleName",
                D: "lastName",
                E: "country",
                F: "stateOfResidence",
                G: "LGA",
                H: "address",
                I: "age",
                J: "dateOfBirth",
                K: "gender",
                L: "nin",
                M: "phoneNumber",
                N: "email",
                O: "oldMRN",
                P: "nextOfKinName",
                Q: "nextOfKinRelationship",
                R: "nextOfKinPhoneNumber",
                S: "nextOfKinAddress",
                T: "maritalStatus",
                U: "disability",
                V: "occupation",
                W: "HMOPlan",
                X: "HMOId"
            };
            yield (0, otherservices_1.uploaddocument)(file, filename, allowedextension, uploadpath);
            //convert uploaded excel to json
            var convert_to_json = (0, otherservices_1.convertexceltojson)(`${uploadpath}/${filename}${path.extname(file.name)}`, config_1.default.hmotemplate, columnmapping);
            //save to database
            var { hmo } = convert_to_json;
            if (hmo.length > 0) {
                for (var i = 0; i < hmo.length; i++) {
                    hmo[i].isHMOCover = config_1.default.ishmo[1];
                    hmo[i].HMOName = HMOName;
                    const { phoneNumber, firstName, lastName, gender, HMOId } = hmo[i];
                    (0, otherservices_1.validateinputfaulsyvalue)({ phoneNumber, firstName, lastName, gender, HMOId });
                    console.log((phoneNumber.toString()).length);
                    if ((phoneNumber.toString()).length !== 11 && (phoneNumber.toString()).length !== 10) {
                        throw new Error(`${phoneNumber} ${config_1.default.error.errorelevendigit}`);
                    }
                    if (hmo[i].dateOfBirth)
                        hmo[i].age = (0, moment_1.default)().diff((0, moment_1.default)(hmo[i].dateOfBirth), 'years');
                    //if not dateObirth but age calculate date of birth
                    if (!hmo[i].dateOfBirth && hmo[i].age)
                        hmo[i].dateOfBirth = (0, moment_1.default)().subtract(Number(hmo[i].age), 'years').format('YYYY-MM-DD');
                    /*
                    const foundUser:any =  await readonepatient({phoneNumber},{},'','');
                    //category
                    if(foundUser && phoneNumber !== configuration.defaultphonenumber){
                        throw new Error(`Patient ${configuration.error.erroralreadyexit}`);
            
                    }
                        */
                    var uniqunumber = yield (0, otherservices_1.storeUniqueNumber)(4);
                    // chaorten the MRN to alphanumeric 
                    hmo[i].MRN = uniqunumber;
                    hmo[i].status = config_1.default.status[1];
                    hmo[i].password = config_1.default.defaultPassword;
                    const createpatientqueryresult = yield (0, patientmanagement_1.createpatientifnotexit)({ HMOId: hmo[i].HMOId, HMOName }, hmo[i]);
                }
            }
            yield (0, audit_1.createaudit)({ action: "Bulk Uploaded HMO Patient", actor, affectedentity: HMOName });
            res.status(200).json({ status: true, queryresult: 'Bulk upload was successfull' });
        }
        catch (e) {
            //logger.error(e.message);
            res.status(403).json({ status: false, msg: e.message });
        }
    });
}
//update authorization code
function updateauthorizationcode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get id
            const { id } = req.params;
            const { authorizationcode } = req.body;
            var queryresult = yield (0, patientmanagement_1.updatepatient)(id, { authorizationcode });
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
//add patiient
var createpatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var appointmentid = String(Date.now());
        if (!(req.body.isHMOCover)) {
            req.body.isHMOCover = config_1.default.ishmo[0];
        }
        if (!(req.body.isHMOCover == config_1.default.ishmo[1] || req.body.isHMOCover == true)) {
            delete req.body.authorizationcode;
            delete req.body.facilitypateintreferedfrom;
        }
        req.body.appointmentcategory = config_1.default.category[3];
        req.body.appointmenttype = config_1.default.category[3];
        var { facilitypateintreferedfrom, authorizationcode, policecase, physicalassault, sexualassault, policaename, servicenumber, policephonenumber, division, dateOfBirth, phoneNumber, firstName, lastName, gender, clinic, reason, appointmentdate, appointmentcategory, appointmenttype, isHMOCover } = req.body;
        //validation
        (0, otherservices_1.validateinputfaulsyvalue)({ phoneNumber, firstName, lastName, gender, clinic, appointmentdate, appointmentcategory, appointmenttype, isHMOCover });
        //define the service type
        /*
        if(isHMOCover==configuration.ishmo[1] || isHMOCover == true){
          console.log("here");
          //throw new Error(configuration.error.errorauthorizehmo);
          req.body.patienttype = configuration.patienttype[1];
          req.body.status = configuration.status[1];
          validateinputfaulsyvalue({authorizationcode});

        }
          */
        if (authorizationcode) {
            req.body.patienttype = config_1.default.patienttype[1];
        }
        //define the service type
        if (isHMOCover == config_1.default.ishmo[1] || isHMOCover == true) {
            req.body.status = config_1.default.status[1];
        }
        //get token from header and extract clinic
        //check for 11 digit
        if (phoneNumber.length !== 11) {
            throw new Error(config_1.default.error.errorelevendigit);
        }
        if (dateOfBirth)
            req.body.age = (0, moment_1.default)().diff((0, moment_1.default)(dateOfBirth), 'years');
        //if not dateObirth but age calculate date of birth
        if (!dateOfBirth && req.body.age)
            req.body.dateOfBirth = (0, moment_1.default)().subtract(Number(req.body.age), 'years').format('YYYY-MM-DD');
        console.log(req.body);
        var selectquery = { "title": 1, "firstName": 1, "middleName": 1, "lastName": 1, "country": 1, "stateOfResidence": 1, "LGA": 1, "address": 1, "age": 1, "dateOfBirth": 1, "gender": 1, "nin": 1, "phoneNumber": 1, "email": 1, "oldMRN": 1, "nextOfKinName": 1, "nextOfKinRelationship": 1, "nextOfKinPhoneNumber": 1, "nextOfKinAddress": 1,
            "maritalStatus": 1, "disability": 1, "occupation": 1, "isHMOCover": 1, "HMOName": 1, "HMOId": 1, "HMOPlan": 1, "MRN": 1, "createdAt": 1, "passport": 1 };
        const foundUser = yield (0, patientmanagement_1.readonepatient)({ phoneNumber }, selectquery, '', '');
        //category
        if (foundUser && phoneNumber !== config_1.default.defaultphonenumber) {
            throw new Error(`Patient ${config_1.default.error.erroralreadyexit}`);
        }
        //var settings =await configuration.settings();
        //validate if price is set for patient registration
        //var newRegistrationPrice = await readoneprice({servicecategory:settings.servicecategory[0].category});
        // var appointmentPrice = await readoneprice({servicecategory:appointmentcategory,servicetype:appointmenttype});
        //console.log('appointmentprice', appointmentPrice);
        var { isHMOCover } = req.body;
        var newRegistrationPrice;
        const foundPricingmodel = yield (0, pricingmodel_1.readonepricemodel)({ pricingtype: config_1.default.pricingtype[1] });
        if (foundPricingmodel) {
            const age = Number(req.body.age);
            const isAdult = age >= 18;
            const isChild = age < 18;
            //check for error
            console.log("Clinic from pricing model:", foundPricingmodel.exactnameofancclinic);
            console.log("Clinic from request:", clinic);
            console.log("Is adult:", isAdult);
            console.log("Age:", age);
            //confirm the type of pricing model
            if (foundPricingmodel.exactnameofancclinic == clinic) {
                console.log("clinic");
                newRegistrationPrice = yield (0, price_1.readoneprice)({ servicecategory: config_1.default.category[3], isHMOCover, servicetype: clinic });
            }
            else if (isAdult) {
                console.log("greater than 18");
                newRegistrationPrice = yield (0, price_1.readoneprice)({ servicecategory: config_1.default.category[3], isHMOCover, servicetype: { $regex: foundPricingmodel.exactnameofservicetypeforadult, $options: 'i' } });
            }
            else if (isChild) {
                console.log("less than 18");
                newRegistrationPrice = yield (0, price_1.readoneprice)({ servicecategory: config_1.default.category[3], isHMOCover, servicetype: { $regex: foundPricingmodel.exactnameofservicetypeforchild, $options: 'i' } });
            }
            else {
                console.log("errror /////");
                //return error
                throw new Error(`${config_1.default.error.errornopriceset} ${foundPricingmodel.exactnameofservicetypeforchild} ${foundPricingmodel.exactnameofservicetypeforadult} or ${clinic}`);
            }
            //find pricing model
        }
        else {
            newRegistrationPrice = yield (0, price_1.readoneprice)({ servicecategory: config_1.default.category[3], isHMOCover, servicetype: config_1.default.category[3] });
        }
        //use age to calculate price
        console.log("newRegistrationPrice", newRegistrationPrice);
        if (!(isHMOCover == config_1.default.ishmo[1] || isHMOCover == true) && !newRegistrationPrice) {
            console.log("second errror /////");
            throw new Error(config_1.default.error.errornopriceset);
        }
        var uniqunumber = yield (0, otherservices_1.storeUniqueNumber)(4);
        // chaorten the MRN to alphanumeric 
        req.body.MRN = uniqunumber;
        req.body.password = config_1.default.defaultPassword;
        //other validations
        var payment = [];
        const createpatientqueryresult = yield (0, patientmanagement_1.createpatient)(req.body);
        //create payment
        //create payment for only none hmo patient
        let queryappointmentresult;
        let queryresult;
        let vitals = yield (0, vitalcharts_1.createvitalcharts)({ status: config_1.default.status[8] });
        if (isHMOCover == config_1.default.ishmo[1] || isHMOCover == true) {
            queryappointmentresult = yield (0, appointment_1.createappointment)({ policecase, physicalassault, sexualassault, policaename, servicenumber, policephonenumber, division, appointmentid, patient: createpatientqueryresult._id, clinic, reason, appointmentdate, appointmentcategory, appointmenttype, vitals: vitals._id, firstName, lastName, MRN: createpatientqueryresult === null || createpatientqueryresult === void 0 ? void 0 : createpatientqueryresult.MRN, HMOId: createpatientqueryresult === null || createpatientqueryresult === void 0 ? void 0 : createpatientqueryresult.HMOId, HMOName: createpatientqueryresult === null || createpatientqueryresult === void 0 ? void 0 : createpatientqueryresult.HMOName });
            queryresult = yield (0, patientmanagement_1.updatepatient)(createpatientqueryresult._id, { $push: { appointment: queryappointmentresult._id } });
        }
        else {
            const createpaymentqueryresult = yield (0, payment_1.createpayment)({ firstName, lastName, MRN: req.body.MRN, phoneNumber, paymentreference: req.body.MRN, paymentype: newRegistrationPrice.servicetype, paymentcategory: newRegistrationPrice.servicecategory, patient: createpatientqueryresult._id, amount: Number(newRegistrationPrice.amount) });
            // const createappointmentpaymentqueryresult =await createpayment({paymentreference:appointmentid,paymentype:appointmenttype,paymentcategory:appointmentcategory,patient:createpatientqueryresult._id,amount:Number(appointmentPrice.amount)})
            payment.push(createpaymentqueryresult._id);
            //payment.push(createappointmentpaymentqueryresult._id);
            //update createpatientquery
            queryappointmentresult = yield (0, appointment_1.createappointment)({ policecase, physicalassault, sexualassault, policaename, servicenumber, policephonenumber, division, status: config_1.default.status[5], appointmentid, payment: createpaymentqueryresult._id, patient: createpatientqueryresult._id, clinic, reason, appointmentdate, appointmentcategory, appointmenttype, vitals: vitals._id, MRN: createpatientqueryresult === null || createpatientqueryresult === void 0 ? void 0 : createpatientqueryresult.MRN, HMOId: createpatientqueryresult === null || createpatientqueryresult === void 0 ? void 0 : createpatientqueryresult.HMOId, HMOName: createpatientqueryresult === null || createpatientqueryresult === void 0 ? void 0 : createpatientqueryresult.HMOName });
            queryresult = yield (0, patientmanagement_1.updatepatient)(createpatientqueryresult._id, { payment, $push: { appointment: queryappointmentresult._id } });
        }
        res.status(200).json({ queryresult, status: true });
    }
    catch (error) {
        console.log(error);
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.createpatients = createpatients;
//read all patients
function getallpatients(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //apply pagination
            const page = parseInt(req.query.page) || 1;
            const size = parseInt(req.query.size) || 150;
            const filter = {};
            // Add filters based on query parameters
            if (req.query.firstName) {
                //console.log(req.query.firstName)
                filter.firstName = new RegExp(req.query.firstName, 'i'); // Case-insensitive search for name
            }
            if (req.query.MRN) {
                filter.MRN = new RegExp(req.query.MRN, 'i');
            }
            if (req.query.HMOId) {
                filter.HMOId = new RegExp(req.query.HMOId, 'i'); // Case-insensitive search for email
            }
            if (req.query.lastName) {
                filter.lastName = new RegExp(req.query.lastName, 'i'); // Case-insensitive search for email
            }
            if (req.query.phoneNumber) {
                filter.phoneNumber = new RegExp(req.query.phoneNumber, 'i'); // Case-insensitive search for email
            }
            if (req.query.email) {
                filter.email = new RegExp(req.query.email, 'i'); // Case-insensitive search for email
            }
            //var settings = await configuration.settings();
            var selectquery = { "title": 1, "firstName": 1, "status": 1, "middleName": 1, "lastName": 1, "country": 1, "stateOfResidence": 1, "LGA": 1, "address": 1, "age": 1, "dateOfBirth": 1, "gender": 1, "nin": 1, "phoneNumber": 1, "email": 1, "oldMRN": 1, "nextOfKinName": 1, "nextOfKinRelationship": 1, "nextOfKinPhoneNumber": 1, "nextOfKinAddress": 1,
                "maritalStatus": 1, "disability": 1, "occupation": 1, "isHMOCover": 1, "HMOName": 1, "HMOId": 1, "HMOPlan": 1, "MRN": 1, "createdAt": 1, "passport": 1, "authorizationcode": 1, "patienttype": 1 };
            //var populatequery="payment";
            var populatequery = {
                path: "payment",
                // match: { paymentcategory: { $eq: settings.servicecategory[0].category } },
                match: { paymentcategory: { $eq: config_1.default.category[3] } },
                select: {
                    status: 1,
                    paymentype: 1
                },
            };
            var populateappointmentquery = "appointment";
            const queryresult = yield (0, patientmanagement_1.readallpatientpaginated)(filter, selectquery, populatequery, populateappointmentquery, page, size);
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
//get record for a particular patient
function getonepatients(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            var selectquery = { "title": 1, "firstName": 1, "middleName": 1, "lastName": 1, "country": 1, "stateOfResidence": 1, "LGA": 1, "address": 1, "age": 1, "dateOfBirth": 1, "gender": 1, "nin": 1, "phoneNumber": 1, "email": 1, "oldMRN": 1, "nextOfKinName": 1, "nextOfKinRelationship": 1, "nextOfKinPhoneNumber": 1, "nextOfKinAddress": 1,
                "maritalStatus": 1, "disability": 1, "occupation": 1, "isHMOCover": 1, "HMOName": 1, "HMOId": 1, "HMOPlan": 1, "MRN": 1, "createdAt": 1, "passport": 1 };
            var populatequery = 'payment';
            const queryresult = yield (0, patientmanagement_1.readonepatient)({ _id: id }, selectquery, populatequery, 'appointment');
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
//update a patient
function updatepatients(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //get id
            const { id, status } = req.params;
            //reject if status update
            if (status) {
            }
            var queryresult = yield (0, patientmanagement_1.updatepatient)(id, req.body);
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
//upload patients photo
var uploadpix = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.files);
        const file = req.files.file;
        const fileName = file.name;
        const filename = "patientpassport" + (0, uuid_1.v4)();
        let allowedextension = ['.jpg', '.png', '.jpeg'];
        let uploadpath = `${process.cwd()}/${config_1.default.useruploaddirectory}`;
        const extension = path.extname(fileName);
        const renamedurl = `${filename}${extension}`;
        //upload pix to upload folder
        yield (0, otherservices_1.uploaddocument)(file, filename, allowedextension, uploadpath);
        const { id } = req.params;
        //update pix name in patient
        const queryresult = yield (0, patientmanagement_1.updatepatient)(id, { passport: renamedurl });
        res.json({
            queryresult,
            status: true
        });
    }
    catch (e) {
        //logger.error(e.message);
        res.json({ status: false, msg: e.message });
    }
});
exports.uploadpix = uploadpix;
