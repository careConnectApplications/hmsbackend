import express, { Application } from 'express';
import cors from 'cors';
import fileUpload from "express-fileupload";
import auth from "../routes/auth";
import users from "../routes/usermanagement";
import patientsmanagement from '../routes/patientmanagement';
import billingandpayment from '../routes/billingandpayment';
import appointment from '../routes/appointment';
import inventory from '../models/inventory';
import settings from '../routes/setting';
import downloads from "../routes/downloads";
import lab from '../routes/lab';
import pharmacy from '../routes/pharmacy';
import admission from '../routes/admission';
import nursingcare from '../routes/nursingcare';
import immunization from '../routes/immunization';
import nutrition from '../routes/nutrition';
import radiology from '../routes/radiology';
import pathogragh from '../routes/pathograph';
import familyplanning from '../routes/familyplanning';
import referrer from '../routes/referrer';
import deliverynote from '../routes/deliverynote';
import procedure from '../routes/procedure';
import dashboard from '../routes/dashboard';
import anc from '../routes/anc';
import theatreadmission from '../routes/theatreadmission';
import reports from '../routes/reportsandanalytics';
import { readicdeleven } from '../controllers/icdten/icdten';
import externalpartner from '../routes/externalpartner';



import { protect } from "../utils/middleware";


function createServer() {
  const app: Application = express();
  //cross origin sharing
  app.use(cors({
    origin: "*",
  }));
  app.use(express.static(__dirname + '/downloads'));
  app.use(express.static(__dirname + '/uploads'));
  //middleware to process json
  app.use(express.json({ limit: '50mb' }));
  /*
  app.use(fileUpload({
      useTempFiles: true,
      tempFileDir:path.join(__dirname, 'tmp'),
      createParentPath: true,
  }));
  */
  app.use(fileUpload());
  app.use('/api/v1/downloads', downloads);
  app.use('/api/v1/uploads', express.static('uploads'));
  app.use('/api/v1/auth', auth);
  app.use('/api/v1/users', protect, users);
  app.use('/api/v1/billing', protect, billingandpayment);
  app.use('/api/v1/patientsmanagement', protect, patientsmanagement);
  app.use('/api/v1/appointment', protect, appointment);
  app.use('/api/v1/lab', protect, lab);
  app.use('/api/v1/settings', protect, settings);
  app.use('/api/v1/pharmacy', protect, pharmacy);
  app.use('/api/v1/admission', protect, admission);
  app.use('/api/v1/nursingcare', protect, nursingcare);
  app.use('/api/v1/immunization', protect, immunization);
  app.use('/api/v1/nutrition', protect, nutrition);
  app.use('/api/v1/pathogragh', protect, pathogragh)
  app.use('/api/v1/radiology', protect, radiology);
  app.use('/api/v1/familyplanning', protect, familyplanning);
  app.use('/api/v1/referrer', protect, referrer);
  app.use('/api/v1/deliverynote', protect, deliverynote);
  app.use('/api/v1/procedure', protect, procedure);
  app.use('/api/v1/dashboard', protect, dashboard);
  app.use('/api/v1/anc', protect, anc);
  app.use('/api/v1/theatreadmission', protect, theatreadmission);
  app.use('/api/v1/reports', protect, reports);
  app.use('/api/v1/readicdten', readicdeleven);
  // External partner integration routes (secured via X-API-Key header)
  app.use('/api/v1/external', externalpartner);




  // Handle POST requests to /webhook
  /*
app.post('/api/v1/webhook', (req, res) => {
  // Log the incoming Event Grid event data
  console.log('Event received:', JSON.stringify(req.body, null, 2));

  // You can handle the event logic here
  // Example: if you're dealing with Azure Storage events, check for a specific event type
  const event = req.body[0];  // Event Grid sends an array of events
  if (event.eventType === 'Microsoft.Storage.BlobCreated') {
      console.log('A blob was created in your storage account.');
      // Handle blob creation event
  }

  // Send a 200 OK response back to acknowledge receipt of the event
  res.status(200).send('Event received');
});
*/

  return app;

}
export default createServer;
