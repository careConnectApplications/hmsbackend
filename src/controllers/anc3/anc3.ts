import {updateanc, createanc,readallanc, readoneanc} from "../../dao/anc3";
import {readallancfollowup,updateancfollowup,createancfollowup} from "../../dao/ancfollowup3";
import { validateinputfaulsyvalue,isObjectAvailable } from "../../utils/otherservices";
import {readonepatient} from "../../dao/patientmanagement";
import configuration from "../../config";
//get lab order by patient
///////////////////////////anc followup/////////////////////////
export const readAllancfollowupByAncv3 = async (req:any, res:any) => {
    try {
      const {anc} = req.params;
      const queryresult = await readallancfollowup({anc},{},'');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };

 
export const createancfollowupsv3 = async (req:any, res:any) => {
    try {
      const {anc} = req.params;
      const { firstName,lastName} = (req.user).user;
      req.body.staffname = `${firstName} ${lastName}`;    
      var {heightoffundus,presentationandposition,presentingpart,foetalheight,bp,hb,protein,glucose,weight,oedema,tetanustoxoid,sulfadoxinepyrimethamine,albendazole,remark,staffname} = req.body;
      validateinputfaulsyvalue({heightoffundus,presentationandposition,presentingpart,foetalheight,bp,hb,protein,glucose,weight,oedema,tetanustoxoid,sulfadoxinepyrimethamine,albendazole,remark,staffname});
       //frequency must inlcude
       //route must contain allowed options
      
      const ancrecord:any =  await readoneanc({_id:anc},{},'');    
      //console.log(admissionrecord);   
      if(!ancrecord){
           throw new Error(`ANC donot ${configuration.error.erroralreadyexit}`);
  
       }
    const queryresult=await createancfollowup({anc:ancrecord._id,heightoffundus,presentationandposition,presentingpart,foetalheight,bp,hb,protein,glucose,weight,oedema,tetanustoxoid,sulfadoxinepyrimethamine,albendazole,remark,staffname});
    res.status(200).json({queryresult, status: true});
    }
    catch(e:any){
        res.status(403).json({status: false, msg:e.message});

    }
}



export async function updateancfollowupsv3(req:any, res:any){
    try{
    //get id
    const {id} = req.params;
    const { firstName,lastName} = (req.user).user;
    req.body.staffname = `${firstName} ${lastName}`;
    var {heightoffundus,presentationandposition,presentingpart,foetalheight,bp,hb,protein,glucose,weight,oedema,tetanustoxoid,sulfadoxinepyrimethamine,albendazole,remark,staffname} = req.body;
    validateinputfaulsyvalue({heightoffundus,presentationandposition,presentingpart,foetalheight,bp,hb,protein,glucose,weight,oedema,tetanustoxoid,sulfadoxinepyrimethamine,albendazole,remark,staffname});
    var queryresult = await updateancfollowup(id, {heightoffundus,presentationandposition,presentingpart,foetalheight,bp,hb,protein,glucose,weight,oedema,tetanustoxoid,sulfadoxinepyrimethamine,albendazole,remark,staffname});
    res.status(200).json({
        queryresult,
        status:true
      }); 
    }catch(e:any){
      console.log(e);
      res.status(403).json({status: false, msg:e.message});

    }

  }



////////////////////////////////anc////////////////////////////
  export const readAllancByPatientv3 = async (req:any, res:any) => {
    try {
      const {patient} = req.params;
      const queryresult = await readallanc({patient},{},'patient');
      res.status(200).json({
        queryresult,
        status:true
      }); 
    } catch (error:any) {
      res.status(403).json({ status: false, msg: error.message });
    }
  };

export const createancsv3 = async (req:any, res:any) => {
    try {
      
      const {id} = req.params;
      const { firstName,lastName} = (req.user).user;
      const staffname = `${firstName} ${lastName}`;  
      const {postmedicalorsurgicalhistory,previouspregnancy,historyofpresentpregnancy} = req.body;
      const {lmp,edd,gravidity,breasts,height,cvs,rs,pelvis,abdomen} = req.body;      
       const pregnancysummary={lmp,edd,gravidity};
       const generalexamination={breasts,height,cvs,rs,pelvis,abdomen};
       /////////// validation for anc followup /////////////////////////
       var {heightoffundus,presentationandposition,presentingpart,foetalheight,bp,hb,protein,glucose,weight,oedema,tetanustoxoid,sulfadoxinepyrimethamine,albendazole,remark} = req.body;
      validateinputfaulsyvalue({heightoffundus,presentationandposition,presentingpart,foetalheight,bp,hb,protein,glucose,weight,oedema,tetanustoxoid,sulfadoxinepyrimethamine,albendazole,remark,staffname});
   
      
       //frequency must inlcude
       //route must contain allowed options
      const patientrecord:any =  await readonepatient({_id:id},{},'','');    
      //console.log(admissionrecord);   
      if(!patientrecord){
           throw new Error(`Patient donot ${configuration.error.erroralreadyexit}`);
  
       }
    const queryresult=await createanc({patient:patientrecord._id,pregnancysummary,generalexamination,postmedicalorsurgicalhistory,previouspregnancy,historyofpresentpregnancy,staffname});
    /////////////////////////////create first followup ////////////////////////////
       //create first followup
      await createancfollowup({anc:queryresult._id,heightoffundus,presentationandposition,presentingpart,foetalheight,bp,hb,protein,glucose,weight,oedema,tetanustoxoid,sulfadoxinepyrimethamine,albendazole,remark,staffname});
    ///////////////////end first  follow up/////////////////////////////////
    res.status(200).json({queryresult, status: true});
    }
    catch(e:any){
        res.status(403).json({status: false, msg:e.message});

    }
}

export async function updateancsv3(req:any, res:any){
    
    try{
    //
    const {id} = req.params;
    const { firstName,lastName} = (req.user).user;
    const staffname = `${firstName} ${lastName}`;
    const {postmedicalorsurgicalhistory,previouspregnancy,historyofpresentpregnancy} = req.body;
    const {lmp,edd,gravidity,breasts,height,cvs,rs,pelvis,abdomen} = req.body;      
    const pregnancysummary={lmp,edd,gravidity};
    const generalexamination={breasts,height,cvs,rs,pelvis,abdomen}
   
    
    //validateinputfaulsyvalue({...vitals});
    var queryresult= await updateanc(id, {pregnancysummary,generalexamination,postmedicalorsurgicalhistory,previouspregnancy,historyofpresentpregnancy,staffname});
    res.status(200).json({
        queryresult,
        status:true
      }); 
    }catch(e:any){
      console.log(e);
      res.status(403).json({status: false, msg:e.message});
  
    }
      
  
  }
  