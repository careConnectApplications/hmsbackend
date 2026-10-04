import mongoose, { Schema, Document } from "mongoose";

export interface IRefund extends Document {
  patient: any;
  amount: number;
  reason?: string;
  status: string;
  refundedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refundSchema: Schema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patientsmanagement",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
    },
    status: {
      type: String,
      default: "Pending",
    },
    refundedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRefund>("Refund", refundSchema);
