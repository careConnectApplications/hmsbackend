import {readallmedicationcharts, createmedicationcharts,updatemedicationcharts} from "../../dao/medicationcharts";
import { updateprescription, readoneprescription } from "../../dao/prescription";
import {readoneadmission} from "../../dao/admissions";
import  {readonepatient}  from "../../dao/patientmanagement";
import {validateinputfaulsyvalue} from "../../utils/otherservices";
import  mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import  {readone}  from "../../dao/users";
import configuration from "../../config";

// Get all lab records
export const readallmedicationchartByAdmission = async (req:any, res:any) => {
    try {
     const {admission} = req.params;
      const queryresult = await readallmedicationcharts({admission},{},'prescription','');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };
  //get lab order by patient
  export const readAllmedicationByPatient = async (req:any, res:any) => {
    try {
      //const {clinic} = (req.user).user;
      const {patient} = req.params;
      //const queryresult = await readalllab({patient:id,department:clinic},{},'patient','appointment','payment');
      const queryresult = await readallmedicationcharts({patient},{},'patient','admission');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };
export const createmedicationchartfornursingcare = async (req:any, res:any) => {
    try {
        
       // admission,patient,height,weight,temperature,heartrate,bloodpressuresystolic,bloodpressurediastolic,respiration,saturation,bmi,painscore,rbs,gcs,wardname,staffname,
      
     
      const {id} = req.params;
      const { firstName,lastName} = (req.user).user;
      const staffname = `${firstName} ${lastName}`;
      
      // Get prescription ID from req.body
      const { prescription } = req.body;
      
      if(!prescription){
        throw new Error("Prescription ID is required");
      }
      
      // Read prescription record to extract medication details
      const prescriptionRecord:any = await readoneprescription({_id:prescription},{},'','','');
      
      if(!prescriptionRecord){
        throw new Error("Prescription not found");
      }
      
      // Extract medication fields from prescription
      const drug = prescriptionRecord.prescription || "";
      const note = prescriptionRecord.prescriptionnote || prescriptionRecord.doctorsnote?.join("; ") || "";
      const dose = prescriptionRecord.dosage || "";
      const frequency = prescriptionRecord.frequency || "";
      const route = prescriptionRecord.route || "";
      
      // Validate extracted fields
       //frequency must inlcude
       //route must contain allowed options
        const foundPatient:any =  await readonepatient({_id:id},{},'','');
       var admissionrecord:any;
       if(foundPatient){
         admissionrecord={
           patient:id,
           referedward:new ObjectId(),
           _id:new ObjectId(),
           
         }
       }
       else{
        admissionrecord=  await readoneadmission({_id:id},{},'');       
          if(!admissionrecord){
           throw new Error(`Admission donot ${configuration.error.erroralreadyexit}`);
  
          }

       }
      
    const queryresult=await createmedicationcharts({referedward:admissionrecord.referedward,prescription,admission:admissionrecord._id,patient:admissionrecord.patient,drug,note,dose,frequency,route,staffname});
     //find prescription and change status
     await updateprescription(prescription,{servedstatus:configuration.servedstatus[0]});
     //configuration.servedstatus[]

    res.status(200).json({queryresult, status: true});
    }
    catch(e:any){
        res.status(403).json({status: false, msg:e.message});

    }
}

  //create vital charts
  // Create a new schedule
export const createmedicationchart = async (req:any, res:any) => {
    try {
        
       // admission,patient,height,weight,temperature,heartrate,bloodpressuresystolic,bloodpressurediastolic,respiration,saturation,bmi,painscore,rbs,gcs,wardname,staffname,
      
     
      const {id} = req.params;
      const { firstName,lastName} = (req.user).user;
      req.body.staffname = `${firstName} ${lastName}`;
      var { drug,note,dose,frequency,route,staffname,prescription} = req.body;
      validateinputfaulsyvalue({drug,note,dose,frequency,route,staffname});
       //frequency must inlcude
       //route must contain allowed options
        const foundPatient:any =  await readonepatient({_id:id},{},'','');
       var admissionrecord:any;
       if(foundPatient){
         admissionrecord={
           patient:id,
           referedward:new ObjectId(),
           _id:new ObjectId(),
           
         }
       }
       else{
        admissionrecord=  await readoneadmission({_id:id},{},'');       
          if(!admissionrecord){
           throw new Error(`Admission donot ${configuration.error.erroralreadyexit}`);
  
          }

       }
      
    const queryresult=await createmedicationcharts({referedward:admissionrecord.referedward,prescription,admission:admissionrecord._id,patient:admissionrecord.patient,drug,note,dose,frequency,route,staffname});
     //find prescription and change status
     await updateprescription(prescription,{servedstatus:configuration.servedstatus[0]});
     //configuration.servedstatus[]

    res.status(200).json({queryresult, status: true});
    }
    catch(e:any){
        res.status(403).json({status: false, msg:e.message});

    }
}


//update medical charts

export async function updatemedicalchart(req:any, res:any){
    try{
    //get id
    const {id} = req.params;
    const { firstName,lastName} = (req.user).user;
    req.body.staffname = `${firstName} ${lastName}`;
    var { drug,note,dose,frequency,route,staffname} = req.body;
    validateinputfaulsyvalue({drug,note,dose,frequency,route,staffname});
    
    var queryresult = await updatemedicationcharts(id, {drug,note,dose,frequency,route,staffname});
    res.status(200).json({
        queryresult,
        status:true
      }); 
    }catch(e:any){
      console.log(e);
      res.status(403).json({status: false, msg:e.message});

    }

  }
