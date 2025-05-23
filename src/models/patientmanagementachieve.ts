import { Schema, model } from "mongoose";
import configuration from "../config";
import bcrypt from "bcryptjs";
export interface patientinterface {
  title: String;
  firstName: String;
  middleName: String;
  lastName:String;
}
//create schema
const patientachieveSchema = new Schema(
  {
    title: {
     
      type: String
    },
    firstName: {
      required: true,
      type: String,
    },
    middleName: {
      type: String,
    },
    lastName: {
      required: true,
      type: String,
    },

    country: {
     
      type: String
    },
    stateOfResidence: {
 
      type: String,
    },
    LGA: {
      
      type: String
    },
    address: {
      
      type: String
    },
    age: {
      type: String
    },
    dateOfBirth: {
      type: String
    },
    gender: {
      required: true,
      type: String,
    },
    nin: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    oldMRN: {
      type: String,
    },
    nextOfKinName: {
    
      type: String,
    },
    nextOfKinRelationship: {
    
      type: String,
    },
    nextOfKinPhoneNumber: {
        
        type: String,
      },
      nextOfKinAddress: {
       
        type: String,
      },
    maritalStatus: {
     
      type: String,
    },
    disability: {
      
      type: String,
    },
    occupation: {
    
      type: String,
    },
    isHMOCover: {
  
      type: String,
      default: configuration.ishmo[0],
    },
    HMOName: {
      type: String,
    },
    HMOId: {
      
      type: String,
    },
    HMOPlan: {
      type: String,
    },
    passport: {
      type: String,
    },
    MRN: {
        required: true,
        type: String,
      },
      password: {
        required: true,
        type: String,
      },
      appointment: [
        {
          type: Schema.Types.ObjectId,
          ref: "Appointment",
          default: [],
        },
      ],
      admission:[
        {
          type: Schema.Types.ObjectId,
          ref: "Admission",
          default: [],
        },

      ],
      prescription: [
        {
          type: Schema.Types.ObjectId,
          ref: "Prescription",
          default: [],
        },
      ],
    
      lab: [
        {
          type: Schema.Types.ObjectId,
          ref: "Lab",
          default: [],
        },
      ],
      radiology: [
        {
          type: Schema.Types.ObjectId,
          ref: "Radiology",
          default: [],
        },
      ],
      prcedure:[
        {
          type: Schema.Types.ObjectId,
          ref: "Procedure",
          default: [],
        },
      ],
      status:{
        required: true,
        type: String,
        default: configuration.status[2],
  
      },
      payment: [
        {
          type: Schema.Types.ObjectId,
          ref: "Payment",
          default: [],
        },
      ]
    
  },
  { timestamps: true }
);



//create a model
const patientsachievemanagement = model("Patientsachievemanagement", patientachieveSchema);
//export the model
export default patientsachievemanagement;
