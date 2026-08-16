import mongoose from 'mongoose';
import { validateinputfaulsyvalue } from "../../utils/otherservices";
import { readoneappointment, updateappointment } from "../../dao/appointment";
import { createadmission, readalladmission, updateadmission, readoneadmission } from "../../dao/admissions";
import { updatepatient, readonepatient } from "../../dao/patientmanagement";
import { readonewardmanagement, updatewardmanagement } from "../../dao/wardmanagement";
import { readoneclinic } from "../../dao/clinics";
import { readallpayment } from "../../dao/payment";
import configuration from "../../config";
const { ObjectId } = mongoose.Types;

//refer for admission
export var referadmission = async (req: any, res: any) => {
  try {

    const { firstName, lastName } = (req.user).user;
    var admissionid: any = String(Date.now());
    //accept _id from request
    const { id } = req.params;
    console.log('id', id);
    //doctorname,patient,appointment
    var { alldiagnosis, referedward, admittospecialization, referddate, appointmentid } = req.body;
    validateinputfaulsyvalue({ id, alldiagnosis, referedward, admittospecialization, referddate });
    //confirm ward
    const referedwardid = new ObjectId(referedward);
    const foundWard = await readonewardmanagement({ _id: referedwardid }, '');
    if (!foundWard) {
      throw new Error(`Ward doesnt ${configuration.error.erroralreadyexit}`);

    }
    var appointment: any;
    if (appointmentid) {
      appointmentid = new ObjectId(appointmentid);
      console.log("appoitmentid", appointmentid);
      appointment = await readoneappointment({ _id: appointmentid }, {}, '');
      console.log("appointment", appointment);
      if (!appointment) {
        //create an appointment
        throw new Error(`Appointment donot ${configuration.error.erroralreadyexit}`);

      }


    }
    //confrim admittospecialization
    //validate specialization
    const foundSpecilization = await readoneclinic({ clinic: admittospecialization }, '');
    if (!foundSpecilization) {
      throw new Error(`Specialization doesnt ${configuration.error.erroralreadyexit}`);

    }

    //find the record in patient and validate

    var patient = await readonepatient({ _id: id, status: configuration.status[1] }, {}, '', '');

    if (!patient) {
      throw new Error(`Patient donot ${configuration.error.erroralreadyexit} or has not made payment for registration`);

    }

    //check that patient have not been admitted
    var findAdmission = await readoneadmission({ patient: patient._id, status: { $ne: configuration.admissionstatus[5] } }, {}, '');
    if (findAdmission) {
      throw new Error(`Patient Admission ${configuration.error.erroralreadyexit}`);

    }
    //create admission
    var admissionrecord: any = await createadmission({ alldiagnosis, referedward, admittospecialization, referddate, doctorname: firstName + " " + lastName, appointment: id, patient: patient._id, admissionid });
    //update patient 
    var queryresult = await updatepatient(patient._id, { $push: { admission: admissionrecord._id } });
    if (appointmentid) {
      await updateappointment(appointment._id, { admission: admissionrecord._id });

    }
    res.status(200).json({ queryresult: admissionrecord, status: true });
  }

  catch (error: any) {
    res.status(403).json({ status: false, msg: error.message });

  }

}
// get all admission patient
export async function getallreferedforadmission(req: any, res: any) {
  try {
    const { ward } = req.params;
    const referedward = new ObjectId(ward);
    const queryresult = await readalladmission({ referedward }, {}, 'referedward', 'patient');
    res.status(200).json({
      queryresult,
      status: true
    });

  }
  catch (e: any) {
    res.status(403).json({ status: false, msg: e.message });

  }

}
//get all admitted patient
// get all admission patient
export async function getalladmissionbypatient(req: any, res: any) {
  try {

    const { patient } = req.params;
    console.log(patient);
    const referedward = new ObjectId(patient);
    const queryresult = await readalladmission({ patient }, {}, 'referedward', 'patient');
    res.status(200).json({
      queryresult,
      status: true
    });

  }
  catch (e: any) {
    res.status(403).json({ status: false, msg: e.message });

  }

}
//admited,to transfer,transfer,to discharge, discharge
export async function updateadmissionstatus(req: any, res: any) {
  const { id } = req.params;
  var { status, transfterto, dischargereason, dischargedate } = req.body;
  if (transfterto) {
    transfterto = new ObjectId(transfterto);
  }
  try {
    //validate that status is included in te status choice
    if (!(configuration.admissionstatus).includes(status))
      throw new Error(`${status} status doesnt ${configuration.error.erroralreadyexit}`);

    // ONLY validate when status is todischarge
    var reasonValue = dischargereason;
    var dischargeDateValue = dischargedate ? new Date(dischargedate) : new Date();

    if (status == configuration.admissionstatus[4]) {
      if (!reasonValue) {
        throw new Error(`dischargereason ${configuration.error.errorisrequired}`);
      }

      if (!(configuration.dischargereasons).includes(reasonValue)) {
        throw new Error(`dischargereason ${configuration.error.erroroption}`);
      }
    }

    const response = await readoneadmission({ _id: id }, {}, '');
    // check for availability of bed spaces in ward only for admitted
    if (!response) {
      throw new Error(`Admission donot ${configuration.error.erroralreadyexit}`);
    }
    var ward: any = await readonewardmanagement({ _id: response?.referedward }, {});
    if (!ward) {
      // return error
      throw new Error(`Ward donot ${configuration.error.erroralreadyexit}`);
    }

    var transftertoward: any = transfterto ? await readonewardmanagement({ _id: transfterto }, {}) : null;
    if (transfterto && status == configuration.admissionstatus[2] && !transftertoward) {
      // return error
      throw new Error(`Ward to be transfered donot  ${configuration.error.erroralreadyexit}`);
    }
    if (transfterto && status == configuration.admissionstatus[2] && transftertoward.vacantbed < 1) {
      throw new Error(`${transftertoward.wardname}  ${configuration.error.errorvacantspace}`);
    }
    if ((status == configuration.admissionstatus[1] || status == configuration.admissionstatus[3]) && ward.vacantbed < 1) {
      throw new Error(`${ward.wardname}  ${configuration.error.errorvacantspace}`);
    }

    var updatePayload: any = { status };
    if (status == configuration.admissionstatus[4]) {
      updatePayload.dischargereason = reasonValue;
      updatePayload.dischargedate = dischargeDateValue;
    }

    const queryresult: any = await updateadmission(id, updatePayload);

    //if status is equal to admit reduce  ward count
    if (status == configuration.admissionstatus[1] || status == configuration.admissionstatus[3]) {
      await updatewardmanagement(queryresult.referedward, { $inc: { occupiedbed: 1, vacantbed: -1 } });
    }
    // status is equal to  totransfer reduce target ward and increase source ward
    else if (status == configuration.admissionstatus[2]) {
      await updateadmission(id, { status, referedward: transfterto, previousward: queryresult.referedward });
    }
    else if (status == configuration.admissionstatus[5]) {
      //check that the patient is not owing
      var paymentrecord: any = await readallpayment({ paymentreference: response.admissionid, status: { $ne: configuration.status[3] } }, '');
      if ((paymentrecord.paymentdetails).length > 0) {
        throw new Error(configuration.error.errorpayment);

      }

      await updatewardmanagement(queryresult.referedward, { $inc: { occupiedbed: -1, vacantbed: 1 } });

    }
    // status is equal to  transfer reduce target ward and increase 
    if (status == configuration.admissionstatus[3]) {
      await updatewardmanagement(queryresult.previousward, { $inc: { occupiedbed: -1, vacantbed: 1 } });

    }

    res.status(200).json({
      queryresult,
      status: true
    });

  }
  catch (e: any) {
    console.log(e);
    res.status(403).json({ status: false, msg: e.message });

  }

}


