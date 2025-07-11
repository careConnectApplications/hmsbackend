"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pricesetting_1 = require("../controllers/setting/pricesetting");
const clinics_1 = require("../controllers/setting/clinics");
const servicetype_1 = require("../controllers/setting/servicetype");
const wardmanagement_1 = require("../controllers/setting/wardmanagement");
const theatremanagement_1 = require("../controllers/setting/theatremanagement");
const testscomponent_1 = require("../controllers/setting/testscomponent");
const hmomanagement_1 = require("../controllers/setting/hmomanagement");
const pricemodel_1 = require("../controllers/setting/pricemodel");
const outreachmedication_1 = require("../controllers/setting/outreachmedication");
const audit_1 = require("../controllers/audit/audit");
//import {readicdten} from "../controllers/icdten/icdten";
const router = express_1.default.Router();
router.post('/createprices', pricesetting_1.createprices);
router.get('/getallprices', pricesetting_1.getallprices);
router.get('/searchtest/:searchparams', pricesetting_1.searchtest);
router.get('/searchprocedure/:searchparams', pricesetting_1.searchprocedure);
router.get('/searchradiology/:searchparams', pricesetting_1.searchradiology);
router.post('/createclinics', clinics_1.createclinics);
router.get('/getallclinic', clinics_1.getallclinic);
router.get('/getonlyclinic', clinics_1.getonlyclinic);
//getonlyclinic
router.put('/updateclinics/:id', clinics_1.updateclinics);
router.put('/updateprices/:id', pricesetting_1.updateprices);
router.put('/updatepricestatus/:id', pricesetting_1.updatepricestatus);
router.post('/createservicetypes', servicetype_1.createservicetypes);
router.get('/getallservicetypes', servicetype_1.getallservicetypes);
router.put('/updateservicetypes/:id', servicetype_1.updateservicetypes);
//getpharmacyservicetype
router.get('/getpharmacyservicetype', servicetype_1.getpharmacyservicetype);
//ward management
router.post('/createward', wardmanagement_1.createward);
router.get('/getallward', wardmanagement_1.getallward);
router.put('/updateward/:id', wardmanagement_1.updateward);
//theatre
router.post('/createtheatre', theatremanagement_1.createtheatre);
router.get('/getalltheatre', theatremanagement_1.getalltheatre);
router.put('/updatetheatre/:id', theatremanagement_1.updatetheatre);
//hmo
router.post('/createinsurance', hmomanagement_1.createhmo);
router.get('/getallinsurance', hmomanagement_1.getallhmo);
router.put('/updateinsurance/:id', hmomanagement_1.updatehmo);
// test name
router.post('/createtestcomponents', testscomponent_1.createtestcomponents);
router.get('/getalltestcomponent', testscomponent_1.getalltestcomponent);
router.put('/updatetestcomponents/:id', testscomponent_1.updatetestcomponents);
router.get('/gettestcomponentbytestname/:testname(*)', testscomponent_1.gettestcomponentbytestname);
//pricing model
router.post('/createpricingmodel', pricemodel_1.createpricingmodel);
router.get('/getpricingmodel', pricemodel_1.getpricingmodel);
router.put('/updatepricingmodel/:id', pricemodel_1.updatepricingmodel);
//audit
router.get('/readallaudit', audit_1.readAllaudit);
//outreachmedication
router.post('/createoutreachmedication', outreachmedication_1.createoutreachmedications);
router.get('/getalloutreachmedication', outreachmedication_1.getalloutreachmedications);
router.put('/updateoutreachmedication/:id', outreachmedication_1.updateoutreachmedications);
exports.default = router;
