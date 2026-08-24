import Referrer from "../models/referrer";
import configuration from "../config";

  //read all lab history
  export async function readallreferrer(query:any,selectquery:any,populatequery:any,populatesecondquery:any) {
    try {
      const referrerdetails = await Referrer.find(query).select(selectquery).populate(populatequery).populate(populatesecondquery).sort({ createdAt: -1 });
      const totalreferrerdetails = await Referrer.find(query).countDocuments();
      return { referrerdetails, totalreferrerdetails };
    } catch (err) {
      console.log(err);
      throw new Error(configuration.error.erroruserread);
    }
  };
  export async function createreferrer(input:any){
    try{
       const referrer = new Referrer(input);
        return await referrer.save();
    }
    catch(err){
      console.log(err);
      throw new Error(configuration.error.errorusercreate);

    }
  }
  //find one
  export async function readonereferrer(query:any,selectquery:any,populatequery:any){
    try{
    return await Referrer.findOne(query).select(selectquery).populate(populatequery);
    }
    catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserread);

    }
  }
  
 
  
  //update  lab by id
  export async function updatereferrer(id:any, reqbody:any){
    try{
    const referrer = await Referrer.findOneAndUpdate({ _id: id }, reqbody,{
      new: true
    });
      if (!referrer) {
        //return json  false response
        throw new Error(configuration.error.errorinvalidcredentials);
      }
      return referrer;
    }catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserupdate);

    }

  }
  //update  appointment by query
  export async function updatereferrerbyquery(query:any, reqbody:any){
    try{
    const referrer = await Referrer.findOneAndUpdate(query, reqbody,{
      new: true
    });
      if (!referrer) {
        //return json  false response
        throw new Error(configuration.error.errorinvalidcredentials);
      }
      return referrer;
    }catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserupdate);

    }

  }
  

  export async function readreferreraggregate(input:any) {
    try{
    return await Referrer.aggregate(input).allowDiskUse(true);
    }
    catch(e:any){
      console.log(e);
      throw new Error(configuration.error.erroruserupdate);
    }
    }