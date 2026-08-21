import mongoose from 'mongoose';
import configuration from '../config';

function dbconnect() {
    const database = configuration.environment === "test" 
        ? process.env.LOCALDATABASE 
        : (process.env.MONGO_URI || process.env.DOCKERDATABASE);

    mongoose.set('strictQuery', true);

    return mongoose.connect(database as string, {
        family: 4,
        serverSelectionTimeoutMS: 5000,
    }).then(() => console.log('MongoDb Connected'))
      .catch((e: Error) => console.log('MongoDB Connection Error:', e.message));
}

export default dbconnect;