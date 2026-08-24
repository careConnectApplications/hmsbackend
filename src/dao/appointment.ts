import Appointment from "../models/appointment";
import {appointinterface} from '../models/appointment'
import {encrypt} from "../utils/otherservices";
import configuration from "../config";

export async function countappointment(query:any) {
  try {
    
    return await Appointment.countDocuments(query);
   
  } catch (err) {
    console.log(err);
    throw new Error(configuration.error.erroruserread);
  }
};
export async function modifiedreadallappointment(query:any, aggregatequery:any){

try{
 var appointmentdetails = await Appointment.aggregate(aggregatequery).allowDiskUse(true);
const totalappointmentdetails = await Appointment.find(query).countDocuments();
return { appointmentdetails, totalappointmentdetails };

}
catch(err:any){
  console.log(err);
      throw new Error(configuration.error.erroruserread);

}


}
/*
export async function optimizedreadallappointment(aggregatequery:any,page:any,size:any){

  try{
    const skip = (page - 1) * size;
   var appointmentdetails = await Appointment.aggregate(aggregatequery).skip(skip).limit(size).sort({ createdAt: -1 });;
  const totalappointmentdetails = (await Appointment.aggregate(aggregatequery)).length;
  const totalPages = Math.ceil(totalappointmentdetails / size);
  return { appointmentdetails, totalPages,totalappointmentdetails, size, page};
  
  }
  catch(err:any){
    console.log(err);
        throw new Error(configuration.error.erroruserread);
  
  }
  
  
  }
*/
/*
export async function optimizedreadallappointment(aggregatequery:any, page:any, size:any) {
  try {
    const [result] = await Appointment.aggregate(aggregatequery);
    const appointmentdetails = result.paginatedResults;
    const totalappointmentdetails = result.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalappointmentdetails / size);
    return { appointmentdetails, totalPages, totalappointmentdetails, size, page };
  } catch (err) {
    console.log(err);
    throw new Error(configuration.error.erroruserread);
  }
}
  */
 export async function optimizedreadallappointment(aggregatequery: any, page: number, size: number) {
  try {
    // Allow MongoDB to use disk for large sorts/lookups
    const [result] = await Appointment.aggregate(aggregatequery).allowDiskUse(true);

    const appointmentdetails = result?.paginatedResults || [];
    const totalappointmentdetails = result?.totalCount?.[0]?.count || 0;
    const totalPages = Math.ceil(totalappointmentdetails / size);

    return {
      appointmentdetails,
      totalPages,
      totalappointmentdetails,
      size,
      page,
    };
  } catch (err: any) {
    console.error(err);
    throw new Error(configuration.error.erroruserread);
  }
}



export async function readallappointmentfirstfive(query:any,selectquery:any,populatequery:any,populatesecondquery:any,populatethirdquery:any) {
  try {
    return await Appointment.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).populate(populatethirdquery).sort({createdAt: -1}).limit(5);
    
   
  } catch (err) {
    console.log(err);
    throw new Error(configuration.error.erroruserread);
  }
};
export async function readallappointmentpaginated(input:any,page:any,size:any) {
    try{
    const skip = (page - 1) * size;
    const appointmentdetails=await Appointment.aggregate(input).allowDiskUse(true).skip(skip).limit(size).sort({ createdAt: -1 });
     const totalappointentdetails = (await Appointment.aggregate(input).allowDiskUse(true)).length;
          const totalPages = Math.ceil(totalappointentdetails / size);
          return { appointmentdetails, totalPages,totalappointentdetails, size, page};  
  }
    catch(e:any){
      console.log(e);
      throw new Error(configuration.error.erroruserupdate);
    }
    }



  //read all patient history
  export async function readallappointment(query:any,selectquery:any,populatequery:any,populatesecondquery:any,populatethirdquery:any,populatefourthquery:any,populatefifthquery:any,populatesixthquery:any,populateseventhquery:any,populateeigthquery:any,populateninththquery:any) {
    try {
      const appointmentdetails = await Appointment.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).populate(populatethirdquery).populate(populatefourthquery).populate(populatefifthquery).populate
      (populatesixthquery).populate(populateseventhquery).populate(populateeigthquery).populate(populateninththquery).sort({ createdAt: -1 });
      const totalappointmentdetails = await Appointment.find(query).countDocuments();
      return { appointmentdetails, totalappointmentdetails };
    } catch (err) {
      console.log(err);
      throw new Error(configuration.error.erroruserread);
    }
  };
  export async function createappointment(input:any){
    try{
   
       const appointment = new Appointment(input);
        return await appointment.save();
    }
    catch(err){
      console.log(err);
      throw new Error(configuration.error.errorusercreate);

    }
  }
  //find one
  export async function readoneappointment(query:any,selectquery:any,populatequery:any){
    try{
    return await Appointment.findOne(query).select(selectquery).populate(populatequery);
    }
    catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserread);

    }
  }
  
 
  
  //update  appointment by id
  export async function updateappointment(id:any, reqbody:any){
    try{
    const appointment = await Appointment.findOneAndUpdate({ _id: id }, reqbody,{
      upsert: true,new: true
    });
    
    
      if (!appointment) {
        //return json  false response
        throw new Error(configuration.error.errorinvalidcredentials);
      }
        
      return appointment;
    }catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserupdate);

    }

  }
  //update  appointment by query
  export async function updateappointmentbyquery(query:any, reqbody:any){
    try{
    const appointment = await Appointment.findOneAndUpdate(query, reqbody,{
      upsert: true,
      new: true
    });
      if (!appointment) {
        //return json  false response
        throw new Error(configuration.error.errorinvalidcredentials);
      }
      return appointment;
    }catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserupdate);

    }

  }
  