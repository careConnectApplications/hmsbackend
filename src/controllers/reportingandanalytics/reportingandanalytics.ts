
import configuration from "../../config";
import { readpaymentaggregate, readappointmentaggregate, readadmissionaggregate, readprocedureaggregate, readradiologyaggregate, readlabaggregate, readprescriptionaggregate, readpatientsmanagementaggregate, readnutritionaggregate } from "../../dao/reports";
import { readallpayment } from "../../dao/payment";
import { settings } from "../settings/settings";
import moment from "moment";

function buildGeneralAttendanceTable(appointments: any[]) {
  const counts: Record<string, { male: number; female: number; total: number }> = {
    "0-28d": { male: 0, female: 0, total: 0 },
    "1-11m": { male: 0, female: 0, total: 0 },
    "1-4y": { male: 0, female: 0, total: 0 },
    "5-9y": { male: 0, female: 0, total: 0 },
    "10-19y": { male: 0, female: 0, total: 0 },
    "20y+": { male: 0, female: 0, total: 0 },
  };

  let grandMale = 0;
  let grandFemale = 0;
  let grandTotal = 0;

  appointments.forEach((item: any) => {
    const patientObj = item.patient || {};
    const genderStr = (patientObj.gender || item.gender || "").toString().trim().toLowerCase();
    const isMale = genderStr.startsWith("m");
    const isFemale = genderStr.startsWith("f");

    const appDate = item.appointmentdate ? moment(item.appointmentdate) : moment();
    const dob = patientObj.dateOfBirth || item.dateOfBirth;

    let ageInDays: number | null = null;
    let ageInMonths: number | null = null;
    let ageInYears: number | null = null;

    if (dob) {
      const dobMoment = moment(dob, ["YYYY-MM-DD", "DD/MM/YYYY", "YYYY/MM/DD", moment.ISO_8601]);
      if (dobMoment.isValid()) {
        ageInDays = appDate.diff(dobMoment, "days");
        ageInMonths = appDate.diff(dobMoment, "months");
        ageInYears = appDate.diff(dobMoment, "years");
      }
    }

    if (ageInYears === null && (patientObj.age || item.age)) {
      const parsedAge = parseInt((patientObj.age || item.age).toString(), 10);
      if (!isNaN(parsedAge)) {
        ageInYears = parsedAge;
      }
    }

    let catKey = "";
    if (ageInDays !== null && ageInDays >= 0 && ageInDays <= 28) {
      catKey = "0-28d";
    } else if (ageInMonths !== null && ageInMonths >= 0 && ageInMonths <= 11) {
      catKey = "1-11m";
    } else if (ageInYears !== null) {
      if (ageInYears >= 1 && ageInYears <= 4) {
        catKey = "1-4y";
      } else if (ageInYears >= 5 && ageInYears <= 9) {
        catKey = "5-9y";
      } else if (ageInYears >= 10 && ageInYears <= 19) {
        catKey = "10-19y";
      } else if (ageInYears >= 20) {
        catKey = "20y+";
      }
    }

    if (catKey && counts[catKey]) {
      if (isMale) {
        counts[catKey].male++;
        grandMale++;
      } else if (isFemale) {
        counts[catKey].female++;
        grandFemale++;
      }
      counts[catKey].total++;
      grandTotal++;
    }
  });

  const table = [
    { ageGroup: "0-28d", M: counts["0-28d"].male, F: counts["0-28d"].female, male: counts["0-28d"].male, female: counts["0-28d"].female, total: counts["0-28d"].total, TOTAL: counts["0-28d"].total },
    { ageGroup: "1-11m", M: counts["1-11m"].male, F: counts["1-11m"].female, male: counts["1-11m"].male, female: counts["1-11m"].female, total: counts["1-11m"].total, TOTAL: counts["1-11m"].total },
    { ageGroup: "1-4y", M: counts["1-4y"].male, F: counts["1-4y"].female, male: counts["1-4y"].male, female: counts["1-4y"].female, total: counts["1-4y"].total, TOTAL: counts["1-4y"].total },
    { ageGroup: "5-9y", M: counts["5-9y"].male, F: counts["5-9y"].female, male: counts["5-9y"].male, female: counts["5-9y"].female, total: counts["5-9y"].total, TOTAL: counts["5-9y"].total },
    { ageGroup: "10-19y", M: counts["10-19y"].male, F: counts["10-19y"].female, male: counts["10-19y"].male, female: counts["10-19y"].female, total: counts["10-19y"].total, TOTAL: counts["10-19y"].total },
    { ageGroup: "20y+", M: counts["20y+"].male, F: counts["20y+"].female, male: counts["20y+"].male, female: counts["20y+"].female, total: counts["20y+"].total, TOTAL: counts["20y+"].total },
    { ageGroup: "TOTAL", M: grandMale, F: grandFemale, male: grandMale, female: grandFemale, total: grandTotal, TOTAL: grandTotal }
  ];

  return table;
}

export const reports = async (req: any, res: any) => {
  try {

    //paymentcategory
    //cashieremail
    var { querygroup, querytype, startdate, enddate }: any = req.params;
    if (!querygroup) {
      throw new Error(`querygroup ${configuration.error.errorisrequired}`);
    }

    if (!startdate || !enddate) {
      var todaydate = new Date();
      enddate = todaydate;
      startdate = new Date(
        todaydate.getFullYear(),
        todaydate.getMonth() - 6,
        todaydate.getDate()
      );
    } else {
      // Parse as UTC midnight/end-of-day so server timezone has no effect
      const [sy, sm, sd] = String(startdate).split('-').map(Number);
      const [ey, em, ed] = String(enddate).split('-').map(Number);
      startdate = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0, 0));
      enddate   = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 59, 999));
      if (startdate > enddate) {
        const temp = startdate;
        startdate = enddate;
        enddate = temp;
      }
    }

    const financialMatch = (querygroup && querygroup !== "All") ? { paymentcategory: querygroup } : {};
    const reportbyfinancialreport = [
      {
        $match: {
          $and: [
            financialMatch,
            { updatedAt: { $gt: startdate, $lt: enddate } }
          ]
        }
      },
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      }
    ];

    //admission
    //referedward
    //status

    //appointment
    //clinic

    /*
    patient: {
          type: Schema.Types.ObjectId,
          ref: "Patientsmanagement",
          default: null,
        },
    
        referedward:
      {
        type: Schema.Types.ObjectId,
        ref: "Wardmanagement",
        default: null,
      },
    */

    const wardMatch = (querygroup && querygroup !== "All") ? { "referedward.wardname": querygroup } : {};

    const reportbyadmissionreport = [
      {
        $match: {
          referddate: { $gte: startdate, $lte: enddate }
        }
      },
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "wardmanagements",
          localField: "referedward",
          foreignField: "_id",
          as: "referedward",
        },
      },
      {
        $unwind: {
          path: "$referedward",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: wardMatch
      },
      {
        $project: {
          wardName: { $ifNull: ["$referedward.wardname", "Unassigned Ward"] },
          referddate: 1,
          patientSurname: "$patient.lastName",
          patientFirstName: "$patient.firstName",
          patientNumber: "$patient.MRN",
          sex: "$patient.gender",
          age: "$patient.age",
          alldiagnosis: 1,
          dischargereason: 1,
          dischargedate: 1,
          status: 1,
          patient: 1,
          referedward: 1,
          doctorname: 1,
          staffname: 1,
          admissionid: 1,
          admittospecialization: 1,
          appointment: 1
        }
      },
      {
        $sort: { wardName: 1, referddate: 1 }
      },
      {
        $lookup: {
          from: "labs",
          let: { patientId: "$patient._id", apptId: "$appointment" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$patient", "$$patientId"] },
                    { $eq: ["$appointment", "$$apptId"] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                testresult: 1
              }
            }
          ],
          as: "labDetails",
        },
      },
      {
        $lookup: {
          from: "prescriptions",
          let: { patientId: "$patient._id", apptId: "$appointment" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$patient", "$$patientId"] },
                    { $eq: ["$appointment", "$$apptId"] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                prescription: 1,
                dosage: 1,
                frequency: 1,
                duration: 1,
                qty: 1,
                dispensestatus: 1,
                servedstatus: 1
              }
            }
          ],
          as: "prescriptionDetails",
        },
      }
    ];

    const appointmentMatch: any = { appointmentdate: { $gte: startdate, $lte: enddate } };
    if (querygroup && querygroup !== "All") {
      appointmentMatch.clinic = querygroup;
    }

    const reportbyappointmentreport = [
      {
        $match: appointmentMatch
      },
      {
        $sort: { appointmentdate: 1 }
      },
      {
        $project: {
          appointmentdate: 1,
          appointmenttype: 1,
          clinic: 1,
          patient: 1,
          reason: 1,
          diagnosis: 1,
          lab: 1,
          prescription: 1,
          clinicalencounter: 1,
          encounter: 1,
          lastName: 1,
          firstName: 1,
          MRN: 1
        }
      },
      {
        $lookup: {
          from: "patientsmanagements",
          let: { patientId: "$patient" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$patientId"] }
              }
            },
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                MRN: 1,
                gender: 1,
                age: 1
              }
            }
          ],
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "labs",
          let: { labId: "$lab", apptId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$labId"] },
                    { $eq: ["$appointment", "$$apptId"] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                testresult: 1
              }
            }
          ],
          as: "labDetails",
        },
      },
      {
        $lookup: {
          from: "prescriptions",
          let: { rxIds: { $ifNull: ["$prescription", []] }, apptId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $in: ["$_id", "$$rxIds"] },
                    { $eq: ["$appointment", "$$apptId"] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                prescription: 1,
                dosage: 1,
                frequency: 1,
                duration: 1,
                qty: 1,
                dispensestatus: 1,
                servedstatus: 1
              }
            }
          ],
          as: "prescriptionDetails",
        },
      }
    ];

    const reportbyhmoreport = [
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $match: {
          $and: [{ "patient.HMOName": querygroup }, {
            createdAt: { $gt: startdate, $lt: enddate }
          }]
        }
      },
    ];
    const appointmentreportbyhmoreport = [
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $match: {
          $and: [{ "patient.HMOName": querygroup }, {
            appointmentdate: { $gt: startdate, $lt: enddate }
          }]
        }
      },
    ];
    const secondaryservice = [
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $match: { $and: [{ "patient.patienttype": configuration.patienttype[1] }, { createdAt: { $gt: startdate, $lt: enddate } }] }
      },
      {
        $addFields: {
          servicetype: {
            $ifNull: ["$testname", "$appointmenttype"]
          }
        }
      },
      {
        $project: {
          servicetype: 1,
          patient: 1

        }
      }

    ];
    const proceduresecondaryservice = [
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $match: { $and: [{ "patient.patienttype": configuration.patienttype[1] }, { createdAt: { $gt: startdate, $lt: enddate } }] }
      }
      ,
      {
        $addFields: {
          servicetype: {
            $reduce: {
              input: { $ifNull: ["$procedure", []] },
              initialValue: "",
              in: {
                $cond: {
                  if: { $eq: ["$$value", ""] },
                  then: "$$this",
                  else: { $concat: ["$$value", ",", "$$this"] }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          servicetype: 1,
          patient: 1

        }
      }


    ];

    const patientsecondaryservice = [

      {
        $match: { $and: [{ patienttype: configuration.patienttype[1] }, { createdAt: { $gt: startdate, $lt: enddate } }] }
      }

    ];
    const pharmacysecondaryservice = [
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $match: { $and: [{ pharmacy: querygroup }, { "patient.patienttype": configuration.patienttype[1] }, { createdAt: { $gt: startdate, $lt: enddate } }] }
      },
      {
        $addFields: {
          servicetype: "$prescription"
        }
      },
      {
        $project: {
          servicetype: 1,
          patient: 1

        }
      }

    ];


    var queryresult: any;

    //var c = await configuration.settings2();


    let { reports }: any = await settings();
    //Financial report
    if (querytype == reports[0].querytype) {

      queryresult = await readpaymentaggregate(reportbyfinancialreport);
    }
    else if (querytype == reports[1].querytype || querytype == "outpatientregister" || querytype == "outpatient register" || querytype == "appointmentreport") {
      const rawAppointments: any = await readappointmentaggregate(reportbyappointmentreport);

      queryresult = rawAppointments.map((item: any, index: number) => {
        const patientObj = item.patient || {};
        const surname = patientObj.lastName || item.lastName || '';
        const firstname = patientObj.firstName || item.firstName || '';
        const fullName = `${surname} ${firstname}`.trim();

        const attendanceType = item.appointmenttype || "";

        let complaint = "";
        if (item.clinicalencounter?.clinicalnote && Array.isArray(item.clinicalencounter.clinicalnote) && item.clinicalencounter.clinicalnote.length > 0) {
          complaint = item.clinicalencounter.clinicalnote.filter(Boolean).join(", ");
        }
        if (!complaint) {
          complaint = (item.encounter?.history?.presentingcomplaints)
            || item.reason
            || (item.encounter?.presentingcomplaint)
            || "";
        }

        let diagnosisStr = "";
        if (item.clinicalencounter?.diagnosisicd10 && Array.isArray(item.clinicalencounter.diagnosisicd10) && item.clinicalencounter.diagnosisicd10.length > 0) {
          diagnosisStr = item.clinicalencounter.diagnosisicd10.filter(Boolean).join(", ");
        }
        if (!diagnosisStr && item.diagnosis) {
          diagnosisStr = item.diagnosis;
        }
        if (!diagnosisStr && item.encounter?.assessmentdiagnosis?.diagosis) {
          diagnosisStr = item.encounter.assessmentdiagnosis.diagosis;
        }
        if (!diagnosisStr && item.clinicalencounter?.diagnosisnote && Array.isArray(item.clinicalencounter.diagnosisnote) && item.clinicalencounter.diagnosisnote.length > 0) {
          diagnosisStr = item.clinicalencounter.diagnosisnote.filter(Boolean).join(", ");
        }

        let labStr = "";
        if (item.labDetails && Array.isArray(item.labDetails) && item.labDetails.length > 0) {
          const resultsList: string[] = [];
          let labSn = 1;
          item.labDetails.forEach((lab: any) => {
            if (lab.testresult && Array.isArray(lab.testresult) && lab.testresult.length > 0) {
              lab.testresult.forEach((tr: any) => {
                if (tr && (tr.result || tr.subcomponent)) {
                  const subcomp = tr.subcomponent || "";
                  const res = tr.result || "";
                  const rangesStr = tr.nranges || "";
                  const unitStr = tr.unit || "";

                  const parts = [subcomp, res, rangesStr, unitStr].filter(Boolean);
                  const formattedStr = parts.join(", ");
                  if (formattedStr) {
                    resultsList.push(`${labSn}. ${formattedStr}`);
                    labSn++;
                  }
                }
              });
            }
          });
          labStr = resultsList.join(", ");
        }

        let drugsGivenStr = "";
        if (item.prescriptionDetails && Array.isArray(item.prescriptionDetails) && item.prescriptionDetails.length > 0) {
          const drugList: string[] = [];
          item.prescriptionDetails.forEach((rx: any) => {
            if (rx) {
              const drugName = rx.prescription || rx.drugname || rx.name || "";
              if (drugName) {
                const parts = [drugName, rx.dosage, rx.frequency, rx.duration].filter(Boolean);
                drugList.push(parts.join(" "));
              }
            }
          });
          if (drugList.length > 0) {
            drugsGivenStr = drugList.join(", ");
          }
        }

        return {
          ...item,
          patient: patientObj,
          sn: index + 1,
          date: item.appointmentdate,
          nameOfPt: fullName,
          patientName: fullName,
          ptNumber: patientObj.MRN || item.MRN || "",
          patientNumber: patientObj.MRN || item.MRN || "",
          sex: patientObj.gender || "",
          age: patientObj.age || "",
          typeOfAttendance: attendanceType,
          presentingComplaint: complaint,
          diagnosis: diagnosisStr,
          labinvestigation: labStr,
          drugsGiven: drugsGivenStr
        };
      });
    }
    else if (querytype == reports[2].querytype || querytype == "inpatientregister" || querytype == "inpatient register" || querytype == "admissionreport") {
      const rawAdmissions: any = await readadmissionaggregate(reportbyadmissionreport);

      queryresult = rawAdmissions.map((item: any, index: number) => {
        const diagnosisList = item.alldiagnosis && Array.isArray(item.alldiagnosis)
          ? item.alldiagnosis.map((d: any) => d.diagnosis || d.note).filter(Boolean).join(", ")
          : "";

        const reason = (item.dischargereason || "").toUpperCase();
        const dischargeDateStr = item.dischargedate ? item.dischargedate : null;
        const patientObj = item.patient || {};

        let labStr = "";
        if (item.labDetails && Array.isArray(item.labDetails) && item.labDetails.length > 0) {
          const resultsList: string[] = [];
          let labSn = 1;
          item.labDetails.forEach((lab: any) => {
            if (lab.testresult && Array.isArray(lab.testresult) && lab.testresult.length > 0) {
              lab.testresult.forEach((tr: any) => {
                if (tr && (tr.result || tr.subcomponent)) {
                  const subcomp = tr.subcomponent || "";
                  const res = tr.result || "";
                  const rangesStr = tr.nranges || "";
                  const unitStr = tr.unit || "";

                  const parts = [subcomp, res, rangesStr, unitStr].filter(Boolean);
                  const formattedStr = parts.join(", ");
                  if (formattedStr) {
                    resultsList.push(`${labSn}. ${formattedStr}`);
                    labSn++;
                  }
                }
              });
            }
          });
          labStr = resultsList.join(", ");
        }

        let drugsGivenStr = "";
        if (item.prescriptionDetails && Array.isArray(item.prescriptionDetails) && item.prescriptionDetails.length > 0) {
          const drugList: string[] = [];
          item.prescriptionDetails.forEach((rx: any) => {
            if (rx) {
              const statusStr = (rx.dispensestatus || "").toString().trim().toLowerCase();
              if (statusStr.includes("complete")) {
                const drugName = rx.prescription || rx.drugname || rx.name || "";
                if (drugName) {
                  const parts = [drugName, rx.dosage, rx.frequency, rx.duration].filter(Boolean);
                  drugList.push(parts.join(" "));
                }
              }
            }
          });
          if (drugList.length > 0) {
            drugsGivenStr = drugList.join(", ");
          }
        }

        const dateOfDischarge = item.dischargedate || null;

        return {
          ...item,
          patient: patientObj,
          sn: index + 1,
          wardName: item.wardName || "Unassigned Ward",
          dateOfAdmission: item.referddate,
          dateOfDischarge: dateOfDischarge,
          patientName: `${patientObj.lastName || item.patientSurname || ''} ${patientObj.firstName || item.patientFirstName || ''}`.trim(),
          patientNumber: patientObj.MRN || item.patientNumber || "",
          sex: patientObj.gender || item.sex || "",
          age: patientObj.age || item.age || "",
          diagnosis: diagnosisList,
          labinvestigation: labStr,
          drugsGiven: drugsGivenStr,
          admissionOutcome: {
            abs: reason.includes("ABS") ? dischargeDateStr : null,
            disch: reason.includes("DISCH") ? dischargeDateStr : null,
            ref: reason.includes("REF") ? dischargeDateStr : null,
            lama: reason.includes("LAMA") ? dischargeDateStr : null,
            death: (reason.includes("DEATH") || reason.includes("DEAD")) ? dischargeDateStr : null
          }
        };
      });
    }
    else if (querytype == reports[3].querytype) {
      queryresult = await readlabaggregate(reportbyhmoreport);

    }
    else if (querytype == reports[4].querytype) {
      queryresult = await readprocedureaggregate(reportbyhmoreport);

    }
    else if (querytype == reports[5].querytype) {
      queryresult = await readprescriptionaggregate(reportbyhmoreport);

    }
    else if (querytype == reports[6].querytype) {
      queryresult = await readappointmentaggregate(appointmentreportbyhmoreport);

    }
    else if (querytype == reports[7].querytype) {
      queryresult = await readradiologyaggregate(reportbyhmoreport);

    }
    else if (querytype == reports[8].querytype && querygroup == reports[8].querygroup[0]) {
      //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
      queryresult = await readappointmentaggregate(secondaryservice);

    }
    else if (querytype == reports[8].querytype && querygroup == reports[8].querygroup[1]) {
      //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
      queryresult = await readlabaggregate(secondaryservice);

    }
    /*
    else if(querytype == reports[8].querytype && querygroup ==reports[8].querygroup[2]){
      //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
      queryresult= await readpatientsmanagementaggregate(patientsecondaryservice);
    
    }
      */
    else if (querytype == reports[8].querytype && querygroup == reports[8].querygroup[2]) {
      //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
      queryresult = await readradiologyaggregate(secondaryservice);

    }
    else if (querytype == reports[8].querytype && querygroup == reports[8].querygroup[3]) {
      //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
      queryresult = await readprocedureaggregate(proceduresecondaryservice);

    }
    else if (querytype == reports[8].querytype && querygroup == reports[8].querygroup[4]) {

      const [result1, result2, result3] = await Promise.all([
        readprocedureaggregate(proceduresecondaryservice),
        readradiologyaggregate(secondaryservice),
        readlabaggregate(secondaryservice),
        readappointmentaggregate(secondaryservice)
      ]);

      queryresult = [...result1, ...result2, ...result3];

      //queryresult= await readprocedureaggregate(proceduresecondaryservice);

    }

    else if (querytype == reports[8].querytype) {
      //querygroup:[ "Appointment", "Lab","Patient Registration","Radiology","Procedure",...pharmacyNames]
      queryresult = await readprescriptionaggregate(pharmacysecondaryservice);

    }
    else if (querytype == "generalattendance" || querytype == "general attendance" || querytype == "generalattendanceaggregate" || (reports[9] && querytype == reports[9].querytype)) {
      const rawAppointments: any = await readappointmentaggregate(reportbyappointmentreport);

      const table = buildGeneralAttendanceTable(rawAppointments);
      const byUnit: Record<string, any[]> = {};

      if (!querygroup || querygroup === "All") {
        const grouped: Record<string, any[]> = {};
        rawAppointments.forEach((item: any) => {
          const unit = item.clinic || "Unassigned";
          if (!grouped[unit]) grouped[unit] = [];
          grouped[unit].push(item);
        });
        Object.keys(grouped).forEach((unit) => {
          byUnit[unit] = buildGeneralAttendanceTable(grouped[unit]);
        });
      }

      queryresult = Object.assign(table, {
        unit: querygroup || "All",
        table: table,
        byUnit: byUnit
      });
    }
    else {
      throw new Error(`querytype ${configuration.error.errorisrequired}`);
    }
    res.json({ queryresult, status: true });


  }
  catch (e: any) {
    console.log(e.message);
    res.json({ status: false, msg: e.message });

  }

}
// cashier reconcillation
export const cashierreport = async (req: any, res: any) => {
  try {

    //find cashier with status
    //paymentcategory
    //cashieremail
    var { startdate, enddate, email }: any = req.params;
    if (!startdate || !enddate) {
      var todaydate = new Date();
      enddate = todaydate;
      startdate = new Date(
        todaydate.getFullYear(),
        todaydate.getMonth(),
        todaydate.getDate()
      );
    } else {
      // Parse as UTC midnight/end-of-day so server timezone has no effect
      const [sy, sm, sd] = String(startdate).split('-').map(Number);
      const [ey, em, ed] = String(enddate).split('-').map(Number);
      startdate = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0, 0));
      enddate   = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 59, 999));
      if (startdate > enddate) {
        const temp = startdate;
        startdate = enddate;
        enddate = temp;
      }
    }


    var query = { cashieremail: email, status: configuration.status[3], updatedAt: { $gte: startdate, $lte: enddate } };
    var populatequery = 'patient';
    const cashieraggregatependingpaid = [
      {

        $match: { $and: [{ status: configuration.status[3] }, { cashieremail: email }, { updatedAt: { $gte: startdate, $lte: enddate } }] }

      },
      {
        $group: {
          _id: "$cashieremail",                // Group by product
          totalAmount: { $sum: "$amount" },
          cashierid: { $first: "$cashierid" }
        }
      },
      {
        $project: {
          cashieremail: "$_id",
          totalAmount: 1,
          cashierid: 1,
          status: configuration.status[3],
          _id: 0

        }

      }

    ];
    const queryresult = { paymentrecords: (await readallpayment(query, populatequery)).paymentdetails, paymentsummary: await readpaymentaggregate(cashieraggregatependingpaid) };

    res.json({
      queryresult,
      status: true,
    });


    //return total  
  }
  catch (e: any) {
    res.json({ status: false, msg: e.message });

  }

}
//report summary
export const reportsummary = async (req: any, res: any) => {
  try {
    console.log("////////////////////////");
    var { querytype, startdate, enddate }: any = req.params;
    if (!startdate || !enddate) {
      var todaydate = new Date();
      enddate = todaydate;
      startdate = new Date(
        todaydate.getFullYear(),
        todaydate.getMonth(),
        todaydate.getDate()
      );
    } else {
      // Parse as UTC midnight/end-of-day so server timezone has no effect
      const [sy, sm, sd] = String(startdate).split('-').map(Number);
      const [ey, em, ed] = String(enddate).split('-').map(Number);
      startdate = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0, 0));
      enddate   = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 59, 999));
      if (startdate > enddate) {
        const temp = startdate;
        startdate = enddate;
        enddate = temp;
      }
    }

    let { summary }: any = await settings();
    const financialaggregatepaid = [
      {
        $match: { $and: [{ status: configuration.status[3] }, { updatedAt: { $gte: startdate, $lte: enddate } }] }
      },
      {
        $group: {
          _id: "$paymentcategory",                // Group by product
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          paymentcategory: "$_id",
          totalAmount: 1,
          status: configuration.status[3],
          _id: 0

        }

      }

    ];
    const financialaggregategrandtotalpaid = [
      {

        $match: { $and: [{ status: configuration.status[3] }, { updatedAt: { $gte: startdate, $lte: enddate } }] }
      },
      {
        $group: {
          _id: null,                // Group by product
          grandtotalAmount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          grandtotalAmount: 1,
          _id: 0

        }

      }

    ];
    const financialaggregatependingpaid = [
      {

        $match: { $and: [{ status: configuration.status[2] }, { updatedAt: { $gte: startdate, $lte: enddate } }] }

      },
      {
        $group: {
          _id: "$paymentcategory",                // Group by product
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          paymentcategory: "$_id",
          totalAmount: 1,
          status: configuration.status[2],
          _id: 0

        }

      }

    ];
    const cashieraggregatepaid = [
      {

        $match: { $and: [{ status: configuration.status[3] }, { updatedAt: { $gte: startdate, $lte: enddate } }] }

      },
      /*
      {
          $group: {
            _id: "$userId",
            emails: {
              $push: {
                $cond: [{ $ne: ["$email", null] }, "$email", "$$REMOVE"]
              }
            }
          }
        },
        {
          $addFields: {
            firstNonNullEmail: { $arrayElemAt: ["$emails", 0] }
          }
        },
        {
          $project: { emails: 0 }
        }
      */
      {
        $group: {
          _id: "$cashieremail",                // Group by product
          totalAmount: { $sum: "$amount" },
          cashierid: { $first: "$cashierid" },
          tempcashiername: {
            $push: {
              $cond: [{ $ne: ["$cashiername", null] }, "$cashiername", "$$REMOVE"]
            }
          },

          //cashiername:{$first:"$cashiername"}
        }
      },
      {
        $addFields: {
          cashiername: { $arrayElemAt: ["$tempcashiername", 0] }
        }
      },
      {
        $project: {
          cashieremail: "$_id",
          cashiername: 1,
          totalAmount: 1,
          cashierid: 1,
          status: configuration.status[3],
          _id: 0

        }

      }

    ];
    const cashieraggregatepaidgrandtotal = [
      {

        $match: { $and: [{ status: configuration.status[3] }, { updatedAt: { $gte: startdate, $lte: enddate } }] }

      },
      {
        $group: {
          _id: null,                // Group by product
          grandtotalAmount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          grandtotalAmount: 1,
          _id: 0

        }

      }

    ];
    //5 , 6 ,9
    const appointmentaggregatescheduled = [
      {

        $match: {
          $and: [{ status: configuration.status[5] }, {
            appointmentdate: { $gt: startdate, $lt: enddate }
          }]
        }

      },
      {
        $group: {
          _id: "$clinic",                // Group by product
          Numberofappointment: { $sum: 1 },
        }
      },
      {
        $project: {
          clinic: "$_id",
          Numberofappointment: 1,
          status: configuration.status[5],
          _id: 0

        }

      }

    ];
    const appointmentaggregatecomplete = [
      {

        $match: {
          $and: [{ status: configuration.status[6] }, {
            appointmentdate: { $gt: startdate, $lt: enddate }
          }]
        }

      },
      {
        $group: {
          _id: "$clinic",                // Group by product
          Numberofappointment: { $sum: 1 },
        }
      },
      {
        $project: {
          clinic: "$_id",
          Numberofappointment: 1,
          status: configuration.status[6],
          _id: 0

        }

      }

    ];
    const appointmentaggregateinprogress = [
      {

        $match: {
          $and: [{ status: configuration.status[9] }, {
            appointmentdate: { $gt: startdate, $lt: enddate }
          }]
        }

      },
      {
        $group: {
          _id: "$clinic",                // Group by product
          Numberofappointment: { $sum: 1 },
        }
      },
      {
        $project: {
          clinic: "$_id",
          Numberofappointment: 1,
          status: configuration.status[9],
          _id: 0

        }

      }

    ];

    const appointmentaggregatetotalnumberofappointments = [
      {

        $match: { $or: [{ status: configuration.status[5] }, { status: configuration.status[6] }, { status: configuration.status[9] }], appointmentdate: { $gt: startdate, $lt: enddate } }

      },
      {
        $group: {
          _id: null,                // Group by product
          GrandTotalNumberofappointment: { $sum: 1 },
        }
      },
      {
        $project: {
          GrandTotalNumberofappointment: 1,
          _id: 0

        }

      }

    ];

    //3,5,
    const admissionaggregateadmited = [
      {
        $lookup: {
          from: "wardmanagements",
          localField: "referedward",
          foreignField: "_id",
          as: "referedward",
        },
      },
      {
        $unwind: {
          path: "$referedward",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $match: { $and: [{ status: configuration.admissionstatus[1] }, { referddate: { $gt: startdate, $lt: enddate } }] }
      },
      {
        $group: {
          _id: "$referedward.wardname",                // Group by product
          Numberofadmission: { $sum: 1 },
        }
      },
      {
        $project: {
          wardname: "$_id",
          Numberofadmission: 1,
          status: configuration.admissionstatus[1],
          _id: 0

        }

      }

    ];
    const admissionaggregatetransfered = [
      {
        $lookup: {
          from: "wardmanagements",
          localField: "referedward",
          foreignField: "_id",
          as: "referedward",
        },
      },
      {
        $unwind: {
          path: "$referedward",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $match: { $and: [{ status: configuration.admissionstatus[3] }, { referddate: { $gt: startdate, $lt: enddate } }] }
      },
      {
        $group: {
          _id: "$referedward.wardname",                // Group by product
          Numberofadmission: { $sum: 1 },
        }
      },
      {
        $project: {
          wardname: "$_id",
          Numberofadmission: 1,
          status: configuration.admissionstatus[3],
          _id: 0

        }

      }

    ];
    const admissionaggregatedischarged = [
      {
        $lookup: {
          from: "wardmanagements",
          localField: "referedward",
          foreignField: "_id",
          as: "referedward",
        },
      },
      {
        $unwind: {
          path: "$referedward",
          preserveNullAndEmptyArrays: true
        }

      },

      {
        $match: { $and: [{ status: configuration.admissionstatus[5] }, { referddate: { $gt: startdate, $lt: enddate } }] }
      },
      {
        $group: {
          _id: "$referedward.wardname",                // Group by product
          Numberofadmission: { $sum: 1 },
        }
      },
      {
        $project: {
          wardname: "$_id",
          Numberofadmission: 1,
          status: configuration.admissionstatus[5],
          _id: 0

        }

      }

    ];
    const admissionaggregatetotalnumberofadmissions = [


      {
        $match: { $or: [{ status: configuration.admissionstatus[1] }, { status: configuration.admissionstatus[3] }, { status: configuration.admissionstatus[5] }], referddate: { $gt: startdate, $lt: enddate } }
      },
      {
        $group: {
          _id: null,                // Group by product
          TotalNumberofadmission: { $sum: 1 },
        }
      },
      {
        $project: {
          TotalNumberofadmission: 1,
          _id: 0

        }

      }

    ];
    //procedure aggregate
    //9, 7
    const procedureaggregatepaid = [
      {
        $lookup: {
          from: "payments",
          localField: "payment",
          foreignField: "_id",
          as: "payment",
        },
      },
      {
        $unwind: {
          path: "$payment",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $match: { "payment.status": configuration.status[3], createdAt: { $gt: startdate, $lt: enddate } }
      },


      {
        $group: {
          _id: "$clinic",                // Group by product
          Numberofprocedures: { $sum: 1 },
          totalAmount: { $sum: "$payment.amount" }
        }
      },
      {
        $project: {
          clinic: "$_id",
          Numberofprocedures: 1,
          totalAmount: 1,
          _id: 0

        }

      }


    ];
    const totalprocedureaggregate = [
      {
        $lookup: {
          from: "payments",
          localField: "payment",
          foreignField: "_id",
          as: "payment",
        },
      },
      {
        $unwind: {
          path: "$payment",
          preserveNullAndEmptyArrays: true
        }

      },



      {
        $match: { "payment.status": configuration.status[3], createdAt: { $gt: startdate, $lt: enddate } }
      },


      {
        $group: {
          _id: null,                // Group by product
          TotalNumberofprocedures: { $sum: 1 },
          GrandtotalAmount: { $sum: "$payment.amount" }
        }
      },
      {
        $project: {

          TotalNumberofprocedures: 1,
          GrandtotalAmount: 1,
          _id: 0

        }

      }


    ];
    //clinical aggregate
    const clinicalaggregate = [
      {

        $match: { appointmentdate: { $gt: startdate, $lt: enddate } }

      },
      {
        $group: {
          _id: {
            $ifNull: ["$clinicalencounter.diagnosisicd10", "No Diagnosis"]             // Group by product
          },
          Numberofappointment: { $sum: 1 },
        }
      },
      {
        $project: {
          diagnosis: "$_id",
          Numberofappointment: 1,
          _id: 0

        }

      }

    ];
    const aggregatebyhmo = [
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },

      {
        $match: {
          $and: [
            {
              "patient.isHMOCover": configuration.ishmo[1]

            },
            { createdAt: { $gt: startdate, $lt: enddate } }
          ]
        }
      },

      {
        $group: {
          _id: { $ifNull: ["$patient.HMOName", "HMO Not Found"] },
          //"$patient.HMOName",                // Group by product
          TotalNumber: { $sum: 1 },

        }
      },
      {
        $project: {
          HMOName: "$_id",
          TotalNumber: 1,
          _id: 0

        }

      }
    ];
    ///////procedure ////////
    const appointmentaggregatebyhmo = [
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },

      {
        $match: {
          $and: [
            {
              "patient.isHMOCover": configuration.ishmo[1]

            },
            { appointmentdate: { $gt: startdate, $lt: enddate } }
          ]
        }
      },

      {
        $group: {
          _id: { $ifNull: ["$patient.HMOName", "HMO Not Found"] },
          //"$patient.HMOName",                // Group by product
          TotalNumber: { $sum: 1 },

        }
      },
      {
        $project: {
          HMOName: "$_id",
          TotalNumber: 1,
          _id: 0

        }

      }
    ];

    const nutritionaggregatechildren0to59thatreceivednutirtion = [
      {

        $match: { createdAt: { $gt: startdate, $lt: enddate } }

      },
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $group: {
          _id: {
            ageinmonths: "$ageinmonths",
            typeofvisit: "$typeofvisit",
            gender: "$patient.gender"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Optional: sort descending by count
      },
      {
        $project: {
          parameters: "$_id",
          count: 1,
          _id: 0

        }
      }
    ];
    const nutritionaggregatechildren0to59growingwell = [
      {

        $match: { $and: [{ createdAt: { $gt: startdate, $lt: enddate } }, { growthaccordingtothechildhealthcard: configuration.growthaccordingtothechildhealthcard[0] }] }
        //growthaccordingtothechildhealthcard

      },
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $group: {
          _id: {
            gender: "$patient.gender"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Optional: sort descending by count
      },
      {
        $project: {
          parameters: "$_id",
          count: 1,
          _id: 0

        }
      }
    ];
    const nutritionaggregatechildren0to5exclusivebreadstfeeding = [
      {

        $match: { $and: [{ createdAt: { $gt: startdate, $lt: enddate } }, { infactandyoungchildfeeding: configuration.infactandyoungchildfeeding[0] }, { ageinmonths: configuration.ageinmonths[0] }] }


      },
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $group: {
          _id: {
            gender: "$patient.gender"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Optional: sort descending by count
      },
      {
        $project: {
          parameters: "$_id",
          count: 1,
          _id: 0

        }
      }
    ];
    const nutritionaggregatechildren0to59givenvitaminasupplement = [
      {

        $match: { $and: [{ createdAt: { $gt: startdate, $lt: enddate } }] }


      },
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $group: {
          _id: {
            gender: "$patient.gender",
            vitaminasupplement: "$vitaminasupplement"

          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Optional: sort descending by count
      },
      {
        $project: {
          parameters: "$_id",
          count: 1,
          _id: 0

        }
      }
    ];
    const nutritionaggregatechildren12to59receiveddeworming = [
      {

        $match: { $and: [{ createdAt: { $gt: startdate, $lt: enddate } }, { deworming: { $ne: null } }] }


      },
      {
        $lookup: {
          from: "patientsmanagements",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true
        }

      },
      {
        $group: {
          _id: {
            gender: "$patient.gender"

          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Optional: sort descending by count
      },
      {
        $project: {
          parameters: "$_id",
          count: 1,
          _id: 0

        }
      }
    ];
    //children12to59receiveddeworming

    //console.log("//////////", querytype);


    let queryresult: any;

    if (querytype == summary[0]) {
      //queryresult = {paid: await readpaymentaggregate(financialaggregatepaid), pendingpayment:await readpaymentaggregate(financialaggregatependingpaid)};
      queryresult = { paid: await readpaymentaggregate(financialaggregatepaid), grandtotal: await readpaymentaggregate(financialaggregategrandtotalpaid) };
    }
    else if (querytype == summary[1]) {
      //cashier summary
      queryresult = { paid: await readpaymentaggregate(cashieraggregatepaid), grandtotal: await readpaymentaggregate(cashieraggregatepaidgrandtotal) };
    }
    else if (querytype == summary[2]) {
      queryresult = { scheduled: await readappointmentaggregate(appointmentaggregatescheduled), complete: await readappointmentaggregate(appointmentaggregatecomplete), inprogress: await readappointmentaggregate(appointmentaggregateinprogress), totalnumberofappointments: await readappointmentaggregate(appointmentaggregatetotalnumberofappointments) };
      //appointmentaggregatetotalnumberofappointments
      //appointment summary
    }
    else if (querytype == summary[3]) {
      //wardadmission summary
      queryresult = { admited: await readadmissionaggregate(admissionaggregateadmited), transfered: await readadmissionaggregate(admissionaggregatetransfered), discharged: await readadmissionaggregate(admissionaggregatedischarged), totalnumberofadmissions: await readadmissionaggregate(admissionaggregatetotalnumberofadmissions) };
    }
    else if (querytype == summary[4]) {
      console.log("procedure");
      queryresult = { paid: await readprocedureaggregate(procedureaggregatepaid), grandtotal: await readprocedureaggregate(totalprocedureaggregate) }

    }
    else if (querytype == summary[5]) {
      //clinicalaggregate
      queryresult = { clinicalreport: await readappointmentaggregate(clinicalaggregate) };

    }
    else if (querytype == summary[6]) {
      //clinicalaggregate
      //"hmoappointmentaggregate","hmoradiologyreport"];

      queryresult = {
        hmolabsummary: await readlabaggregate(aggregatebyhmo),
        hmoproceduresummary: await readprocedureaggregate(aggregatebyhmo),
        hmopharmacysummary: await readprescriptionaggregate(aggregatebyhmo),
        hmoradiologysummary: await readradiologyaggregate(aggregatebyhmo),
        hmsappointmentsummary: await readappointmentaggregate(appointmentaggregatebyhmo)
      };

    }
    else if (querytype == summary[7]) {

      const [children0to59thatreceivednutirtion, children0to59growingwell, children0to5exclusivebreadstfeeding, children0to59givenvitaminasupplement, children12to59receiveddeworming] = await Promise.all([
        readnutritionaggregate(nutritionaggregatechildren0to59thatreceivednutirtion),
        readnutritionaggregate(nutritionaggregatechildren0to59growingwell),
        readnutritionaggregate(nutritionaggregatechildren0to5exclusivebreadstfeeding),
        readnutritionaggregate(nutritionaggregatechildren0to59givenvitaminasupplement),
        readnutritionaggregate(nutritionaggregatechildren12to59receiveddeworming)

      ]);
      queryresult = { children0to59thatreceivednutirtion, children0to59growingwell, children0to5exclusivebreadstfeeding, children0to59givenvitaminasupplement, children12to59receiveddeworming };

    }
    else if (querytype == summary[8] || querytype == "generalattendance" || querytype == "generalattendanceaggregate" || querytype == "general attendance") {
      const generalAttendanceMatch = [
        {
          $lookup: {
            from: "patientsmanagements",
            localField: "patient",
            foreignField: "_id",
            as: "patient",
          },
        },
        {
          $unwind: {
            path: "$patient",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            appointmentdate: { $gte: startdate, $lte: enddate }
          }
        }
      ];
      const rawAppointments: any = await readappointmentaggregate(generalAttendanceMatch);
      queryresult = buildGeneralAttendanceTable(rawAppointments);
    }
    else {
      throw new Error(`querytype ${configuration.error.errorisrequired}`);
    }


    res.json({ queryresult, status: true });



  }
  catch (e: any) {
    res.json({ status: false, msg: e.message });

  }
}


//add pharmacy 1 , pharmacy 2
//add agggreate appointbyicnd10