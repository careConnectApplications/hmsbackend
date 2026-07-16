import fs from 'fs/promises';
const { v4: uuidv4 } = require('uuid');
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import configuration from "../config";
import * as path from 'path';
import exeltojson from 'convert-excel-to-json';
import { readonepatient } from '../dao/patientmanagement';
import { readoneadmission } from '../dao/admissions';
import { readonepayment } from "../dao/payment"
import { count } from "console";
export var encrypt = async function (password: any) {
  try {
    //generate a salt
    const salt = await bcrypt.genSalt(10);
    //generate password hash
    return await bcrypt.hash(password, salt);
  }
  catch (error: any) {
    throw new Error(configuration.error.errorencryptingpassword);

  }


}
export var isValidPassword = async function (newPassword: any, currentpassword: any) {
  try {
    return await bcrypt.compare(newPassword, currentpassword);

  }
  catch (error) {
    throw new Error(configuration.error.errorvalidatingpassword);
  }

}

export var sendTokenResponse = (user: any) => {
  const { firstName, lastName, role, staffId, email, clinic, _id, roleId } = user;
  const token = jwt.sign({ user: { firstName, lastName, role, staffId, email, clinic, _id, roleId } }, process.env.KEYGEN as string, { expiresIn: "1d" });

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  return { token, options };

};

export var mail = async function mail(to: any, subject: any, textmessage: any) {
  const transporter = nodemailer.createTransport({
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
  let info = await transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
    else console.log(info);

  });
}
export async function storeUniqueNumber(n: number) {
  try {

    // Generate unique 7-digit number
    let uniqueNumber = await generateRandomNumber(n);


    // Check if the number already exists in the collection
    const existing = await readonepatient({
      MRN: uniqueNumber
    }, {}, '', '');

    if (existing) {
      console.log(`Number ${uniqueNumber} already exists. Generating a new one.`);
      return storeUniqueNumber(n); // Retry if duplicate
    }

    return uniqueNumber;

  } catch (err: any) {
    throw new Error(err.message);
  }
}
export function generateRandomNumber(n: number) {
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
export function validateinputfaulsyvalue(input: any) {
  for (const key in input) {
    if (!input[key]) {
      throw new Error(`${key} ${configuration.error.errorisrequired}`);

    }
  }
}
export function validateinputyesno(input: any) {
  for (const key in input) {
    if (!(configuration.ishmo).includes(input[key])) {
      throw new Error(`${key} ${configuration.error.erroroption}`);

    }
  }
}
export function validateinputfornumber(input: any) {
  for (const key in input) {
    if (isNaN(input[key])) {
      throw new Error(`${key} ${configuration.error.errormustbenumber}`);

    }
  }
}
export const uploadbase64image = async (imageBase64: any) => {

  const filename = uuidv4();
  if (!imageBase64) {
    throw new Error(configuration.error.errorbase64);
  }

  // Extract the actual base64 string (strip metadata if present)
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Optional: Get file extension from base64 header
  const ext = imageBase64.match(/^data:image\/(\w+);base64/);
  const fileExt = ext ? ext[1] : 'png';
  const filePath = path.join(process.cwd(), `${configuration.useruploaddirectory}`, `${filename}.${fileExt}`);
  // Save the image
  await fs.writeFile(filePath, buffer);
  return `${filename}.${fileExt}`;
}
export function uploaddocument(file: any, filename: any, allowedextension: any, uploadpath: any) {

  const fileName = file.name;
  const size = file.data.length / 1024;
  const extension = path.extname(fileName);
  const renamedurl = `${filename}${extension}`;

  if (!allowedextension.includes(extension)) {
    throw new Error(configuration.error.errorfilextension);
  }

  if (size > configuration.allowedfilesize) {
    throw new Error(configuration.error.errorfilelarge);
  }


  //upload excel sheet
  return new Promise((resolve, reject) => {
    file.mv(`${uploadpath}/${renamedurl}`, async (e: any) => {
      if (e) {
        //logger.error(e.message);
        reject(e);
        //throw new Error(configuration.error.errorfileupload);
      }
      else {
        resolve('completed');
      }
    });

  })
}

//convert excel to json
export function convertexceltojson(pathtoexcelsheet: any, nameofsheet: any, columnmapping: any) {
  var jsonresult = exeltojson({
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


export const isObjectAvailable = (objectName: any) => {
  if (!objectName || objectName.constructor !== Object) {
    return false;

  }
  //console.log(objectName.constructor === Object)
  //return Object.keys(objectName).length === 0;
  return Object.keys(objectName).length >= 0 && objectName.constructor === Object;

}


export async function validatepayment(patient: any, servicetype: any) {
  try {
    // Ensure patient has made a paid Appointment payment today, unless they are currently admitted
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    console.log("todayStart", todayStart);
    console.log("todayEnd", todayEnd);
    console.log("configuration.category[0]", configuration.category[0]);
    console.log("configuration.category[3]", configuration.category[3])
    console.log("patient", patient);
    console.log("configuration.status[3]", configuration.status[3])
    const findAdmissionForPayment = await readoneadmission({ patient: patient, status: { $ne: configuration.admissionstatus[5] } }, {}, '');

    if (!findAdmissionForPayment) {
      // Find patient and check patient.isHMOCover == configuration.ishmo[1]
      const patientId = patient && patient._id ? patient._id : patient;
      const foundPatient = await readonepatient({ _id: patientId }, {}, '', '');
      
      if (foundPatient && foundPatient.isHMOCover == configuration.ishmo[1]) {
        // HMO patient does not need to make payment.
      } else {
        // Patient is not admitted — enforce payment check
        const appointmentPayment = await readonepayment({
          patient: patient,
          status: configuration.status[3],            // 'paid'
          paymentcategory: { $in: [configuration.category[0], configuration.category[3]] },  // 'Appointment' 3 or Patient Registration
          createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        if (!appointmentPayment) {
          throw new Error(`Patient has not made payment for an appointment today. ${servicetype} order cannot be processed.`);
        }
      }
    }
    return findAdmissionForPayment;
  }
  catch (error: any) {
    throw new Error(error.message);
  }
}