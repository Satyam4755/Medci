import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const doctor = await User.findOne({ role: 'Doctor' });
  const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  const lat = doctor.get('location').coordinates[1];
  const lng = doctor.get('location').coordinates[0];
  
  try {
    const res = await axios.get(`http://localhost:5006/api/consultations/nearby?lat=${lat}&lng=${lng}&radius=20&mode=nearby`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("API RESPONSE DATA LENGTH:", res.data.length);
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
  process.exit();
}
run();
