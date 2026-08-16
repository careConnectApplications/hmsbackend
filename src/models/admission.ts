import { Schema, model } from "mongoose";
import configuration from "../config";




const admissionSchema = new Schema({

  alldiagnosis: [{
    note: String,
    diagnosis: String
  }],
  referedward:
  {
    type: Schema.Types.ObjectId,
    ref: "Wardmanagement",
    default: null,
  },
  previousward:
  {
    type: Schema.Types.ObjectId,
    ref: "Wardmanagement",
    default: null,
  },
  admittospecialization:
  {
    type: String
  },
  admissionid:
  {
    type: String
  },
  referddate:
  {
    type: Date,
    required: true
  },
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
  doctorname:
  {
    type: String,
    required: true
  },
  staffname:
  {
    type: String
  },
  dischargereason:
  {
    type: String
  },
  dischargedate:
  {
    type: Date
  },
  status: {
    type: String,
    default: configuration.admissionstatus[0],
    required: true

  }
},
  { timestamps: true }
);

const admission = model('Admission', admissionSchema);
export default admission;



/*
 order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    drug_id INT,
    quantity_ordered INT,
    order_price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES PurchaseOrders(order_id),
    FOREIGN KEY (drug_id) REFERENCES Drugs(drug_id)
*/