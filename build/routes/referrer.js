"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//
//scheduleappointment
const express_1 = __importDefault(require("express"));
const referrer_1 = require("../controllers/referrer/referrer");
const router = express_1.default.Router();
router.post('/createreferrers/:id', referrer_1.createreferrers);
router.get('/readallreferrerbypatient/:patient', referrer_1.readAllreferrerByPatient);
router.get('/readallreferrerbyclinic/:clinic', referrer_1.readAllreferrerByClinic);
router.put('/updatereferrers/:id', referrer_1.updatereferrers);
router.post('/acceptreferrers/:id', referrer_1.acceptreferrers);
//scheduleappointment
router.put('/scheduleappointment/:id', referrer_1.scheduleappointment);
exports.default = router;
