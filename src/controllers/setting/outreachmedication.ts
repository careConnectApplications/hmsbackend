import configuration from "../../config";
import  {createoutreachmedication,readoneoutreachmedication,readalloutreachmedication,updateoutreachmedication}  from "../../dao/outreachmedication";
import { validateinputfaulsyvalue,generateRandomNumber} from "../../utils/otherservices";
import {createaudit} from "../../dao/audit";
//add outreach medication
export var createoutreachmedications = async (req:any,res:any) =>{
   
    try{
     
       const {outreachmedicationname} = req.body;
       validateinputfaulsyvalue({outreachmedicationname});  
       var outreachmedicationid = `${outreachmedicationname[0]}${generateRandomNumber(5)}${outreachmedicationname[outreachmedicationname.length -1]}`;
      // validate Outreachmedication
        const foundOutreachmedicationname =  await readoneoutreachmedication({outreachmedicationname},'');
        if(foundOutreachmedicationname){
            throw new Error(`Outreachmedication ${configuration.error.erroralreadyexit}`);

        }
         const queryresult=await createoutreachmedication({outreachmedicationname,outreachmedicationid});
        const { firstName, lastName } = (req.user).user;
            var actor = `${firstName} ${lastName}`;    
            await createaudit({action:"Created outreachMedicationid",actor,affectedentity:outreachmedicationname}); 
         res.status(200).json({queryresult, status: true});
        

    }catch(error:any){
      console.log(error);
        res.status(403).json({ status: false, msg: error.message });
    }
}

//read all wards

export async function getalloutreachmedications(req:Request, res:any){
    try{
        const queryresult = await readalloutreachmedication({},'');
        res.status(200).json({
            queryresult,
            status:true
          }); 

    }
    catch(e:any){
        res.status(403).json({status: false, msg:e.message});

    }

}

//update updateoutreachmedication
export async function updateoutreachmedications(req:any, res:any){
    try{
      console.log("here");
    //get id
    const {id} = req.params;
    const {outreachmedicationname} = req.body;
    validateinputfaulsyvalue({outreachmedicationname}); 
    var queryresult:any = await updateoutreachmedication(id, {outreachmedicationname});
    const { firstName, lastName } = (req.user).user;
    var actor = `${firstName} ${lastName}`;    
    await createaudit({action:"Updated Outreachmedication",actor,affectedentity:queryresult.outreachmedicationname}); 
    res.status(200).json({
        queryresult,
        status:true
      }); 
    }catch(e:any){
      console.log(e);
      res.status(403).json({status: false, msg:e.message});

    }

  }
  
