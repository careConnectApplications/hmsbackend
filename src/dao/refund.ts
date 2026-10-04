import refund from "../models/refund";

export const createrefund = async (payload: any) => {
  const newRefund = new refund(payload);
  return await newRefund.save();
};

export const readallrefund = async (query: any, populatequery?: any) => {
  if (populatequery) {
    return await refund.find(query).populate(populatequery).sort({ createdAt: -1 });
  }
  return await refund.find(query).sort({ createdAt: -1 });
};

export const readonerefund = async (query: any) => {
  return await refund.findOne(query);
};

export const updaterefund = async (id: string, payload: any) => {
  return await refund.findByIdAndUpdate(id, payload, { new: true });
};
