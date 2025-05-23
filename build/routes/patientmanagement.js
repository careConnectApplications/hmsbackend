"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patientmanagement_1 = require("../controllers/patientmanagement/patientmanagement");
const router = express_1.default.Router();
router.post('/uploadpatientphoto/:id', patientmanagement_1.uploadpix);
router.post('/createpatients', patientmanagement_1.createpatients);
router.put('/updateauthorizationcode/:id', patientmanagement_1.updateauthorizationcode);
router.get('/getallpatients', patientmanagement_1.getallpatients);
router.put('/updatepatients/:id', patientmanagement_1.updatepatients);
router.get('/getonepatients/:id', patientmanagement_1.getonepatients);
router.post('/bulkuploadhmopatients', patientmanagement_1.bulkuploadhmopatients);
router.get('/getallhmopatients', patientmanagement_1.getallhmopatients);
router.get('/searchpartient/:searchparams', patientmanagement_1.searchpartient);
exports.default = router;
