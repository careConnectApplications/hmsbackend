"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const auth_1 = __importDefault(require("../routes/auth"));
const usermanagement_1 = __importDefault(require("../routes/usermanagement"));
const patientmanagement_1 = __importDefault(require("../routes/patientmanagement"));
const billingandpayment_1 = __importDefault(require("../routes/billingandpayment"));
const appointment_1 = __importDefault(require("../routes/appointment"));
const setting_1 = __importDefault(require("../routes/setting"));
const downloads_1 = __importDefault(require("../routes/downloads"));
const lab_1 = __importDefault(require("../routes/lab"));
const pharmacy_1 = __importDefault(require("../routes/pharmacy"));
const admission_1 = __importDefault(require("../routes/admission"));
const nursingcare_1 = __importDefault(require("../routes/nursingcare"));
const immunization_1 = __importDefault(require("../routes/immunization"));
const nutrition_1 = __importDefault(require("../routes/nutrition"));
const radiology_1 = __importDefault(require("../routes/radiology"));
const pathograph_1 = __importDefault(require("../routes/pathograph"));
const familyplanning_1 = __importDefault(require("../routes/familyplanning"));
const referrer_1 = __importDefault(require("../routes/referrer"));
const deliverynote_1 = __importDefault(require("../routes/deliverynote"));
const procedure_1 = __importDefault(require("../routes/procedure"));
const dashboard_1 = __importDefault(require("../routes/dashboard"));
const anc_1 = __importDefault(require("../routes/anc"));
const theatreadmission_1 = __importDefault(require("../routes/theatreadmission"));
const reportsandanalytics_1 = __importDefault(require("../routes/reportsandanalytics"));
const icdten_1 = require("../controllers/icdten/icdten");
const externalpartner_1 = __importDefault(require("../routes/externalpartner"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const externalpartner_swagger_1 = require("../docs/externalpartner.swagger");
const middleware_1 = require("../utils/middleware");
function createServer() {
    const app = (0, express_1.default)();
    //cross origin sharing
    app.use((0, cors_1.default)({
        origin: "*",
    }));
    app.use(express_1.default.static(__dirname + '/downloads'));
    app.use(express_1.default.static(__dirname + '/uploads'));
    //middleware to process json
    app.use(express_1.default.json({ limit: '50mb' }));
    /*
    app.use(fileUpload({
        useTempFiles: true,
        tempFileDir:path.join(__dirname, 'tmp'),
        createParentPath: true,
    }));
    */
    app.use((0, express_fileupload_1.default)());
    app.use('/api/v1/downloads', downloads_1.default);
    app.use('/api/v1/uploads', express_1.default.static('uploads'));
    app.use('/api/v1/auth', auth_1.default);
    app.use('/api/v1/users', middleware_1.protect, usermanagement_1.default);
    app.use('/api/v1/billing', middleware_1.protect, billingandpayment_1.default);
    app.use('/api/v1/patientsmanagement', middleware_1.protect, patientmanagement_1.default);
    app.use('/api/v1/appointment', middleware_1.protect, appointment_1.default);
    app.use('/api/v1/lab', middleware_1.protect, lab_1.default);
    app.use('/api/v1/settings', middleware_1.protect, setting_1.default);
    app.use('/api/v1/pharmacy', middleware_1.protect, pharmacy_1.default);
    app.use('/api/v1/admission', middleware_1.protect, admission_1.default);
    app.use('/api/v1/nursingcare', middleware_1.protect, nursingcare_1.default);
    app.use('/api/v1/immunization', middleware_1.protect, immunization_1.default);
    app.use('/api/v1/nutrition', middleware_1.protect, nutrition_1.default);
    app.use('/api/v1/pathogragh', middleware_1.protect, pathograph_1.default);
    app.use('/api/v1/radiology', middleware_1.protect, radiology_1.default);
    app.use('/api/v1/familyplanning', middleware_1.protect, familyplanning_1.default);
    app.use('/api/v1/referrer', middleware_1.protect, referrer_1.default);
    app.use('/api/v1/deliverynote', middleware_1.protect, deliverynote_1.default);
    app.use('/api/v1/procedure', middleware_1.protect, procedure_1.default);
    app.use('/api/v1/dashboard', middleware_1.protect, dashboard_1.default);
    app.use('/api/v1/anc', middleware_1.protect, anc_1.default);
    app.use('/api/v1/theatreadmission', middleware_1.protect, theatreadmission_1.default);
    app.use('/api/v1/reports', middleware_1.protect, reportsandanalytics_1.default);
    app.use('/api/v1/readicdten', icdten_1.readicdeleven);
    // External partner integration routes (secured via X-API-Key header)
    app.use('/api/v1/external', externalpartner_1.default);
    // Swagger documentation endpoints for external partner integration
    app.use('/api/v1/external/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(externalpartner_swagger_1.externalPartnerSwaggerSpec));
    app.get('/api/v1/external/docs-json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(externalpartner_swagger_1.externalPartnerSwaggerSpec);
    });
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
exports.default = createServer;
