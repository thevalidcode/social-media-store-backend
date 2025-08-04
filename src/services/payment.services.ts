import flutterwaveProvider from "../providers/flutterwave.providers";
import paystackProvider from "../providers/paystack.providers";

const handleFlutterwaveSuccess = async (
  data: any,
  customer: any,
  storeId: number
) => {
  return await flutterwaveProvider.processSuccess(data, customer, storeId);
};

const handleFlutterwaveFailure = async (
  data: any,
  customer: any,
  storeId: number
) => {
  return await flutterwaveProvider.processFailure(data, customer, storeId);
};

const handlePaystackSuccess = async (
  data: any,
  customer: any,
  storeId: number
) => {
  return await paystackProvider.processSuccess(data, customer, storeId);
};

const handlePaystackFailure = async (
  data: any,
  customer: any,
  storeId: number
) => {
  return await paystackProvider.processFailure(data, customer, storeId);
};

export default {
  handleFlutterwaveSuccess,
  handleFlutterwaveFailure,
  handlePaystackSuccess,
  handlePaystackFailure,
};
