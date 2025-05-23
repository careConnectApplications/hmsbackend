
import { Schema, model } from "mongoose";
import configuration from "../config";
const immunizationSchema = new Schema({
   
patient: {
type: Schema.Types.ObjectId,
ref: "Patientsmanagement",
default: null,
},
vaccinecode:String,
vaccinename:String,
vaccinetype:String,
manufacturer:String,
batchno:String,
expirydate:Date,
dose:String,
doseamount:String,
administrationsite:String,
administrationroute:String,
consent:String,
immunizationstatus:String,
comment:String,
adverseeventdescription:String,
onsetdateofreaction:Date,
reactcode:String,
reporter:String,
reportingsource:String,
staffname:String
},
{ timestamps: true }
);

const immunization= model('Immunization', immunizationSchema);
export default immunization;





