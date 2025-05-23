import {readallnursingcareplan,createnursingcareplan,updatenursingcareplan} from "../../dao/nursingcareplan";
import {readoneadmission} from "../../dao/admissions";
import {validateinputfaulsyvalue} from "../../utils/otherservices";
import  mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import  {readone}  from "../../dao/users";
import configuration from "../../config";



// Get all lab records
export const readallnursingcareByAdmission = async (req:any, res:any) => {
    try {
     const {admission} = req.params;
      const queryresult = await readallnursingcareplan({admission},{},'patient','admission');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };


  //get lab order by patient
  export const readAllnursingcareplanByPatient = async (req:any, res:any) => {
    try {
      //const {clinic} = (req.user).user;
      const {patient} = req.params;
      //const queryresult = await readalllab({patient:id,department:clinic},{},'patient','appointment','payment');
      const queryresult = await readallnursingcareplan({patient},{},'patient','admission');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };

  //create vital charts
  // Create a new schedule
export const createnursingcareplans = async (req:any, res:any) => {
    try {
      const {id} = req.params;
      const { firstName,lastName} = (req.user).user;
      req.body.staffname = `${firstName} ${lastName}`;
      
      var { nursingdiagnosis,objectives,actionintervention,evaluation,staffname} = req.body;
      validateinputfaulsyvalue({nursingdiagnosis,objectives,actionintervention,evaluation,staffname});
      const admissionrecord:any =  await readoneadmission({_id:id},{},'');    
      //console.log(admissionrecord);   
      if(!admissionrecord){
           throw new Error(`Admission donot ${configuration.error.erroralreadyexit}`);
  
       }
    const queryresult=await createnursingcareplan({referedward:admissionrecord.referedward,admission:admissionrecord._id,patient:admissionrecord.patient,nursingdiagnosis,objectives,actionintervention,evaluation,staffname});
    res.status(200).json({queryresult, status: true});
    }
    catch(e:any){
        res.status(403).json({status: false, msg:e.message});

    }
}


//insulin

export async function updatenursingcareplans(req:any, res:any){
    try{
    //get id
    const {id} = req.params;
    const { firstName,lastName} = (req.user).user;
    req.body.staffname = `${firstName} ${lastName}`;
    var { nursingdiagnosis,objectives,actionintervention,evaluation,staffname} = req.body;
    validateinputfaulsyvalue({nursingdiagnosis,objectives,actionintervention,evaluation,staffname});
    
    var queryresult = await updatenursingcareplan(id, {nursingdiagnosis,objectives,actionintervention,evaluation,staffname});
    res.status(200).json({
        queryresult,
        status:true
      }); 
    }catch(e:any){
      console.log(e);
      res.status(403).json({status: false, msg:e.message});

    }

  }

  
      
  