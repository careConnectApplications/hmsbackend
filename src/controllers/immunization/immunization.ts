import {readallimmunization,createimmunization,updateimmunization} from "../../dao/immunization";
import {readonepatient} from "../../dao/patientmanagement";
import {validateinputfaulsyvalue} from "../../utils/otherservices";
import  mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import  {readone}  from "../../dao/users";
import configuration from "../../config";

/*
export const readallimmunizationByAdmission = async (req:any, res:any) => {
    try {
     const {admission} = req.params;
      const queryresult = await readallimmunization({admission},{},'patient');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };
  */
  //get lab order by patient
  export const readAllimmunizationByPatient = async (req:any, res:any) => {
    try {
      //const {clinic} = (req.user).user;
      const {patient} = req.params;
      //const queryresult = await readalllab({patient:id,department:clinic},{},'patient','appointment','payment');
      const queryresult = await readallimmunization({patient},{},'patient');
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
export const createimmunizations = async (req:any, res:any) => {
    try {
      const {id} = req.params;
      const { firstName,lastName} = (req.user).user;
      req.body.staffname = `${firstName} ${lastName}`;
     
      var {vaccinationlocation,outreachMedications,adverseEffectVaccine,isFullyImmunized,isZeroDoseChild,vaccination,medicationgiventomanageadverseeffect,adverseeffectseverity,anynotedadverseeffect,schedule,vaccinecode,vaccinename,vaccinetype,manufacturer,batchno,expirydate,dose,doseamount,administrationsite,administrationroute,consent,immunizationstatus,comment,onsetdateofreaction,reactcode,reporter,reportingsource,staffname} = req.body;
      //validateinputfaulsyvalue({vaccinationlocation,outreachMedications,vaccination,schedule,expirydate,dose,doseamount,administrationsite,administrationroute,consent,immunizationstatus,comment,onsetdateofreaction,reactcode,reporter,reportingsource,staffname});
       //frequency must inlcude
       //route must contain allowed options
      
      const patientrecord:any =  await readonepatient({_id:id},{},'','');    
      //console.log(admissionrecord);   
      if(!patientrecord){
           throw new Error(`Patient donot ${configuration.error.erroralreadyexit}`);
  
       }
    const queryresult=await createimmunization({patient:patientrecord._id,vaccinationlocation,outreachMedications,adverseEffectVaccine,isFullyImmunized,isZeroDoseChild,vaccination,medicationgiventomanageadverseeffect,adverseeffectseverity,anynotedadverseeffect,schedule,vaccinecode,vaccinename,vaccinetype,manufacturer,batchno,expirydate,dose,doseamount,administrationsite,administrationroute,consent,immunizationstatus,comment,onsetdateofreaction,reactcode,reporter,reportingsource,staffname});
    res.status(200).json({queryresult, status: true});
    }
    catch(e:any){
        res.status(403).json({status: false, msg:e.message});

    }
}


//insulin

export async function updateimmunizations(req:any, res:any){
    try{
    //get id
    const {id} = req.params;
    const { firstName,lastName} = (req.user).user;
    req.body.staffname = `${firstName} ${lastName}`;
    var { vaccinationlocation,outreachMedications,adverseEffectVaccine,isFullyImmunized,isZeroDoseChild,vaccination,medicationgiventomanageadverseeffect,adverseeffectseverity,anynotedadverseeffect,schedule,vaccinecode,vaccinename,vaccinetype,manufacturer,batchno,expirydate,dose,doseamount,administrationsite,administrationroute,consent,immunizationstatus,comment,onsetdateofreaction,reactcode,reporter,reportingsource,staffname} = req.body;
    //validateinputfaulsyvalue({vaccinationlocation,outreachMedications,vaccination,schedule,expirydate,dose,doseamount,administrationsite,administrationroute,consent,immunizationstatus,comment,onsetdateofreaction,reactcode,reporter,reportingsource,staffname});
    
    var queryresult = await updateimmunization(id, {vaccinationlocation,outreachMedications,adverseEffectVaccine,isFullyImmunized,isZeroDoseChild,vaccination,medicationgiventomanageadverseeffect,adverseeffectseverity,anynotedadverseeffect,schedule,vaccinecode,vaccinename,vaccinetype,manufacturer,batchno,expirydate,dose,doseamount,administrationsite,administrationroute,consent,immunizationstatus,comment,onsetdateofreaction,reactcode,reporter,reportingsource,staffname});
    res.status(200).json({
        queryresult,
        status:true
      }); 
    }catch(e:any){
      console.log(e);
      res.status(403).json({status: false, msg:e.message});

    }

  }

  
      
  