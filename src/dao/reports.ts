import Payment from "../models/payment";
import Admission from "../models/admission";
import Appointment from "../models/appointment";
import Clinic from "../models/clinics";
import Wardmanagement from "../models/wardmanagement";
import Hmomanagement from "../models/hmomanagement";
import Procedure from "../models/procedure";
import Lab from "../models/lab";
import Radiology from "../models/radiology";
import Prescription from "../models/prescription";
import Patientsmanagement from "../models/patientmanagement";
import Nutrition from "../models/nutrition";

export async function readpatientsmanagementaggregate(input: any) {
  try {
    return await Patientsmanagement.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

export async function readpaymentaggregate(input: any) {
  try {
    return await Payment.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

export async function readhmoaggregate(input: any) {
  try {
    return await Hmomanagement.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

export async function readappointmentaggregate(input: any) {
  try {
    return await Appointment.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

export async function readadmissionaggregate(input: any) {
  try {
    return await Admission.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

export async function readclinicaggregate(input: any) {
  try {
    return await Clinic.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

export async function readwardaggregate(input: any) {
  try {
    return await Wardmanagement.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

export async function readprocedureaggregate(input: any) {
  try {
    return await Procedure.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

// lab aggregate
export async function readlabaggregate(input: any) {
  try {
    return await Lab.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

// radiology
export async function readradiologyaggregate(input: any) {
  try {
    return await Radiology.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

// Prescription
export async function readprescriptionaggregate(input: any) {
  try {
    return await Prescription.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}

// nutrition
export async function readnutritionaggregate(input: any) {
  try {
    return await Nutrition.aggregate(input).allowDiskUse(true);
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}