import Procedure from "../models/procedure";
import configuration from "../config";

export async function countprocedure(query:any) {
  try {
    
    return await Procedure.countDocuments(query);
   
  } catch (err) {
    console.log(err);
    throw new Error(configuration.error.erroruserread);
  }
};

  //read all lab history
  export async function readallprocedure(query:any,selectquery:any,populatequery:any,populatesecondquery:any) {
    try {
      const proceduredetails = await Procedure.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).sort({ createdAt: -1 });
      const totalproceduredetails = await Procedure.find(query).countDocuments();
      return { proceduredetails, totalproceduredetails };
    } catch (err) {
      console.log(err);
      throw new Error(configuration.error.erroruserread);
    }
  };
  export async function createprocedure(input:any){
    try{
       const procedure = new Procedure(input);
        return await procedure.save();
    }
    catch(err){
      console.log(err);
      throw new Error(configuration.error.errorusercreate);

    }
  }
  //find one
  export async function readoneprocedure(query:any,selectquery:any,populatequery:any){
    try{
    return await Procedure.findOne(query).select(selectquery).populate(populatequery);
    }
    catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserread);

    }
  }
  
 
  
  //update  lab by id
  export async function updateprocedure(id:any, reqbody:any){
    try{
    const procedure = await Procedure.findOneAndUpdate({ _id: id }, reqbody,{
      new: true
    });
      if (!procedure) {
        //return json  false response
        throw new Error(configuration.error.errorinvalidcredentials);
      }
      return procedure;
    }catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserupdate);

    }

  }
  //update  appointment by query
  export async function updateprocedurebyquery(query:any, reqbody:any){
    try{
    const procedure = await Procedure.findOneAndUpdate(query, reqbody,{
      new: true
    });
      if (!procedure) {
        //return json  false response
        throw new Error(configuration.error.errorinvalidcredentials);
      }
      return procedure;
    }catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserupdate);

    }

  }
  

  export async function readprocedureaggregate(input:any) {
    try{
    return await Procedure.aggregate(input).allowDiskUse(true);
    }
    catch(e:any){
      console.log(e);
      throw new Error(configuration.error.erroruserupdate);
    }
    }