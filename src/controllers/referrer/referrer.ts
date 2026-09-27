import {readallreferrer,createreferrer,updatereferrer,readonereferrer} from "../../dao/referrer";
import {readonepatient} from "../../dao/patientmanagement";
import {validateinputfaulsyvalue} from "../../utils/otherservices";
import {readoneprice} from "../../dao/price";
import {createpayment} from "../../dao/payment";
import {createappointment} from "../../dao/appointment";
import  {updatepatient}  from "../../dao/patientmanagement";
import  mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import  {readone}  from "../../dao/users";
import configuration from "../../config";


  //get lab order by patient
  export const readAllreferrerByPatient = async (req:any, res:any) => {
    try {
      //const {clinic} = (req.user).user;
      const {patient} = req.params;
      const queryresult = await readallreferrer({patient},{},'patient','payment');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };

  //get referrers by clinic
  export const readAllreferrerByClinic = async (req:any, res:any) => {
    try {
      const {clinic} = req.params;
      const queryresult = await readallreferrer({receivingclinic:clinic},{},'patient','payment');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };

 
export const createreferrers = async (req:any, res:any) => {
    try {
      const {id} = req.params;
      const { firstName,lastName} = (req.user).user;
      req.body.referredby = `${firstName} ${lastName}`;
      var {  diagnosis,referredclinic,referraldate,receivingclinic,preferredconsultant,priority,reasonforreferral,presentingcomplaints,presentingcomplaintsnotes,additionalnotes,salienthistory,findingsonexamination,investigationdoneifany,laboratoryfindings,requiredinputintervention,referredby} = req.body;
      validateinputfaulsyvalue({diagnosis,referredclinic,referraldate,receivingclinic,preferredconsultant,priority,reasonforreferral,presentingcomplaints,presentingcomplaintsnotes,additionalnotes,salienthistory,findingsonexamination,laboratoryfindings,requiredinputintervention,referredby});
       //frequency must inlcude
       //route must contain allowed options
      
      const patientrecord:any =  await readonepatient({_id:id},{},'','');    
      //console.log(admissionrecord);   
      if(!patientrecord){
           throw new Error(`Patient donot ${configuration.error.erroralreadyexit}`);
  
       }
       preferredconsultant = new ObjectId(preferredconsultant);
    const queryresult=await createreferrer({patient:patientrecord._id,diagnosis,referredclinic,referraldate,receivingclinic,preferredconsultant,priority,reasonforreferral,presentingcomplaints,presentingcomplaintsnotes,additionalnotes,salienthistory,findingsonexamination,investigationdoneifany,laboratoryfindings,requiredinputintervention,referredby});
    res.status(200).json({queryresult, status: true});
    }
    catch(e:any){
        res.status(403).json({status: false, msg:e.message});

    }
}


//insulin

export async function updatereferrers(req:any, res:any){
    try{
    //get id
    const {id} = req.params;
    const { firstName,lastName} = (req.user).user;
    req.body.referredby = `${firstName} ${lastName}`;
    var { diagnosis,referredclinic,referraldate,preferredconsultant,priority,reasonforreferral,presentingcomplaints,presentingcomplaintsnotes,additionalnotes,salienthistory,findingsonexamination,investigationdoneifany,laboratoryfindings,requiredinputintervention,referredby} = req.body;
    validateinputfaulsyvalue({diagnosis,referredclinic,referraldate,preferredconsultant,priority,reasonforreferral,presentingcomplaints,presentingcomplaintsnotes,additionalnotes,salienthistory,findingsonexamination,laboratoryfindings,requiredinputintervention,referredby});
    preferredconsultant = new ObjectId(preferredconsultant);
    var queryresult = await updatereferrer(id, {diagnosis,referredclinic,referraldate,preferredconsultant,priority,reasonforreferral,presentingcomplaints,presentingcomplaintsnotes,additionalnotes,salienthistory,findingsonexamination,investigationdoneifany,laboratoryfindings,requiredinputintervention,referredby});
    res.status(200).json({
        queryresult,
        status:true
      }); 
    }catch(e:any){
      console.log(e);
      res.status(403).json({status: false, msg:e.message});

    }

  }

  //accept referrer  
export async function acceptreferrers(req:any, res:any){
    try{
    //get id
    const {id} = req.params;

    var searchrecord:any = await readonereferrer({_id:id},{},'preferredconsultant');
    if(searchrecord.status !== configuration.status[9] )
{
    //errorservicetray
    throw new Error(configuration.error.errorservicetray);
}    

    var { status} = req.body;
    var queryresult;
    if(status == true){
        await updatereferrer(id, {status:configuration.status[12]});

    }
    else{
        await updatereferrer(id, {status: configuration.status[13]});

    }
    
    res.status(200).json({
        queryresult,
        status:true
      }); 
    }catch(e:any){
      console.log(e);
      res.status(403).json({status: false, msg:e.message});

    }

  }

      
  // schedule appoitment for referrer
// Create a new schedule
export const scheduleappointment = async (req:any, res:any) => {
    try {
        const {id} = req.params;
        var searchrecord:any = await readonereferrer({_id:id},{},'preferredconsultant');
    if(searchrecord.status !== configuration.status[12] )
{
    //errorservicetray
    throw new Error(configuration.error.errorservicetray);
}  
      
      //req.body.appointmentdate=new Date(req.body.appointmentdate);
      var appointmentid:any=String(Date.now());
      const {patient,receivingclinic} =searchrecord;
      //const {id} = req.params;
      var { reason, appointmentdate, appointmentcategory, appointmenttype } = req.body;
      validateinputfaulsyvalue({ reason, appointmentdate, appointmentcategory, appointmenttype,patient});
      //search for price if available
       var patients = await readonepatient({_id:patient,status:configuration.status[1]},{},'','');
            
            if(!patients){
              throw new Error(`Patient donot ${configuration.error.erroralreadyexit} or has not made payment for registration`);
      
            }
      var appointmentPrice = await readoneprice({servicecategory:appointmentcategory,servicetype:appointmenttype});
      
      if(!appointmentPrice){
        throw new Error(configuration.error.errornopriceset);
  
    }
  
  const createpaymentqueryresult =await createpayment({firstName:patients?.firstName,lastName:patients?.lastName,MRN:patients?.MRN,phoneNumber:patients?.phoneNumber,paymentreference:appointmentid,paymentype:appointmenttype,paymentcategory:appointmentcategory,patient,amount:Number(appointmentPrice.amount)})
  
  const queryresult = await createappointment({appointmentid,payment:createpaymentqueryresult._id ,patient,clinic:receivingclinic,reason, appointmentdate, appointmentcategory, appointmenttype,encounter:{vitals: {status:configuration.status[8]}}});
  console.log(queryresult);    
  //update patient
  await updatepatient(patient,{$push: {payment:createpaymentqueryresult._id,appointment:queryresult._id}});
      res.status(200).json({queryresult, status: true});
      
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };