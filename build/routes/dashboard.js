"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//dashboard
const express_1 = __importDefault(require("express"));
const dashboard_1 = require("../controllers/dashboard/dashboard");
const router = express_1.default.Router();
router.get('/', dashboard_1.newdashboard);
exports.default = router;
