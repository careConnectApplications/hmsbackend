import express from 'express';
import {readbillinghistoryforapatient,readbillinghistoryforallapatient,confirmpayment,printreceipt,groupreadallpayment,readpaymentbyreferencenumber,confirmgrouppayment,groupreadallpaymentoptimized} from '../controllers/paymentandbilling/paymentandbilling';
const router = express.Router();



router.get('/getpatientbillinghistory/:id',readbillinghistoryforapatient);
router.get('/printreceipt/:paymentreference',printreceipt);
router.get('/getallpatientbillinghistory',readbillinghistoryforallapatient);
router.put('/confirmpayment/:id',confirmpayment);
router.get('/groupreadallpayment/:status?',groupreadallpayment);
//groupreadallpaymentoptimized
router.get('/groupreadallpaymentoptimized',groupreadallpaymentoptimized);
router.get('/readpaymentbyreferencenumber/:paymentreference',readpaymentbyreferencenumber);
router.put('/confirmgrouppayment/:paymentreferenceid',confirmgrouppayment);






export default router;



//readbillinghistoryforapatient