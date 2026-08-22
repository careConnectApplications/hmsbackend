"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
function dbconnect() {
    const database = config_1.default.environment === "test"
        ? process.env.LOCALDATABASE
        : (process.env.MONGO_URI || process.env.DOCKERDATABASE);
    mongoose_1.default.set('strictQuery', true);
    return mongoose_1.default.connect(database, {
        family: 4,
        serverSelectionTimeoutMS: 5000,
    }).then(() => console.log('MongoDb Connected'))
        .catch((e) => console.log('MongoDB Connection Error:', e.message));
}
exports.default = dbconnect;
