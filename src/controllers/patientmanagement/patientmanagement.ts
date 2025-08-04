import configuration from "../../config";
import { v4 as uuidv4 } from 'uuid';
import moment from "moment";
import * as path from 'path';
import  {readallpatient,createpatient,updatepatient,readonepatient,updatepatientmanybyquery,createpatientifnotexit,readallpatientpaginated}  from "../../dao/patientmanagement";
import {readoneprice} from "../../dao/price";
import {createpayment} from "../../dao/payment";
import {createvitalcharts} from "../../dao/vitalcharts";
import { mail, generateRandomNumber,validateinputfaulsyvalue,uploaddocument,convertexceltojson,storeUniqueNumber } from "../../utils/otherservices";
import {createappointment} from "../../dao/appointment";
import {readonepricemodel} from "../../dao/pricingmodel";
import { AnyObject } from "mongoose";
import {createaudit} from "../../dao/audit";
//Insurance upload
//get hmo patient 
//read all patients
//search patients 
export async function searchpartient(req:any, res:any){
  try{
      //var settings = await configuration.settings();
    var selectquery ={"title":1,"firstName":1,"status":1,"middleName":1,"lastName":1,"country":1, "stateOfResidence": 1,"LGA": 1,"address":1,"age":1,"dateOfBirth":1,"gender":1,"nin":1,"phoneNumber":1,"email":1,"oldMRN":1,"nextOfKinName":1,"nextOfKinRelationship":1,"nextOfKinPhoneNumber":1,"nextOfKinAddress":1,
        "maritalStatus":1, "disability":1,"occupation":1,"isHMOCover":1,"HMOName":1,"HMOId":1,"HMOPlan":1,"MRN":1,"createdAt":1, "passport":1};
    const {searchparams} = req.params;

    const queryresult = await readallpatient({$or:[{ lastName: { $regex:searchparams , $options: 'i' } },{ firstName: { $regex:searchparams , $options: 'i' } },{ HMOId: { $regex:searchparams , $options: 'i' } },{ MRN: { $regex:searchparams , $options: 'i' } },{ phoneNumber: { $regex:searchparams , $options: 'i' } }]},selectquery,'','');
    res.status(200).json({
        queryresult,
        status:true
      }); 


  }
  catch(e:any){

  }
}
export async function getallhmopatients(req:Request, res:any){
  try{
    //var settings = await configuration.settings();
      var selectquery ={"title":1,"firstName":1,"status":1,"middleName":1,"lastName":1,"country":1, "stateOfResidence": 1,"LGA": 1,"address":1,"age":1,"dateOfBirth":1,"gender":1,"nin":1,"phoneNumber":1,"email":1,"oldMRN":1,"nextOfKinName":1,"nextOfKinRelationship":1,"nextOfKinPhoneNumber":1,"nextOfKinAddress":1,
          "maritalStatus":1, "disability":1,"occupation":1,"isHMOCover":1,"HMOName":1,"HMOId":1,"HMOPlan":1,"MRN":1,"createdAt":1, "passport":1};
          //var populatequery="payment";
      const queryresult = await readallpatient({isHMOCover:configuration.ishmo[1]},selectquery,'','');
      res.status(200).json({
          queryresult,
          status:true
        }); 

  }
  catch(e:any){
      res.status(403).json({status: false, msg:e.message});

  }

}


 //bulk upload users
 export async function bulkuploadhmopatients(req:any, res:any){
  try{ 
    const { firstName, lastName } = (req.user).user;
    var actor = `${firstName} ${lastName}`; 
    const file = req.files.file;
    const {HMOName} = req.body;
    const filename= configuration.hmouploadfilename;
    let allowedextension = ['.csv','.xlsx'];
    let uploadpath =`${process.cwd()}/${configuration.useruploaddirectory}`;
    //acieve document
    await updatepatientmanybyquery({HMOName},{status:configuration.status[15]});
    //await createpatientachieve(patientdetails);
    //delete patient management
    //await deletePatietsByCondition({HMOName});
    var columnmapping={
      A: "title",
      B: "firstName",
      C: "middleName",
      D: "lastName",
      E: "country",
      F: "stateOfResidence",
      G: "LGA",
      H: "address",
      I: "age",
      J: "dateOfBirth",
      K: "gender",
      L: "nin",
      M: "phoneNumber",
      N: "email",
      O:"oldMRN",
      P:"nextOfKinName",
      Q:"nextOfKinRelationship",
      R:"nextOfKinPhoneNumber",
      S:"nextOfKinAddress",
      T:"maritalStatus",
      U:"disability",
      V:"occupation",
      W:"HMOPlan",
      X:"HMOId"
      
    
       
    };
  
  await uploaddocument(file,filename,allowedextension,uploadpath);
   //convert uploaded excel to json
   var convert_to_json = convertexceltojson(`${uploadpath}/${filename}${path.extname(file.name)}`, configuration.hmotemplate, columnmapping);

   //save to database
   var {hmo} = convert_to_json;
       if(hmo.length > 0){
        for (var i = 0; i < hmo.length; i++) {    
          hmo[i].isHMOCover=configuration.ishmo[1];
          hmo[i].HMOName=HMOName;
          const {phoneNumber,firstName,lastName,gender,HMOId} = hmo[i];
          validateinputfaulsyvalue({phoneNumber,firstName,lastName,gender,HMOId});
          console.log((phoneNumber.toString()).length);
          if((phoneNumber.toString()).length !== 11 && (phoneNumber.toString()).length !==10){
            throw new Error(`${phoneNumber} ${configuration.error.errorelevendigit}`);
  
          }
          if(hmo[i].dateOfBirth) hmo[i].age= moment().diff(moment(hmo[i].dateOfBirth), 'years');
          //if not dateObirth but age calculate date of birth
          if(!hmo[i].dateOfBirth && hmo[i].age ) hmo[i].dateOfBirth = moment().subtract(Number(hmo[i].age), 'years').format('YYYY-MM-DD');
          /*
          const foundUser:any =  await readonepatient({phoneNumber},{},'','');
          //category
          if(foundUser && phoneNumber !== configuration.defaultphonenumber){
              throw new Error(`Patient ${configuration.error.erroralreadyexit}`);
  
          }
              */
          var uniqunumber =await storeUniqueNumber(4);
           // chaorten the MRN to alphanumeric 
           hmo[i].MRN=uniqunumber;    
           hmo[i].status=configuration.status[1];    
           hmo[i].password=configuration.defaultPassword;
       
         const createpatientqueryresult=await createpatientifnotexit({HMOId:hmo[i].HMOId,HMOName},hmo[i]);
      }
       }
      
      await createaudit({action:"Bulk Uploaded HMO Patient",actor,affectedentity:HMOName});
       res.status(200).json({status: true, queryresult: 'Bulk upload was successfull'});
    }
    catch(e:any){
       //logger.error(e.message);
       res.status(403).json({status: false, msg:e.message});

    }
}
    

//update authorization code

export async function updateauthorizationcode(req:any, res:any){
    try{
    //get id
    const {id} = req.params;
    const {authorizationcode} = req.body;
    var queryresult = await updatepatient(id, {authorizationcode});
    res.status(200).json({
        queryresult,
        status:true
      });
    }catch(e:any){
      console.log(e);
      res.status(403).json({status: false, msg:e.message});

    }

  }


//add patiient
export var createpatients = async (req:any,res:any) =>{
   
    try{
        var appointmentid:any=String(Date.now());
        if(!(req.body.isHMOCover)){
          req.body.isHMOCover=configuration.ishmo[0]

        } 
        
        
           if(!(req.body.isHMOCover==configuration.ishmo[1] || req.body.isHMOCover == true)){
           
           delete req.body.authorizationcode ;
           delete req.body.facilitypateintreferedfrom;
        }
        req.body.appointmentcategory=configuration.category[3];
        req.body.appointmenttype =configuration.category[3];
        var {facilitypateintreferedfrom,authorizationcode,policecase,physicalassault,sexualassault,policaename,servicenumber,policephonenumber,division,dateOfBirth,phoneNumber,firstName,lastName,gender,clinic, reason, appointmentdate, appointmentcategory, appointmenttype,isHMOCover} = req.body;
        //validation
         validateinputfaulsyvalue({phoneNumber,firstName,lastName,gender,clinic,appointmentdate, appointmentcategory, appointmenttype,isHMOCover});
        //define the service type
        /*
        if(isHMOCover==configuration.ishmo[1] || isHMOCover == true){
          console.log("here");
          //throw new Error(configuration.error.errorauthorizehmo);
          req.body.patienttype = configuration.patienttype[1];
          req.body.status = configuration.status[1];
          validateinputfaulsyvalue({authorizationcode});

        }
          */

        if(authorizationcode){
          req.body.patienttype = configuration.patienttype[1];

        }
        //define the service type
        if(isHMOCover==configuration.ishmo[1] || isHMOCover == true){
          req.body.status = configuration.status[1];
        }
       
       
       
        //get token from header and extract clinic
       
        //check for 11 digit
        if(phoneNumber.length !== 11){
          throw new Error(configuration.error.errorelevendigit);

        }

       
        if(dateOfBirth) req.body.age= moment().diff(moment(dateOfBirth), 'years');
        //if not dateObirth but age calculate date of birth
        if(!dateOfBirth && req.body.age ) req.body.dateOfBirth = moment().subtract(Number(req.body.age), 'years').format('YYYY-MM-DD');
        console.log(req.body);
       
        var selectquery ={"title":1,"firstName":1,"middleName":1,"lastName":1,"country":1, "stateOfResidence": 1,"LGA": 1,"address":1,"age":1,"dateOfBirth":1,"gender":1,"nin":1,"phoneNumber":1,"email":1,"oldMRN":1,"nextOfKinName":1,"nextOfKinRelationship":1,"nextOfKinPhoneNumber":1,"nextOfKinAddress":1,
          "maritalStatus":1, "disability":1,"occupation":1,"isHMOCover":1,"HMOName":1,"HMOId":1,"HMOPlan":1,"MRN":1,"createdAt":1, "passport":1};
        const foundUser:any =  await readonepatient({phoneNumber},selectquery,'','');
        //category
        if(foundUser && phoneNumber !== configuration.defaultphonenumber){
            throw new Error(`Patient ${configuration.error.erroralreadyexit}`);

        }
        //var settings =await configuration.settings();
        //validate if price is set for patient registration
        //var newRegistrationPrice = await readoneprice({servicecategory:settings.servicecategory[0].category});
       // var appointmentPrice = await readoneprice({servicecategory:appointmentcategory,servicetype:appointmenttype});
        //console.log('appointmentprice', appointmentPrice);
      
      var {isHMOCover} = req.body;
      var newRegistrationPrice:any;
       
      const foundPricingmodel:any =  await readonepricemodel({pricingtype:configuration.pricingtype[1]});
      
      if(foundPricingmodel){
          const age = Number(req.body.age);
          const isAdult = age >= 18;
          const isChild = age < 18;
        //check for error
        console.log("Clinic from pricing model:", foundPricingmodel.exactnameofancclinic);
        console.log("Clinic from request:", clinic);
        console.log("Is adult:", isAdult);
        console.log("Age:", age);

        //confirm the type of pricing model
        if( foundPricingmodel.exactnameofancclinic == clinic ){
          console.log("clinic");
          newRegistrationPrice= await readoneprice({servicecategory:configuration.category[3],isHMOCover,servicetype:clinic});
        }
        else if(isAdult){
          console.log("greater than 18")
           newRegistrationPrice= await readoneprice({servicecategory:configuration.category[3],isHMOCover,servicetype:{$regex:foundPricingmodel.exactnameofservicetypeforadult,$options: 'i'}});
        }
        else if(isChild){
          console.log("less than 18");
          newRegistrationPrice= await readoneprice({servicecategory:configuration.category[3],isHMOCover,servicetype:{$regex: foundPricingmodel.exactnameofservicetypeforchild,$options: 'i'}});
       
        }
        else{
          console.log("errror /////");
          //return error
          throw new Error(`${configuration.error.errornopriceset} ${foundPricingmodel.exactnameofservicetypeforchild} ${foundPricingmodel.exactnameofservicetypeforadult} or ${clinic}` );

        }
        //find pricing model


      }
      else{
         newRegistrationPrice= await readoneprice({servicecategory:configuration.category[3],isHMOCover,servicetype:configuration.category[3]});

      }
       
        //use age to calculate price

       console.log("newRegistrationPrice",newRegistrationPrice);
        
        if(!(isHMOCover == configuration.ishmo[1] || isHMOCover == true) && !newRegistrationPrice){
          console.log("second errror /////");
          throw new Error(configuration.error.errornopriceset);

      }
      var uniqunumber =await storeUniqueNumber(4);
       // chaorten the MRN to alphanumeric 
        req.body.MRN=uniqunumber;        
        req.body.password=configuration.defaultPassword;
        //other validations
        var payment=[];
         const createpatientqueryresult=await createpatient(req.body);
         //create payment
         //create payment for only none hmo patient
         let queryappointmentresult;
         let queryresult;
         let vitals =await createvitalcharts({status:configuration.status[8]});
         if(isHMOCover == configuration.ishmo[1] || isHMOCover == true)
         {
          queryappointmentresult = await createappointment({policecase,physicalassault,sexualassault,policaename,servicenumber,policephonenumber,division,appointmentid,patient:createpatientqueryresult._id,clinic,reason, appointmentdate, appointmentcategory, appointmenttype,vitals:vitals._id,firstName,lastName, MRN:createpatientqueryresult?.MRN,HMOId:createpatientqueryresult?.HMOId,HMOName:createpatientqueryresult?.HMOName});
          queryresult =await updatepatient(createpatientqueryresult._id,{$push:{appointment:queryappointmentresult._id}});
         
        
         }
         else{
          const createpaymentqueryresult =await createpayment({firstName,lastName,MRN:req.body.MRN,phoneNumber,paymentreference:req.body.MRN,paymentype:newRegistrationPrice.servicetype,paymentcategory:newRegistrationPrice.servicecategory,patient:createpatientqueryresult._id,amount:Number(newRegistrationPrice.amount)})
          // const createappointmentpaymentqueryresult =await createpayment({paymentreference:appointmentid,paymentype:appointmenttype,paymentcategory:appointmentcategory,patient:createpatientqueryresult._id,amount:Number(appointmentPrice.amount)})
           payment.push(createpaymentqueryresult._id);
           //payment.push(createappointmentpaymentqueryresult._id);
           //update createpatientquery
           queryappointmentresult = await createappointment({firstName,lastName,policecase,physicalassault,sexualassault,policaename,servicenumber,policephonenumber,division,status:configuration.status[5],appointmentid,payment:createpaymentqueryresult._id ,patient:createpatientqueryresult._id,clinic,reason, appointmentdate, appointmentcategory, appointmenttype,vitals:vitals._id,MRN:createpatientqueryresult?.MRN,HMOId:createpatientqueryresult?.HMOId,HMOName:createpatientqueryresult?.HMOName});
           queryresult =await updatepatient(createpatientqueryresult._id,{payment,$push:{appointment:queryappointmentresult._id}});
          

         }
        
         res.status(200).json({queryresult, status: true});
    }catch(error:any){
      console.log(error);
        res.status(403).json({ status: false, msg: error.message });
    }
}
//read all patients
export async function getallpatients(req:any, res:any){
    try{
      //apply pagination
      const page = parseInt(req.query.page) || 1;
      const size = parseInt(req.query.size) || 150;
      const filter:any = {};
      
    // Add filters based on query parameters
    if (req.query.firstName) {
      //console.log(req.query.firstName)
      filter.firstName = new RegExp(req.query.firstName, 'i'); // Case-insensitive search for name
    }
    if (req.query.MRN) {
    
      filter.MRN = new RegExp(req.query.MRN, 'i');
    }
    if (req.query.HMOId) {
      filter.HMOId = new RegExp(req.query.HMOId, 'i'); // Case-insensitive search for email
    }
    if (req.query.lastName) {
      filter.lastName = new RegExp(req.query.lastName, 'i'); // Case-insensitive search for email
    }
    if (req.query.phoneNumber) {
      filter.phoneNumber = new RegExp(req.query.phoneNumber, 'i'); // Case-insensitive search for email
    }
    if (req.query.email) {
      filter.email = new RegExp(req.query.email, 'i'); // Case-insensitive search for email
    }
   
  

      //var settings = await configuration.settings();
        var selectquery ={"title":1,"firstName":1,"status":1,"middleName":1,"lastName":1,"country":1, "stateOfResidence": 1,"LGA": 1,"address":1,"age":1,"dateOfBirth":1,"gender":1,"nin":1,"phoneNumber":1,"email":1,"oldMRN":1,"nextOfKinName":1,"nextOfKinRelationship":1,"nextOfKinPhoneNumber":1,"nextOfKinAddress":1,
            "maritalStatus":1, "disability":1,"occupation":1,"isHMOCover":1,"HMOName":1,"HMOId":1,"HMOPlan":1,"MRN":1,"createdAt":1, "passport":1,"authorizationcode":1,"patienttype":1};
            //var populatequery="payment";
           
             var populatequery ={
            path: "payment",
           // match: { paymentcategory: { $eq: settings.servicecategory[0].category } },
           match: { paymentcategory: { $eq: configuration.category[3] } },
            select: {
              status: 1,
              paymentype:1
            },
          };
          var populateappointmentquery="appointment";
        const queryresult = await readallpatientpaginated(filter,selectquery,populatequery,populateappointmentquery,page,size);
        res.status(200).json({
            queryresult,
            status:true
          }); 

    }
    catch(e:any){
        res.status(403).json({status: false, msg:e.message});

    }

}
//get record for a particular patient
export async function getonepatients(req:any, res:any){
  const {id} = req.params;
  try{
    var selectquery ={"title":1,"firstName":1,"middleName":1,"lastName":1,"country":1, "stateOfResidence": 1,"LGA": 1,"address":1,"age":1,"dateOfBirth":1,"gender":1,"nin":1,"phoneNumber":1,"email":1,"oldMRN":1,"nextOfKinName":1,"nextOfKinRelationship":1,"nextOfKinPhoneNumber":1,"nextOfKinAddress":1,
      "maritalStatus":1, "disability":1,"occupation":1,"isHMOCover":1,"HMOName":1,"HMOId":1,"HMOPlan":1,"MRN":1,"createdAt":1, "passport":1};
      var populatequery ='payment';
      const queryresult = await readonepatient({_id:id},selectquery,populatequery,'appointment');
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


//update a patient
export async function updatepatients(req:any, res:any){
    try{
    //get id
    const {id, status} = req.params;
    //reject if status update
    if(status){

    }
    var queryresult = await updatepatient(id, req.body);
    res.status(200).json({
        queryresult,
        status:true
      }); 
    }catch(e:any){
      console.log(e);
      res.status(403).json({status: false, msg:e.message});

    }

  }
  //upload patients photo
  export var uploadpix = async (req:any, res:any)=>{
    try{
      console.log(req.files);
        const file = req.files.file;
        const fileName = file.name;
        const filename= "patientpassport" + uuidv4();
        let allowedextension = ['.jpg','.png','.jpeg'];
        let uploadpath =`${process.cwd()}/${configuration.useruploaddirectory}`;
        const extension = path.extname(fileName);
        const renamedurl= `${filename}${extension}`;
        //upload pix to upload folder
        await uploaddocument(file,filename,allowedextension,uploadpath);
        const {id} = req.params;
      
        //update pix name in patient
        const queryresult =await updatepatient(id,{passport:renamedurl});
        res.json({
            queryresult,
            status:true
          });
          

    }
    catch(e:any){
      
        
        //logger.error(e.message);
        res.json({status: false, msg:e.message});
        
    }

}

