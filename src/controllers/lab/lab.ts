import {readalllab,updatelab,readonelab,readlabaggregate,optimizedreadalllab, countlab} from "../../dao/lab";
import  {updatepatient}  from "../../dao/patientmanagement";
import {validateinputfaulsyvalue} from "../../utils/otherservices";
import {createpayment} from "../../dao/payment";
import  mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import  {readone}  from "../../dao/users";
import configuration from "../../config";
import {readoneadmission} from  "../../dao/admissions";

//adjust lab to view from department

// Get all lab records
export const readalllabb = async (req:any, res:any) => {
    try {
        //const {clinic} = (req.user).user;
      //const queryresult = await readalllab({department:clinic},{},'patient','appointment','payment');
      const queryresult = await readalllab({},{},'patient','appointment','payment');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };
  //get lab order by patient
  export const readAllLabByPatient = async (req:any, res:any) => {
    try {
      //const {clinic} = (req.user).user;
      const {id} = req.params;
      //const queryresult = await readalllab({patient:id,department:clinic},{},'patient','appointment','payment');
      const queryresult = await readalllab({patient:id},{},'patient','appointment','payment');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };
  //lab processing
 export async function labresultprocessing(req:any, res:any){
  try{
  //get id
  const {id} = req.params;
  const {subcomponents} = req.body;
  const {email, staffId} = (req.user).user;
  //find id and validate
  var lab =await readonelab({_id:id},{},'');
  //if not lab or status !== scheduled return error
  if(!lab || lab.status !== configuration.status[5]){
    throw new Error(configuration.error.errorservicetray);

  }
  validateinputfaulsyvalue({lab,subcomponents});
  const user = await readone({email, staffId});

  //loop through array of subcomponent 
  for(var i=0; i < subcomponents.length; i++){
    //throw error if no subcomponent
    const {subcomponent,result,nranges,unit} =subcomponents[i];
   // validateinputfaulsyvalue({subcomponent,result,nranges,unit})
   validateinputfaulsyvalue({subcomponent})
  }
  var processeddate:any=new Date();
  //update test, lab technical name and test status
  var queryresult=await updatelab({_id:id},{$push: {testresult:subcomponents},status:configuration.status[7],processeddate,staffname:user?._id});
  //update status of appointment
  res.status(200).json({
      queryresult,
      status:true
    });
    
  }catch(e:any){
    console.log(e);
    res.status(403).json({status: false, msg:e.message});

  }

}

//view all schedule lab
// Get all lab records
export const readallscheduledlab = async (req:any, res:any) => {
  try {
      const {clinic} = (req.user).user;
      
    //const queryresult = await readalllab({department:clinic},{},'patient','appointment','payment');
    const queryresult = await readalllab({$or:[{status:configuration.status[5]},{status:configuration.status[13]},{status:configuration.status[14]}],department:clinic},{},'patient','appointment','payment');
    res.status(200).json({
      queryresult,
      status:true
    }); 
  } catch (error:any) {
    res.status(403).json({ status: false, msg: error.message });
  }
};
export const readallscheduledlaboptimized = async (req:any, res:any) => {
  try {
    var {status,firstName,MRN,HMOId,lastName,phoneNumber,testname} = req.query;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 150;
        var filter:any = status ? { status } : testname ? { testname } : {};
        if (firstName) {   
          filter.firstName = new RegExp(firstName, 'i'); // Case-insensitive search for name
        }
        if(MRN) {
          filter.MRN = new RegExp(MRN, 'i');
        }
        if (HMOId) {
          filter.HMOId = new RegExp(HMOId, 'i'); // Case-insensitive search for email
        }
        if (lastName) {
          filter.lastName = new RegExp(lastName, 'i'); // Case-insensitive search for email
        }
        if (phoneNumber) {
          filter.phoneNumber = new RegExp(phoneNumber, 'i'); // Case-insensitive search for email
        }

        const skip = (page - 1) * size;

        let aggregatequery = 
        [ 
          {
            $match:filter
           },
           { $sort: { createdAt: -1 } },
           { $skip: skip },
           { $limit: size },
         
        {
          $lookup: {
            from: 'patientsmanagements',        
            localField: 'patient',    
            foreignField: '_id',      
            as: 'patient'      
          }
        },
       
        {
          $unwind: {
            path: '$patient',
            preserveNullAndEmptyArrays: true
    
          }  // Deconstruct the patient array (from the lookup)
        },
        {
          $project:{
            _id:1,
            createdAt:1,
            testname:1,
            updatedAt:1,
            testid:1,
            department:1,
            firstName: { $ifNull: ["$firstName", "$patient.firstName"] },
            lastName: { $ifNull: ["$lastName", "$patient.lastName"] },
            phoneNumber: { $ifNull: ["$phoneNumber", "$patient.phoneNumber"] },
            MRN: { $ifNull: ["$MRN", "$patient.MRN"] },
            patient:"$patient",
            HMOId: { $ifNull: ["$HMOId", "$patient.HMOId"] },
            HMOName: { $ifNull: ["$HMOName", "$patient.HMOName"] },
            status:1,
          }
        }
      ];
       
      const labdetails = await readlabaggregate(aggregatequery);          
      const totallabdetails = await countlab(filter);
      const totalPages = Math.ceil(totallabdetails / size);

      res.status(200).json({
        queryresult: { labdetails, totalPages, totallabdetails, size, page },
        status:true
      });


  } catch (error:any) {
    res.status(403).json({ status: false, msg: error.message });
  }
};

//lab reports
export const listlabreport = async (req:any, res:any) => {
  try {
   
   
    // find related
    const {clinic} = (req.user).user;
    const query = { status:configuration.status[7],department:clinic};
    const queryresult = await readlabaggregate([
      {
        $lookup: {
          from: "appointments",
          localField: "appointment",
          foreignField: "_id",
          as: "appointments",
        },
      },
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
       
        $match: query,
      },
      

      {
        $group: {
          _id: "$appointment",
          MRN:{$first: {$first:"$patient.MRN"}},
          firstName:{$first: {$first:"$patient.firstName"}},
          lastName:{$first: {$first:"$patient.lastName"}},
          phoneNumber:{$first: {$first:"$patient.phoneNumber"}},
          appointmentid: {$first:"$appointmentid"},
          //appointmentid: {$first: {$first:"$appointments.appointmentid"}},
          appointmentdate: {$first: {$first: "$appointments.appointmentdate"}},
          createdAt: {$first:"$createdAt"}
         
          
        },
        
        
      },
      


      
      { $sort: { createdAt: -1 } },
      
    ]);
   
   
    

    res.json({
      queryresult,
      status: true,
    });
  } catch (error:any) {
    res.status(403).json({ status: false, msg: error.message });
  }
};
//print lab report
export const printlabreport = async (req:any, res:any) => {
  try {
      //const {clinic} = (req.user).user;
    //const queryresult = await readalllab({department:clinic},{},'patient','appointment','payment');
    var populatequery ={
      path: "staffname",
      select: {
        firstName: 1,
        middleName:1,
        _id:0
      },
    };
    var patientpopulatequery ={
      path: "patient",
      select: {
        MRN: 1,
        firstName:1,
        lastName:1,
        age:1,
        gender:1

        //_id:0
      },
    };
    const {id} = req.params;
    
    const queryresult = await readalllab({appointment:id, testresult: { $exists: true, $not: { $size: 0 } }},{testname:1,testid:1,testresult:1,status:1,appointmentid:1,createdAt:1,processeddate:1},populatequery,patientpopulatequery,'');
    res.status(200).json({
      queryresult,
      status:true
    }); 
  } catch (error:any) {
    res.status(403).json({ status: false, msg: error.message });
  }
};
//list lab report by patient
//lab reports
export const listlabreportbypatient = async (req:any, res:any) => {
  try {
   
    const {id} = req.params;
    const objectId = new ObjectId(id);
    // find related
    //const query = { patient._id:id};
    const query = { patient: objectId,status:configuration.status[7]};
    const queryresult = await readlabaggregate([
      {
       
        $match: query,
      },
      
      {
        $lookup: {
          from: "appointments",
          localField: "appointment",
          foreignField: "_id",
          as: "appointments",
        },
      },
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
     
      

      {
        $group: {
          _id: "$appointment",
          MRN:{$first: {$first:"$patient.MRN"}},
          firstName:{$first: {$first:"$patient.firstName"}},
          lastName:{$first: {$first:"$patient.lastName"}},
          phoneNumber:{$first: {$first:"$patient.phoneNumber"}},
          appointmentid: {$first: {$first:"$appointments.appointmentid"}},
          appointmentdate: {$first: {$first: "$appointments.appointmentdate"}}
          
        },
        
        
      },
      
      


      
      { $sort: { createdAt: -1 } },
      
    ]);
   
   
    

    res.json({
      queryresult,
      status: true,
    });
  } catch (error:any) {
    res.status(403).json({ status: false, msg: error.message });
  }
};
//this endpoint is use to accept or reject lab order
export const confirmlaborder = async (req:any, res:any) =>{
  try{
    //extract option
    const {option,remark} = req.body;
    const {id} = req.params;
    console.log('////confirmbodyrequest body////',req.body);
    console.log('////confirmbodyrequest params////',id);
  //search for the lab request
  var lab:any =await readonelab({_id:id},{},'patient');
  console.log('lab', lab);
  const {testname, testid,patient,amount} = lab;
  //validate the status
  let queryresult;
  //search for patient under admission. if the patient is admitted the patient admission number will be use as payment reference
  let paymentreference; 
  //let status;
//validate the status
  //search for patient under admission. if the patient is admitted the patient admission number will be use as payment reference
  var  findAdmission = await readoneadmission({patient:patient._id, status:{$ne: configuration.admissionstatus[5]}},{},'');
  if(findAdmission){
    paymentreference = findAdmission.admissionid;
    //status=configuration.status[5];

}
else{
  paymentreference = testid;
  //status=configuration.status[2];
}
  if(option == true && amount > 0){
    var createpaymentqueryresult =await createpayment({firstName:patient?.firstName,lastName:patient?.lastName,MRN:patient?.MRN,phoneNumber:patient?.phoneNumber,paymentreference,paymentype:testname,paymentcategory:configuration.category[2],patient:patient._id,amount});
    queryresult= await updatelab({_id:id},{status:configuration.status[2],payment:createpaymentqueryresult._id,remark});
    await updatepatient(patient._id,{$push: {payment:createpaymentqueryresult._id}});
    
  }
   
  else if(option == true  && amount==0){
    queryresult= await updatelab({_id:id},{status:configuration.status[5],remark});

  }
  else{
    queryresult= await updatelab({_id:id},{status:configuration.status[13],remark});

  }
  res.status(200).json({queryresult, status: true});
    //if accept
//accept or reject lab order
//var createpaymentqueryresult =await createpayment({paymentreference:id,paymentype:testname[i],paymentcategory:testsetting[0].category,patient:appointment.patient,amount:Number(testPrice.amount)})
//paymentids.push(createpaymentqueryresult._id);
//var queryresult=await updatepatient(appointment.patient,{$push: {payment:paymentids}});
//var testrecord = await createlab({payment:createpaymentqueryresult._id});
//change status to 2 or  13 for reject

  }
  catch(e:any){
    console.log("error", e);
    res.status(403).json({ status: false, msg: e.message });

  }
}


