"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = exports.signin = void 0;
exports.settings = settings;
const config_1 = __importDefault(require("../../config"));
const users_1 = require("../../dao/users");
const otherservices_1 = require("../../utils/otherservices");
//sign in
var signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("Signin attempt received:", { email: (_a = req.body) === null || _a === void 0 ? void 0 : _a.email });
        //destructure email and password
        const { email, password } = req.body;
        var requirepasswordchange;
        if (password == config_1.default.defaultPassword) {
            requirepasswordchange = true;
        }
        else {
            requirepasswordchange = false;
        }
        //validate email and password
        if (!email || !password) {
            console.log("Signin validation failed: missing email or password");
            throw new Error(config_1.default.error.errornoemailpassword);
        }
        //find user
        console.log(`Searching database for user email: ${email}`);
        const user = yield (0, users_1.readone)({ email });
        //check if user exit
        if (!user) {
            console.log(`Signin failed: User with email '${email}' not found`);
            throw new Error(config_1.default.error.errorinvaliduser);
        }
        console.log(`User found: ${user.email}, status: ${user.status}, role: ${user.role}`);
        //chek if user is active
        if (user.status === config_1.default.status[0]) {
            console.log(`Signin failed: User '${email}' is deactivated`);
            throw new Error(config_1.default.error.errordeactivate);
        }
        //check if password match
        const isMatch = yield (0, otherservices_1.isValidPassword)(password, user.password);
        if (!isMatch) {
            console.log(`Signin failed: Password mismatch for user '${email}'`);
            throw new Error(config_1.default.error.errorpasswordmismatch);
        }
        console.log(`Signin successful for user '${email}'`);
        //respond with token
        var queryresult = (0, otherservices_1.sendTokenResponse)(user);
        res.status(200).json({ queryresult, status: true, requirepasswordchange });
    }
    catch (error) {
        console.error("Signin Exception:", error.message || error);
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.signin = signin;
//signup users 
var signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //get token from header
        const { email, firstName, title, staffId, lastName, country, state, city, address, age, dateOfBirth, gender, licence, phoneNumber, role, degree, profession, employmentStatus, nativeSpokenLanguage, otherLanguage, readWriteLanguage, clinic, zip, specializationDetails } = req.body;
        //get role id
        var roleId = (config_1.default.roles).filter((e) => e.role == role)[0].roleId;
        req.body.roleId = roleId;
        (0, otherservices_1.validateinputfaulsyvalue)({ email, firstName, staffId, lastName, gender, role, clinic });
        const foundUser = yield (0, users_1.readone)({ $or: [{ email }, { phoneNumber }] });
        if (foundUser) {
            throw new Error(`User with this email or phonenumber  ${config_1.default.error.erroralreadyexit}`);
        }
        req.body.password = config_1.default.defaultPassword;
        //other validations
        const queryresult = yield (0, users_1.createuser)(req.body);
        //const message = `Your account creation on Gotruck APP is successful. \n Login Email: ${email} \n Portal Link: https://google.com/ \n Default-Password: truck \n Please Login and change your Password`;
        //await mail(email, "Account Registration Confrimation", message);
        res.status(200).json({ queryresult, status: true });
    }
    catch (error) {
        res.status(403).json({ status: false, msg: error.message });
    }
});
exports.signup = signup;
//settings
function settings(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //const {clinicdetails} = await readallclinics({},{"clinic":1, "id":1,"_id":0});
            //console.log("clinic", clinicdetails);
            var settings = yield config_1.default.settings();
            console.log(settings);
            res.status(200).json(Object.assign(Object.assign({}, settings), { status: true }));
        }
        catch (e) {
            res.json({ status: false, msg: e.message });
        }
    });
}
