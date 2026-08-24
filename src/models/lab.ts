import { Schema, model } from "mongoose";
import configuration from "../config";

export interface labinterface {
  testname: String;
  patient:any,

}
const testresultSchema = new Schema({
  subcomponent: String,
  result: String,
  nranges: String,
  unit: String
});

const labSchema = new Schema({
  processeddate:{
    type: Date

  },
  testname:
  {
    type: String, 
    required: true
  },
  testid:
  {
    type: String, 
    required: true
  },
  department:
  {
    type: String, 
    required: true
  },
  testresult:[testresultSchema ],
  
 
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Patientsmanagement",
    default: null,
  },
  appointment: 
    {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    }
  ,
  remark:
  {
    type: String
  },
  appointmentid:
  {
    type: String, 
    required: true
  },
  staffname: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    default: null,
  },
   firstName: String,
   lastName: String,
   MRN: String,
   phoneNumber: String,
   HMOId: String,
   HMOName: String ,
  payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    amount: Number,
  status:{
    required: true,
    type: String,
    default: configuration.status[14],

  }
},
{ timestamps: true }
);

labSchema.index({ appointment: 1 });
labSchema.index({ patient: 1 });

const lab = model('Lab', labSchema);
export default lab;


