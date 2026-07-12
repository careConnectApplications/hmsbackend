import  mongoose from 'mongoose';
import { validateinputfaulsyvalue, validatepayment } from "../../utils/otherservices";
import {createthearteadmission,readallthearteadmission,updatethearteadmission,readonethearteadmission} from  "../../dao/theatreadmission";
import  {updatepatient,readonepatient}  from "../../dao/patientmanagement";
import {readonetheatremanagement,updatetheatremanagement} from "../../dao/theatre";
import {readoneclinic} from "../../dao/clinics";
import configuration from "../../config";
import {readoneprice} from "../../dao/price";
import {createpayment, readonepayment} from "../../dao/payment";
import {createprocedure} from "../../dao/procedure";
import  {readallservicetype}  from "../../dao/servicetype";
import {readoneadmission} from  "../../dao/admissions";

const { ObjectId } = mongoose.Types;

//refer for admission
export var refertheatreadmission= async (req:any, res:any) =>{
    try{
            
      const { firstName,lastName} = (req.user).user;
      const raiseby = `${firstName} ${lastName}`;
      const {id} = req.params;
      console.log('id', id);
      
      //doctorname,patient,appointment
      const {procedures,referedtheatre,clinic,appointmentdate,cptcodes,dxcodes,indicationdiagnosisprocedure} = req.body;
      validateinputfaulsyvalue({id,procedures,referedtheatre,clinic,appointmentdate});
      //confirm ward
      const referedtheatreid = new ObjectId(referedtheatre);
      const foundTheatre =  await readonetheatremanagement({_id:referedtheatreid},'');
      if(!foundTheatre){
          throw new Error(`Theatre doesnt ${configuration.error.erroralreadyexit}`);

      }
      //confrim admittospecialization
      //validate specialization
          const foundSpecilization =  await readoneclinic({clinic},'');
          if(!foundSpecilization){
              throw new Error(`Specialization doesnt ${configuration.error.erroralreadyexit}`);
      
          }

     //find the record in patient and validate
    
    var patient = await readonepatient({_id:id,status:configuration.status[1]},{},'','');
      
      if(!patient){
        throw new Error(`Patient donot ${configuration.error.erroralreadyexit} or has not made payment for registration`);

      }
  
      const findAdmissionForPayment = await validatepayment(patient._id,"Admission");
  
  //check that patient have not been admitted
  var  findAdmission = await readonethearteadmission({patient:patient._id, status:{$ne: configuration.admissionstatus[5]}},{},'');
  if(findAdmission){
    throw new Error(`Patient Admission to Theatre ${configuration.error.erroralreadyexit}`);

}
// validate and create  procedure 
var procedureid:any=String(Date.now());
var proceduresid =[];
var paymentids =[];
const {servicetypedetails} = await readallservicetype({category: configuration.category[5]},{type:1,category:1,department:1,_id:0});
//loop through all test and create record in lab order
for(var i =0; i < procedures.length; i++){
  //search for price of test name
      var testPrice:any = await readoneprice({servicetype:procedures[i]});
      if(!testPrice){
        throw new Error(`${configuration.error.errornopriceset}  ${procedures[i]}`);
    }
    
    //search testname in setting
    console.log(servicetypedetails);
    
    var testsetting = servicetypedetails.filter(item => (item.type).includes(procedures[i]));
    
    if(!testsetting || testsetting.length < 1){
      throw new Error(`${procedures[i]} donot ${configuration.error.erroralreadyexit} in ${configuration.category[4]} as a service type  `);
  }
       //create payment
    var createpaymentqueryresult =await createpayment({firstName:patient?.firstName,lastName:patient?.lastName,MRN:patient?.MRN,phoneNumber:patient?.phoneNumber,paymentreference:id,paymentype:procedures[i],paymentcategory:testsetting[0].category,patient:id,amount:Number(testPrice.amount)})
   
    //create testrecordn 
    var procedurerecord = await createprocedure({procedure:procedures[i],patient:id,payment:createpaymentqueryresult._id,procedureid,clinic,indicationdiagnosisprocedure,appointmentdate,cptcodes,dxcodes,raiseby});
    proceduresid.push(procedurerecord._id);
    paymentids.push(createpaymentqueryresult._id);
    }
//create theatre admission
var theatreadmissionid:any = String(Date.now());
var theatreadmissionrecord:any = await createthearteadmission({procedures:proceduresid,referedtheatre:foundTheatre._id,clinic,doctorname:firstName + " " + lastName,appointmentdate,patient:patient._id,theatreadmissionid});
//update patient 
var queryresult=await updatepatient(patient._id,{$push: {prcedure:proceduresid,payment:paymentids}});
res.status(200).json({queryresult:theatreadmissionrecord, status: true});
    }
    
    catch(error:any){
      res.status(403).json({ status: false, msg: error.message });
  
    }
  
  }
// get all admission patient
export async function getallreferedfortheatreadmission(req:any, res:any){
    try{
       const {theatre} = req.params;
       const referedtheatre = new ObjectId(theatre);
        const queryresult = await readallthearteadmission({referedtheatre},{},'referedtheatre','patient','conscent');
        res.status(200).json({
            queryresult,
            status:true
          }); 

    }
    catch(e:any){
        res.status(403).json({status: false, msg:e.message});

    }

}
//get all admitted patient
// get all admission patient
export async function getalltheatreadmissionbypatient(req:any, res:any){
  try{
    
     const {patient} = req.params;
      const queryresult = await readallthearteadmission({patient},{},'referedtheatre','patient','conscent');
      res.status(200).json({
          queryresult,
          status:true
        }); 

  }
  catch(e:any){
      res.status(403).json({status: false, msg:e.message});

  }

}
//admited,to transfer,transfer,to discharge, discharge
export async function updatetheatreadmissionstatus(req:any, res:any){
  const {id} = req.params;
  var {status, transfterto} = req.body;
   transfterto = new ObjectId(transfterto);
  try{
    //validate that status is included in te status choice
    if(!(configuration.admissionstatus).includes(status))
      throw new Error(`${status} status doesnt ${configuration.error.erroralreadyexit}`);

    //if status = discharge
    
      const response = await readonethearteadmission({_id:id},{},'');
      // check for availability of bed spaces in ward only for admitted
      if(!response){
          throw new Error(`Theatre Admission donot ${configuration.error.erroralreadyexit}`);
      }
      var theatre:any = await readonetheatremanagement({_id:response?.referedtheatre},{});
      if(!theatre){
        // return error
        throw new Error(`Theatre donot ${configuration.error.erroralreadyexit}`);
      }
     
      var transftertotheatre:any= await readonetheatremanagement({_id:transfterto},{});
      if(transfterto && status == configuration.admissionstatus[2] &&  !transftertotheatre){
          // return error
          throw new Error(`Theatre to be transfered donot  ${configuration.error.erroralreadyexit}`);
      }
      if(transfterto && status == configuration.admissionstatus[2] && transftertotheatre.vacantbed < 1){
        throw new Error(`${transftertotheatre.theatrename}  ${configuration.error.errorvacantspace}`);
        

      }
      if((status == configuration.admissionstatus[1] || status == configuration.admissionstatus[3]) && theatre.vacantbed < 1){
        throw new Error(`${theatre.theatrename}  ${configuration.error.errorvacantspace}`);

      }
      
      //validate if permitted base on status
     //const status= response?.status == configuration.status[0]? configuration.status[1]: configuration.status[0];
      const queryresult:any =await updatethearteadmission(id,{status});
      console.log(status);
      //if status is equal to admit reduce  ward count
      if(status == configuration.admissionstatus[1] || status == configuration.admissionstatus[3]){        
        await updatetheatremanagement(queryresult.referedtheatre,{$inc:{occupiedbed:1,vacantbed:-1}});
      }
      // status is equal to  totransfer reduce target ward and increase source ward
      else if(status == configuration.admissionstatus[2]){
        await updatethearteadmission(id,{status,referedtheatre:transfterto,previoustheatre:queryresult.referedtheatre});
      }
      else if(status == configuration.admissionstatus[5]){
        await updatetheatremanagement(queryresult.referedtheatre,{$inc:{occupiedbed:-1,vacantbed:1}});

      }
      // status is equal to  transfer reduce target ward and increase 
      if(status == configuration.admissionstatus[3] ){
        await updatetheatremanagement(queryresult.previoustheatre,{$inc:{occupiedbed:-1,vacantbed:1}});

      }

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


// todays theatre
export async function gettheatreadmissiontoday(req:Request, res:any) {
  // Get today's date
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);  // Set the time to 00:00:00
   // Get the start of tomorrow to set the range for "today"
   const endOfDay = new Date(startOfDay);
   endOfDay.setHours(23, 59, 59, 999);  // Set the time to 23:59:59  

  try {
    const queryresult = await readallthearteadmission({appointmentdate: { $gte: startOfDay, $lte: endOfDay }},{},'referedtheatre','patient','conscent');
    res.status(200).json({
      queryresult,
      status:true
    }); 
  } catch (e:any) {

    console.log(e);
    res.status(403).json({status: false, msg:e.message});
  }
}


