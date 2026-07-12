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
exports.isObjectAvailable = exports.uploadbase64image = exports.mail = exports.sendTokenResponse = exports.isValidPassword = exports.encrypt = void 0;
exports.storeUniqueNumber = storeUniqueNumber;
exports.generateRandomNumber = generateRandomNumber;
exports.validateinputfaulsyvalue = validateinputfaulsyvalue;
exports.validateinputyesno = validateinputyesno;
exports.validateinputfornumber = validateinputfornumber;
exports.uploaddocument = uploaddocument;
exports.convertexceltojson = convertexceltojson;
exports.validatepayment = validatepayment;
const promises_1 = __importDefault(require("fs/promises"));
const { v4: uuidv4 } = require('uuid');
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const path = __importStar(require("path"));
const convert_excel_to_json_1 = __importDefault(require("convert-excel-to-json"));
const patientmanagement_1 = require("../dao/patientmanagement");
const admissions_1 = require("../dao/admissions");
const payment_1 = require("../dao/payment");
var encrypt = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //generate a salt
            const salt = yield bcryptjs_1.default.genSalt(10);
            //generate password hash
            return yield bcryptjs_1.default.hash(password, salt);
        }
        catch (error) {
            throw new Error(config_1.default.error.errorencryptingpassword);
        }
    });
};
exports.encrypt = encrypt;
var isValidPassword = function (newPassword, currentpassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield bcryptjs_1.default.compare(newPassword, currentpassword);
        }
        catch (error) {
            throw new Error(config_1.default.error.errorvalidatingpassword);
        }
    });
};
exports.isValidPassword = isValidPassword;
var sendTokenResponse = (user) => {
    const { firstName, lastName, role, staffId, email, clinic, _id, roleId } = user;
    const token = jsonwebtoken_1.default.sign({ user: { firstName, lastName, role, staffId, email, clinic, _id, roleId } }, process.env.KEYGEN, { expiresIn: "1d" });
    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    return { token, options };
};
exports.sendTokenResponse = sendTokenResponse;
var mail = function mail(to, subject, textmessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const transporter = nodemailer_1.default.createTransport({
            port: 465,
            host: "smtp.gmail.com",
            auth: {
                user: "malachi.egbugha3@gmail.com",
                pass: "Maeg/1987",
            },
            secure: true,
        });
        const mailData = {
            from: '"From HMSB" <noreply@hmsb.com>',
            to: `${to}`,
            subject: `${subject}`,
            text: `${textmessage}`,
        };
        let info = yield transporter.sendMail(mailData, function (err, info) {
            if (err)
                console.log(err);
            else
                console.log(info);
        });
    });
};
exports.mail = mail;
function storeUniqueNumber(n) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Generate unique 7-digit number
            let uniqueNumber = yield generateRandomNumber(n);
            // Check if the number already exists in the collection
            const existing = yield (0, patientmanagement_1.readonepatient)({
                MRN: uniqueNumber
            }, {}, '', '');
            if (existing) {
                console.log(`Number ${uniqueNumber} already exists. Generating a new one.`);
                return storeUniqueNumber(n); // Retry if duplicate
            }
            return uniqueNumber;
        }
        catch (err) {
            throw new Error(err.message);
        }
    });
}
function generateRandomNumber(n) {
    //return Math.floor((Math.random() * Math.random() * Math.random()) * (9 * Math.pow(10, n - 1))) + Math.pow(10, n - 1) + Math.floor(Date.now()/1000000);
    // let number = Math.floor(1000000 + Math.random() * 9000000); // Generates a number between 1000000 and 9999999
    //return number;
    // Get the current timestamp (in milliseconds)
    //const timestamp = Date.now().toString(36); // Convert timestamp to base-36 (alphanumeric)
    // Take the first 7 characters (if needed, you can adjust this logic)
    //const uniqueString = timestamp.slice(-7); // Ensures we get the last 7 characters
    //return uniqueString.toUpperCase();
    return Math.floor(1000000 + Math.random() * 9000000);
}
function validateinputfaulsyvalue(input) {
    for (const key in input) {
        if (!input[key]) {
            throw new Error(`${key} ${config_1.default.error.errorisrequired}`);
        }
    }
}
function validateinputyesno(input) {
    for (const key in input) {
        if (!(config_1.default.ishmo).includes(input[key])) {
            throw new Error(`${key} ${config_1.default.error.erroroption}`);
        }
    }
}
function validateinputfornumber(input) {
    for (const key in input) {
        if (isNaN(input[key])) {
            throw new Error(`${key} ${config_1.default.error.errormustbenumber}`);
        }
    }
}
const uploadbase64image = (imageBase64) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = uuidv4();
    if (!imageBase64) {
        throw new Error(config_1.default.error.errorbase64);
    }
    // Extract the actual base64 string (strip metadata if present)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    // Optional: Get file extension from base64 header
    const ext = imageBase64.match(/^data:image\/(\w+);base64/);
    const fileExt = ext ? ext[1] : 'png';
    const filePath = path.join(process.cwd(), `${config_1.default.useruploaddirectory}`, `${filename}.${fileExt}`);
    // Save the image
    yield promises_1.default.writeFile(filePath, buffer);
    return `${filename}.${fileExt}`;
});
exports.uploadbase64image = uploadbase64image;
function uploaddocument(file, filename, allowedextension, uploadpath) {
    const fileName = file.name;
    const size = file.data.length / 1024;
    const extension = path.extname(fileName);
    const renamedurl = `${filename}${extension}`;
    if (!allowedextension.includes(extension)) {
        throw new Error(config_1.default.error.errorfilextension);
    }
    if (size > config_1.default.allowedfilesize) {
        throw new Error(config_1.default.error.errorfilelarge);
    }
    //upload excel sheet
    return new Promise((resolve, reject) => {
        file.mv(`${uploadpath}/${renamedurl}`, (e) => __awaiter(this, void 0, void 0, function* () {
            if (e) {
                //logger.error(e.message);
                reject(e);
                //throw new Error(configuration.error.errorfileupload);
            }
            else {
                resolve('completed');
            }
        }));
    });
}
//convert excel to json
function convertexceltojson(pathtoexcelsheet, nameofsheet, columnmapping) {
    var jsonresult = (0, convert_excel_to_json_1.default)({
        //sourceFile: 'C:\Users\malachi.egbugha\Documents\project\hmsbackend\uploads\hmo.csv',
        sourceFile: `${pathtoexcelsheet}`,
        sheets: [
            {
                // Excel Sheet Name
                name: nameofsheet,
                // Header Row -> be skipped and will not be present at our result object.
                header: {
                    rows: 1,
                },
                // Mapping columns to keys
                columnToKey: columnmapping,
            },
        ],
    });
    return jsonresult;
}
const isObjectAvailable = (objectName) => {
    if (!objectName || objectName.constructor !== Object) {
        return false;
    }
    //console.log(objectName.constructor === Object)
    //return Object.keys(objectName).length === 0;
    return Object.keys(objectName).length >= 0 && objectName.constructor === Object;
};
exports.isObjectAvailable = isObjectAvailable;
function validatepayment(patient) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ensure patient has made a paid Appointment payment today, unless they are currently admitted
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            const findAdmissionForPayment = yield (0, admissions_1.readoneadmission)({ patient: patient, status: { $ne: config_1.default.admissionstatus[5] } }, {}, '');
            if (!findAdmissionForPayment) {
                // Patient is not admitted — enforce payment check
                const appointmentPayment = yield (0, payment_1.readonepayment)({
                    patient: patient,
                    status: config_1.default.status[3], // 'paid'
                    paymentcategory: { $in: [config_1.default.category[0], config_1.default.category[3]] }, // 'Appointment' 3 or Patient Registration
                    createdAt: { $gte: todayStart, $lte: todayEnd }
                });
                if (!appointmentPayment) {
                    throw new Error('Patient has not made payment for an appointment today. Pharmacy order cannot be processed.');
                }
            }
            return findAdmissionForPayment;
        }
        catch (error) {
            throw new Error(error.message);
        }
    });
}
