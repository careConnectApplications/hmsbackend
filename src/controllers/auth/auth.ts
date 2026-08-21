import configuration from "../../config";
import bcrypt from "bcryptjs";
import { readone, createuser, updateuser } from "../../dao/users";
import { readallclinics } from "../../dao/clinics";
import { isValidPassword, sendTokenResponse, mail, validateinputfaulsyvalue } from "../../utils/otherservices";


//sign in
export var signin = async (req: any, res: any) => {
    try {
        console.log("Signin attempt received:", { email: req.body?.email });
        //destructure email and password
        const { email, password } = req.body;
        var requirepasswordchange;
        if (password == configuration.defaultPassword) {
            requirepasswordchange = true;

        }
        else {
            requirepasswordchange = false;

        }

        //validate email and password
        if (!email || !password) {
            console.log("Signin validation failed: missing email or password");
            throw new Error(configuration.error.errornoemailpassword);
        }
        //find user

        console.log(`Searching database for user email: ${email}`);
        const user = await readone({ email });

        //check if user exit
        if (!user) {
            console.log(`Signin failed: User with email '${email}' not found`);
            throw new Error(configuration.error.errorinvaliduser);
        }

        console.log(`User found: ${user.email}, status: ${user.status}, role: ${user.role}`);

        //chek if user is active
        if (user.status === configuration.status[0]) {
            console.log(`Signin failed: User '${email}' is deactivated`);
            throw new Error(configuration.error.errordeactivate);

        }

        //check if password match
        const isMatch = await isValidPassword(password, user.password);
        if (!isMatch) {
            console.log(`Signin failed: Password mismatch for user '${email}'`);
            throw new Error(configuration.error.errorpasswordmismatch);
        }

        console.log(`Signin successful for user '${email}'`);
        //respond with token
        var queryresult = sendTokenResponse(user);
        res.status(200).json({ queryresult, status: true, requirepasswordchange });
    }
    catch (error: any) {
        console.error("Signin Exception:", error.message || error);
        res.status(403).json({ status: false, msg: error.message });

    }
}


//signup users 
export var signup = async (req: any, res: any) => {

    try {
        //get token from header
        const { email, firstName, title, staffId, lastName, country, state, city, address, age, dateOfBirth, gender, licence, phoneNumber, role, degree, profession, employmentStatus, nativeSpokenLanguage, otherLanguage, readWriteLanguage, clinic, zip, specializationDetails } = req.body;
        //get role id
        var roleId = (configuration.roles).filter((e: any) => e.role == role)[0].roleId;
        req.body.roleId = roleId;
        validateinputfaulsyvalue({ email, firstName, staffId, lastName, gender, role, clinic });
        const foundUser = await readone({ $or: [{ email }, { phoneNumber }] });
        if (foundUser) {
            throw new Error(`User with this email or phonenumber  ${configuration.error.erroralreadyexit}`);

        }

        req.body.password = configuration.defaultPassword;
        //other validations
        const queryresult = await createuser(req.body)
        //const message = `Your account creation on Gotruck APP is successful. \n Login Email: ${email} \n Portal Link: https://google.com/ \n Default-Password: truck \n Please Login and change your Password`;
        //await mail(email, "Account Registration Confrimation", message);
        res.status(200).json({ queryresult, status: true });


    } catch (error: any) {
        res.status(403).json({ status: false, msg: error.message });
    }
}

//settings
export async function settings(req: Request, res: any) {
    try {
        //const {clinicdetails} = await readallclinics({},{"clinic":1, "id":1,"_id":0});
        //console.log("clinic", clinicdetails);
        var settings = await configuration.settings();
        console.log(settings);
        res.status(200).json({
            ...settings,
            status: true
        });

    }
    catch (e: any) {
        res.json({ status: false, msg: e.message });

    }

}






