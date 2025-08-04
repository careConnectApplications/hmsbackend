import User from "../models/users";
import {usersinterface} from '../models/users'
import {encrypt} from "../utils/otherservices";
import configuration from "../config";
import { AnyArray } from "mongoose";


export async function countuser(query:any) {
  try {
    return await User.countDocuments(query);
  } catch (err) {
    console.log(err);
    throw new Error(configuration.error.erroruserread);
  }
};

  //read all payment history
  export async function readall(query:any) {
    try {
      const userdetails = await User.find(query).select({"_id":1,"title":1,"staffId":1, "firstName":1, "middleName":1, "lastName":1,"country":1,"state":1,"city":1, "address":1,"age":1,"dateOfBirth":1,"gender":1,"licence":1,"phoneNumber":1,"email":1,"role": 1,"degree":1,"profession": 1,"employmentStatus":1,"nativeSpokenLanguage": 1,"otherLanguage": 1,"readWriteLanguage": 1,"zip": 1,"specializationDetails": 1, "status":1,"clinic":1,"createdAt":1}).sort({ createdAt: -1 });
      const totaluserdetails = await User.countDocuments();
      return { userdetails, totaluserdetails };
    } catch (err) {
      console.log(err);
      throw new Error(configuration.error.erroruserread);
    }
  };
  export async function createuser(input:usersinterface){
    try{
       const user = new User(input);
        return await user.save();
    }
    catch(err){
      console.log(err);
      throw new Error(configuration.error.errorusercreate);

    }
  }
  //find one
  export async function readone(query:any){
    try{
    return await User.findOne(query);
    }
    catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserread);

    }
  }
  
 
  
  //update mobile users
  export async function updateuser(id:any, reqbody:any){
    try{
      if (reqbody.password) {
        const passwordHash = await encrypt(reqbody.password);
        //re-assign hasshed version of original
        reqbody.password = passwordHash;
      }
    const user = await User.findOneAndUpdate({ _id: id }, reqbody,{
      new: true
    });
      if (!user) {
        //return json  false response
        throw new Error(configuration.error.errorinvalidcredentials);
      }
      return user;
    }catch(err){
      console.log(err);
      throw new Error(configuration.error.erroruserupdate);

    }

  }
 
//insert many
export async function createmanyuser(input:any){
  try{
    // this option prevents additional documents from being inserted if one fails
    const options = { ordered: true };
    return await User.insertMany(input,options);
  }
  catch(err:any){
    var message:any;
    if (err.name === "ValidationError") {       
      message = Object.values(err.errors).map((value:any) => value.message);
  }
  else{
    message=configuration.error.errorusercreate;
  }
  throw new Error(message[0]);

  }
}

  
  

