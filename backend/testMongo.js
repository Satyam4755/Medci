import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const doc = await db.collection('doctorprofiles').findOne({});
  console.log("DOCTOR PROFILE:", doc);
  
  const patient = await db.collection('patientprofiles').findOne({});
  console.log("PATIENT PROFILE:", patient);
  
  process.exit(0);
});
