import { AnyARecord } from "dns";
import { readwardaggregate, readclinicaggregate, readpaymentaggregate, readhmoaggregate } from "../../dao/reports";
import configuration from "../../config";
export const settings = async function () {
    try {
        const clinic: any = [

            {
                $group: {
                    _id: "$clinic",  // Group by 'userId'

                }
            },
            {
                $project: {
                    clinic: "$_id",  // Rename _id to userId
                    _id: 0           // Exclude _id
                }
            }


        ];
        const ward = [
            {
                $group: {
                    _id: "$wardname",  // Group by 'userId'

                }
            },
            {
                $project: {
                    wardname: "$_id",  // Rename _id to userId
                    _id: 0           // Exclude _id
                }
            }

        ];
        const wards = await readwardaggregate(ward);
        const clinics = await readclinicaggregate(clinic);
        const wardNames = wards.map(ward => ward.wardname);
        const clinicNames = clinics.map(clinicname => clinicname.clinic);
        //search pharmacy and spread the array
        const query = { type: configuration.clinictype[2] };
        const pharmacyselection: any = [
            {
                $match: query
            },

            {
                $group: {
                    _id: "$clinic",  // Group by 'userId'

                }
            },
            {
                $project: {
                    clinic: "$_id",  // Rename _id to userId
                    _id: 0           // Exclude _id
                }
            }


        ];
        const pharmacy = await readclinicaggregate(pharmacyselection);
        const pharmacyNames = pharmacy.map((clinicname: any) => clinicname.clinic);
        //get all hmos
        const hmoselection: any = [
            {
                $group: {
                    _id: "$hmoname",  // Group by 'userId'


                }
            },
            {
                $project: {
                    hmoname: "$_id",  // Rename _id to userId
                    _id: 0           // Exclude _id
                }
            }


        ];
        const hmo = await readhmoaggregate(hmoselection);
        const hmoNames = hmo.map((hmoname: any) => hmoname.hmoname);
        console.log(hmoNames);

        //console.log(check2);
        const reports = [
            { querytype: "financialreport", querygroup: ["Appointment", "Lab", "Patient Registration", "Radiology", "Procedure", ...pharmacyNames] },
            { querytype: "outpatientregister", querygroup: ["All", ...clinicNames] },
            { querytype: "inpatientregister", querygroup: ["All", ...wardNames] },

            { querytype: "hmolabreport", querygroup: hmoNames },
            { querytype: "hmoreportforprocedure", querygroup: hmoNames },
            { querytype: "hmoreportforpharmacy", querygroup: hmoNames },
            { querytype: "hmoappointmentreport", querygroup: hmoNames },
            { querytype: "hmoradiologyreport", querygroup: hmoNames },

            { querytype: "secondaryservicereport", querygroup: ["Appointment", "Lab", "Radiology", "Procedure", "All", ...pharmacyNames] },
            { querytype: "generalattendance", querygroup: ["All", ...clinicNames] }
            // {querytype:"Nutrition",querygroup:[ "Number Of patient Deworked", "Number of Patient Growing Well"]},


        ];
        const summary = ["financialaggregate", "cashieraggregate", "appointmentaggregate", "admissionaggregate", "procedureaggregate", "clinicalaggregate", "hmoaggregate", "nutritionaggregate", "generalattendanceaggregate"];
        return { reports, summary };
    }
    catch (error: any) {
        console.log("error", error);
        throw new Error(error.message);
    }

}


export async function settingsresponse(req: Request, res: any) {
    try {
        //const {clinicdetails} = await readallclinics({},{"clinic":1, "id":1,"_id":0});
        //console.log("clinic", clinicdetails);
        var setting: any = await settings();
        res.status(200).json({
            querygroupsettings: setting.reports,
            status: true
        });

    }
    catch (e: any) {
        res.json({ status: false, msg: e.message });

    }

}
export async function settingsummaryresponse(req: Request, res: any) {
    try {
        //const {clinicdetails} = await readallclinics({},{"clinic":1, "id":1,"_id":0});
        //console.log("clinic", clinicdetails);
        var setting: any = await settings();
        res.status(200).json({
            querygroupsettings: setting.summary,
            status: true
        });

    }
    catch (e: any) {
        res.json({ status: false, msg: e.message });

    }

}
export async function cashiersettings(req: any, res: any) {
    try {
        const cashieraggregatependingpaid = [
            {

                $match: { cashieremail: { $ne: null } }

            },

            {
                $group: {
                    _id: "$cashieremail",                // Group by product

                }
            },
            {
                $project: {
                    cashieremail: "$_id",
                    _id: 0

                }

            }

        ];
        readpaymentaggregate
        var queryresult: any = await readpaymentaggregate(cashieraggregatependingpaid);
        res.status(200).json({
            queryresult,
            status: true
        });


    }
    catch (e: any) {
        res.json({ status: false, msg: e.message });


    }

}