import { Schema, model } from "mongoose";
import configuration from "../config";




const prescriptionSchema = new Schema({
  firstName:String,
   lastName:String,
   MRN:String,
   HMOId:String,
   HMOName:String,
   HMOPlan:String,
   isHMOCover:String,
  
   appointmentdate:Date,
   clinic:String,

  prescription:
  {
    type: String, 
    required: true
  },
  
  pharmacy:
  {
    type: String, 
    required: true
  },
  prescriptionnote:
  {
    type: String
  },
  appointment:{
    type: Schema.Types.ObjectId,
    ref: "Appointment",
    default: [],
  },
  appointmentid:
  {
    type: String, 
    required: true
  },
  
  orderid:
  {
    type: String, 
    required: true
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Patientsmanagement",
    default: null,
  },
 
  prescribersname:
  {
    type: String, 
    required: true
  },

  pharmacistname:
  {
    type: String
  },
  dosageform:String,
  strength:String,
  dosage:String,
  duration:String,
  frequency:String,
  route:String,
  qty:
  {
    type: Number
  },
  balance:
  {
    type: Number
  },
  remark:
  {
    type: String
  },
  doctorsnote:[],
  payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  
  dispensestatus:{
    type: String,
    default: configuration.status[14],
    required: true

  },
  servedstatus:{
    type: String,
    default: configuration.servedstatus[1]

  }
},
{ timestamps: true }
);

prescriptionSchema.index({ appointment: 1 });
prescriptionSchema.index({ patient: 1 });

const prescription= model('Prescription', prescriptionSchema);
export default prescription;



/*
 order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    drug_id INT,
    quantity_ordered INT,
    order_price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES PurchaseOrders(order_id),
    FOREIGN KEY (drug_id) REFERENCES Drugs(drug_id)
*/