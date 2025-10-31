import { Schema, model } from "mongoose";
import configuration from "../config";

export interface appointinterface {
  appointmentid: String;
  patient:any,
  clinic:String,
  reason:String,
  appointmentdate:any,
  appointmentcategory:String,
  appointmenttype:String
 
}
const history = new Schema({
presentingcomplaints:String,
presentingcompalintcode:[],
pastmedicalhistory:String,
drugandallergyhistory:String,
familyandsocialhistory:String,
nutritionhistory:String,
spirituality:String,
cvs:{
cvsassessmentimpression:String,
historyofcvsdisorder:String,
historyofcvssurgicalprocedures:String,
historycvsremark:String
},
resp:{
historyofrespiratorydisorders:String,
respremark:String

},
gi:{
nausea:String,
typeofdiet:String,
giboweleliminationpattern:String,
bmfrequency:String,
bmusualtimeoftheday:String,
bmregularity:String,
usualconsistency:String,
dateoflastbm:String,
consistency:String,
color:String,
amount:String,
appearance:String,
historyofgidisorders:String,
historyofsurgicalprocedureofgisystem:String

},
gu:{
historyofgenitourinarydisorders:String,
historyofsrgicalprocedureforgusyetm:String,
numberstools:String,
fluidoutputemesis:String,
guboweleliminationpattern:String,
consistencystool:String,
historyguremark:String

},
neuro:{
historyofneurologicdisorders:String,
historyofsurgicalproceduresofnervoussystem:String,
historyneuroremark:String
},
msk:{
historyofmusculoskeletaldisorders:String,
historyofsurgicalproceduresofmsksystem:String,
historymskremarks:String,

}
});
const paediatrics = new Schema({
immunizationhistory:{
immunization: String,
hepb0:String,
opv0:String,
bcg:String,
opv1:String,
penta1:String,
pcv1:String,
rota1:String,
opv2:String,
pcv2:String,
rota2:String,
opv3:String,
penta3:String,
pcv3:String,
rota3:String,
ipv:String,
vitamina1:String,
vitamina2:String,
measles:String,
yellowfever:String,
mena:String,
measles2:String,
hpv914:String,
llin:String
},
  developmentmilestonehistorydetails:{
agewhenrolledover:String,
satupunsupported:String,
crawled:String,
walked:String,
spokefirstword:String,
spokeinsentences:String,
totaltrianed:String,
anyfoodallergies:String,
anyfoodallergiesnote:String,
contacttypesport:String,
contacttypesportnote:String,
historyofcaraccident:String,
historyofcaraccidentnote:String,
everbeenseenonemergency:String,
everbeenseenonemergencynote:String,
otherhistoryoftrauma:String,
otherhistoryoftraumanote:String,
historyoffrequentfalls:String,
historyoffrequentfallsnote:String,
anysignofmuscleweakness:String,
anysignofmuscleweaknessnote:String,
},
prepostnatalhistory:{
stressors:String,
stressorsnote:String,
pregnancymedication:String,
pregnancymedicationnote:String,
cigarettealcoholuse:String,
cigarettealcoholusenote:String,
delivery:String,
deliverynote:String,
deliverytype:String,
deliverytypenote:String,
emergencydelivery:String,
emergencydeliverynote:String,
labourinduction:String,
labourinductionnote:String,
birthhistorymedication:String,
birthhistorymedicationnote:String,
assisteddelivery:String,
assisteddeliverynote:String,
typeofassisteddelivery:String,
typeofassisteddeliverynote:String,
complicationsduringdelivery:String,
complicationsduringdeliverynote:String,
apgarscoreafteroneminute:String,
apgarscoreafterfiveminutes:String,
birthweight:String,
birthlengthheight:String,
useofoxygenafterbirth:String,
feedingofthechild:String,
feedingofthechildnote:String,
difficultyinlatchingsucking:String,
difficultyinlatchingsuckingnote:String
  },
  medicalhistory:{
attentiondeficitdisorderhyperactivitydisorder:String,
attentiondeficitdisorderhyperactivitydisordernote:String,
constipation:String,
constipationnote:String,
fatigue:String,
fatiguenote:String,

orthopedicconditions: String,
orthopedicconditionsnote:String,
allergies:String,
allergiesnote:String,
diabetes:String,
diabetesnote:String,
headaches:String,
headachesnote:String,
scoliosis:String,
scoliosisnote:String,
asthma:String,
asthmanote:String,

digestiveproblems:String,
digestiveproblemsnote:String,
hearingdifficulties:String,
hearingdifficultiesnote:String,
seizures:String,
seizuresnote:String,

blooddisorder:String,
blooddisordernote:String,
depressionanxiety:String,
depressionanxietynote:String,
heartproblems:String,
heartproblemsnote:String,

sleepdisturbances:String,
sleepdisturbancesnote:String,
chroniccolds:String,
chroniccoldsnote:String,
dyslexia:String,
dyslexianote:String,

kidneydisorders:String,
kidneydisordersnote:String,
torticollis:String,
torticollisnote:String,
colic:String,
colicnote:String,

earinfections:String,
earinfectionsnote:String,
lymphdisorders:String,
lymphdisordersnote:String,
visiondifficulties:String,
visiondifficultiesnote:String,

autism:String,
autismnote:String,
sensoryprocessingchallenges:String,
sensoryprocessingchallengesnote:String
  }
});
const physicalexaminationSchema = new Schema({
  cvs:{
heartrate:String,
bpsystolic:String,
bpdiastolic:String,
capillaryrefilltime:String,
heartraterhythm:String,
heartsound:String,
heartmurmurgrade:String,
heartmurmurquality:String,
heartmurmurpitch:String,
heartmurmurtiming:String,
murmurlocationauscultation:String,
murmurradiatingtobodylocation:String,
jugularveindistention:String,
jugularveindistentionheadup30degree:String,
edema:String,
temperatureextrmities:String,
tissueperfusionassessmentimpression:String,
cvsremark:String

  },
  resp:{
respiratoryrhthm:String,
respiratoryrate:String,
respiratoryeffort:String,
breathsoundsauscultation:String,
localizedbreathsounds:String,
respiratoryassessmentimpression:String,
respremarks:String
  },
  gi:{
bowelsoundauscultation:String,
bowelsoundbyqualityauscultation:String,
bsquadauscultation:String,
physiologicfindingbypalpation:String,
giassessmentimpression:String,
giremarks:String
  },
  gu:{
urinecolor:String,
urineodor:String,
urineturbidity:String,
urinecollectiondevice:String,
voidingpattern:String,
appearanceurine:String,
otherurine:String,
genitourinaryassessmentimpression:String,
numbervoids:String,
incontinentvoidsurinary:String,
diapercount:String,
perinealpadscount:String,
colorurine:String,
voidingpatterngu:String,
bloodlossvolume:String,
genitouringassessmentimpressions:String,
guremark:String

  },
  neuro:{
levelofconsciousness: String,
person:String,
place:String,
time:String,
orientationassessmentimpression:String,
levelofarousal:String,
speechclarity:String,
patientmood:String,
patientmemory:String,
abilitytoconcentrate:String,
abilitytodirectattention:String,
cniexam:String,
cniiexam:String,
cniiiexam:String,
cnivexam:String,
cnvexam:String,
cnviexam:String,
cniviiexam:String,
cniviiiexam:String,
cnixexam:String,
cnxexam:String,
cnxiexam:String,
cnxiiexam:String,
pupildiametereyer:String,
pupildiametereyel:String,
pupillaryresponsepupilr:String,
pupillaryresponsepupill:String,
pupilshaperightpupil:String,
pupilshapeleftpupil:String,
pupilassessmentimpression:String,
physiologicfindingopticlens:String,
glasgowcomascale:String,
neurologyassessmentimpression:String,
remarks:String
  },
  msk:{
muscletone:String,
musclestrength:String,
involuntarymovements:String,
activerangeflexionshoulderl:String,
activerangeextensionshoulderl:String,
activerangeexternalrotationshoulderl:String,
activerangeinternalrotationshoulderl:String,
activerangeabductionshoulderl:String,
activerangeadductionshoulderl:String,
activerangeflexionshoulderr:String,
activerangeextensionshoulderr:String,
activerangeexternalrotationshoulderr:String,
activerangeinternalrotationshoulderr:String,
activerangeabductionshoulderr:String,
activerangeadductionshoulderr:String,
activerangeflexionelbowl:String,
activerangeextensionelbowl:String,
activerangeflexionelbowr:String,
activerangeextensionelbowr:String,
activerangeflexionhipl:String,
activerangeextensionhipl:String,
activerangeexternalrotationhipl:String,
activerangeinternalrotationhipl:String,
activerangeabductionhipl:String,
activerangeadductionhipl:String,
activerangeflexionhipr:String,
activerangeextensionhipr:String,
activerangeexternalrotationhipr:String,
activerangeinternalrotationhipr:String,
activerangeabductionhipr:String,
activerangeadductionhipr:String,
activerangeflexionkneel:String,
activerangeextensionkneel:String,
activerangeflexionkneer:String,
activerangeextensionkneer:String,
passiverangeflexionshoulderl:String,
passiverangeextensionshoulderl:String,
passiverangeexternalrotationshoulderl:String,
passiverangeinternalrotationshoulderl:String,
passiverangeabductionshoulderl:String,
passiverangeadductionshoulderl:String,
passiverangeflexionshoulderr:String,
passiverangeextensionshoulderr:String,
passiverangeexternalrotationshoulderr:String,
passiverangeinternalrotationshoulderr:String,
passiverangeabductionshoulderr:String,
passiverangeadductionshoulderr:String,
passiverangeflexionelbowl:String,
passiverangeextensionelbowl:String,
passiverangeflexionelbowr:String,
passiverangeextensionelbowr:String,
passiverangeflexionhipl:String,
passiverangeextensionhipl:String,
passiverangeexternalrotationhipl:String,
passiverangeinternalrotationhipl:String,
passiverangeabductionhipl:String,
passiverangeadductionhipl:String,
passiverangeflexionhipr:String,
passiverangeextensionhipr:String,
passiverangeexternalrotationhipr:String,
passiverangeinternalrotationhipr:String,
passiverangeabductionhipr:String,
passiverangeadductionhipr:String,
dtrachilles:String,
dtrbiceps:String,
dtrbrachioradialis:String,
dtrpatellar:String,
dtrtriceps:String,
babinskisreflex:String,
oculocephalic:String,
paralysistype:String,
paresthesiatype:String,
physiologicfinding:String,
musculoskeletalassessmentimpression:String,
mskremark:String,
passiverangeflexionkneel:String,
passiverangeextensionkneel:String,
passiverangeflexionkneer:String,
passiverangeextensionkneer:String
  }

})
const assessmentSchema = new Schema({
  assessment: String,
  assessmentnote: String,
  diagosis: String,
  diagosisnote: String,
  icpc2: String,
  icpc2note: String
})
const generalphysicalexaminationSchema = new Schema({
  hair: String,
  hairnote: String,
  face: String,
  facenote: String,
  jaundice:String,
  jaundicenote:String,
  cyanosis: String,
  cyanosisnote: String,
  pallor: String,
  pallornote: String,
  oral: String,
  oralnote: String,
  lymphnodes: String,
  lymphnodesnote: String,
  ederma:String,
  edermanote:String,
  lastmenstrationperiod: String,
  lastmenstrationperiodnote: String,
  generalphysicalexamination: String,
  paediatricsspecification:{
    general:{
    currentlengthheight: String,
    currentlengthheightpercentage: String,
    currentlengthheightenote: String,
    currentweight: String,
    currentweightnote: String,
    percentageofweightexpected: String,
    headcircumference: String,
    anteriorfontanelle: String,
    posteriorfontanelle: String,
    chestcircumference: String,
    limbexamination: String,
    generalnote: String
    },
    neuro:{
    reflexes: String,
    rootingreflexes: String,
    suckreflexes: String,
    mororeflexes: String,
    tonicneckreflexes: String,
    graspreflexes: String,
    steppingreflexes: String,
    neuronote: String
    }
  }
})

const vitalsSchema = new Schema({
height:{
  type: String

},
weight:
{
  type: String
},
temperature:
{
  type: String
},
heartbit:
{
  type: String, 
 
},
bloodpressuresystolic:
{
  type: String
},
bloodpressurediastolic:
{
  type: String
},
respiration:
{
  type: String
},
saturation:
{
  type: String
},
bmi:
{
  type: String
},
/*
painscore:
{
  type: String
},
rbs:
{
  type: String
},
gcs:
{
  type: String
},
*/
staffname: String,
status:{
 
  type: String,
  default:configuration.status[9]


}
});


const appointmentSchema = new Schema({
  appointmentid:
  {
    type: String, 
    required: true
  },
  reason: String,
  findings: String,  // Description of the examination findings
  diagnosis: String, // Doctor's diagnosis based on the examination
  requestforlabtest: String,
  notes: String, // Additional notes (if any)
  appointmentdate:
  {
    type: Date, 
    required: true
  },
  additionalnote:String,
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Patientsmanagement",
    default: null,
  },
  admission: 
  {
    type: Schema.Types.ObjectId,
    ref: "Admission",
    default: null,
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    default: null,
  },
  firstName:String,
  lastName:String, 
  MRN:String,
  HMOId:String,
  HMOName:String,
  paymentstatus:String,
  paymentreference:String,
  doctorsfirstName:String,
  doctorslastName:String,
  payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    encounter:{ 
      vitals: vitalsSchema,
      assessmentdiagnosis: assessmentSchema,
      generalphysicalexamination:generalphysicalexaminationSchema,
      physicalexamination: physicalexaminationSchema,
      paediatrics:paediatrics,
      history:history
    },
    clinicalencounter:{
     
      diagnosisnote:[],
      diagnosisicd10: [],
      assessmentnote:[],
      clinicalnote:[],
      plannote:[],
      outcome: String

    },
    vitals: [
      {
        type: Schema.Types.ObjectId,
        ref: "Vitalchart",
        default: [],
      },
    ],

    lab: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lab",
        default: [],
      },
    ],
    radiology: [
      {
        type: Schema.Types.ObjectId,
        ref: "Radiology",
        default: [],
      },
    ],
    procedure: [
      {
        type: Schema.Types.ObjectId,
        ref: "Procedure",
        default: [],
      },
    ],
    prescription:[
      {
        type: Schema.Types.ObjectId,
        ref: "Prescription",
        default: [],
      },
    ],
   
  appointmentcategory: {
    type: String,
    required: true
  },
  appointmenttype: {
    type: String,
    required: true
  },
  clinic: {
    type: String,
    required: true
  },
  policecase: Boolean,
  physicalassault:Boolean,
  sexualassault: Boolean,
  policaename: String,
  servicenumber: String,
  policephonenumber: String,
  division:String,
  fromclinicalencounter:{
    type: Boolean,
    default: false,

  },
  status:{
    required: true,
    type: String,
    default: configuration.status[5],

  }
},
{ timestamps: true }

);
// Indexes to optimize common queries
appointmentSchema.index({ appointmentid: 1 }, { unique: true }); // Ensure unique ID
appointmentSchema.index({ patient: 1 });                          // Lookup by patient
appointmentSchema.index({ doctor: 1 });                           // Lookup by doctor
appointmentSchema.index({ clinic: 1 });                           // Filter by clinic
appointmentSchema.index({ appointmentdate: -1 });                // Sort/filter by date (descending)
appointmentSchema.index({ appointmentcategory: 1 });             // Filter by category
appointmentSchema.index({ appointmenttype: 1 });                 // Filter by type
appointmentSchema.index({ status: 1 });                           // Filter by status
appointmentSchema.index({ createdAt: -1 }); // Sort by creation time
appointmentSchema.index({ clinic: 1, status: 1, createdAt: -1 });



appointmentSchema.index({ clinic: 1, status:1 }); 
const appointment = model('Appointment', appointmentSchema);
export default appointment;


