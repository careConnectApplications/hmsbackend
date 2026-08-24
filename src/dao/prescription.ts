import Prescription from "../models/prescription";
import {labinterface} from '../models/lab'
import configuration from "../config";

  //read all lab history
  export async function readallprescription(query:any,selectquery:any,populatequery:any,populatesecondquery:any,populatethirdquery:any) {
    try {
      const prescriptiondetails = await Prescription.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).populate(populatethirdquery).sort({ createdAt: -1 });
      const totalprescriptiondetails = await Prescription.find(query).countDocuments();
      return { prescriptiondetails, totalprescriptiondetails };
    } catch (err) {
      console.log(err);
      throw new Error(configuration.error.erroruserread);
    }
  };

  
  export async function createprescription(input:any){
    try{
       const prescription = new Prescription(input);
        return await prescription.save();
    }
    catch(err){
      console.log(err);
      throw new Error(configuration.error.errorusercreate);

    }
  }
  //find one
  export async function readoneprescription(query:any,selectquery:any,populatequery:any,populatesecondquery:any,populatethirdquery:any){
    try{
    return await Prescription.findOne(query).select(selectquery).populate(populatequery).populate(populatesecondquery).populate(populatethirdquery);
    }
    catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserread);

    }
  }
  
 
  
  //update  lab by id
  export async function updateprescription(id:any, reqbody:any){
    try{
    const lab = await Prescription.findOneAndUpdate({ _id: id }, reqbody,{
      new: true
    });
      if (!lab) {
        //return json  false response
        throw new Error(configuration.error.errorinvalidcredentials);
      }
      return lab;
    }catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserupdate);

    }

  }
  //update  appointment by query
  export async function updateprescriptionbyquery(query:any, reqbody:any){
    try{
    const lab = await Prescription.findOneAndUpdate(query, reqbody,{
      new: true
    });
      if (!lab) {
        //return json  false response
        throw new Error(configuration.error.errorinvalidcredentials);
      }
      return lab;
    }catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserupdate);

    }

  }
  
  export async function optimizedreadprescriptionaggregate(input:any,page:any,size:any ) {
    try{
    const skip = (page - 1) * size;
    const pharmacydetails = await Prescription.aggregate(input).allowDiskUse(true).skip(skip).limit(size).sort({ createdAt: -1 });
    const totalpharmacydetails = (await Prescription.aggregate(input).allowDiskUse(true)).length;
      const totalPages = Math.ceil(totalpharmacydetails / size);
      return { pharmacydetails, totalPages,totalpharmacydetails, size, page};
    }
    catch(e:any){
      console.log(e);
      throw new Error(configuration.error.erroruserupdate);
    }
    }

  export async function readprescriptionaggregate(input:any) {
    try{
    return await Prescription.aggregate(input).allowDiskUse(true);
    }
    catch(e:any){
      console.log(e);
      throw new Error(configuration.error.erroruserupdate);
    }
    }