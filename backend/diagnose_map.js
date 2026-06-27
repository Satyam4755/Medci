import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Mongoose Models
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const consultationRequestSchema = new mongoose.Schema({}, { strict: false });
const ConsultationRequest = mongoose.model('ConsultationRequest', consultationRequestSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  console.log("=====================================================");
  console.log("STEP 1 — TRACE THE COMPLETE DATA FLOW");
  console.log("=====================================================");
  
  const allPatients = await User.find({ role: 'Patient' });
  console.log(`Total Patients in DB: ${allPatients.length}`);
  
  const validLocPatients = allPatients.filter(p => p.get('location') && p.get('location').coordinates && p.get('location').coordinates[0] !== 0);
  console.log(`Patients with valid location: ${validLocPatients.length}`);
  
  const allRequests = await ConsultationRequest.find({});
  console.log(`\nTotal Consultation Requests: ${allRequests.length}`);
  
  const pendingRequests = await ConsultationRequest.find({ status: 'pending' });
  console.log(`Pending Consultation Requests: ${pendingRequests.length}`);

  for (const req of pendingRequests) {
    console.log(`\nRequest ID: ${req._id}`);
    console.log(`Patient ID: ${req.get('patient')}`);
    const pat = await User.findById(req.get('patient'));
    if (!pat) {
      console.log(`- Patient missing!`);
    } else {
      console.log(`- Patient Name: ${pat.get('name')}`);
      console.log(`- Request Location:`, JSON.stringify(req.get('location')));
      console.log(`- Patient Location:`, JSON.stringify(pat.get('location')));
    }
  }

  console.log("\n=====================================================");
  console.log("TESTING NEARBY QUERY");
  console.log("=====================================================");
  
  // Doctor Location (assuming one doctor exists with a valid location, or pick a random point)
  const doctor = await User.findOne({ role: 'Doctor', 'location.coordinates.0': { $ne: 0 } });
  if (!doctor) {
    console.log("NO DOCTOR WITH VALID LOCATION FOUND!");
    process.exit();
  }
  
  console.log(`Doctor: ${doctor.get('name')}, Location: ${JSON.stringify(doctor.get('location').coordinates)}`);
  
  const lng = doctor.get('location').coordinates[0];
  const lat = doctor.get('location').coordinates[1];
  const radius = 20; // 20 km
  const radiusInRadians = radius / 6371; // km

  const mode = 'nearby';

  // The actual query in consultationController.js
  let query = { status: 'pending' };
  if (mode === 'nearby' && lat && lng) {
    // BUG IS PROBABLY HERE
    query['location.coordinates'] = {
      $geoWithin: {
        $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
      }
    };
  }

  console.log("\nMongo Query:");
  console.log(JSON.stringify(query, null, 2));

  try {
    const nearbyRequests = await ConsultationRequest.find(query);
    console.log(`\nRequests matching nearby query: ${nearbyRequests.length}`);
    if (nearbyRequests.length === 0) {
      console.log("Why 0? Let's check without geoWithin:");
      const allPending = await ConsultationRequest.find({ status: 'pending' });
      for (const r of allPending) {
        console.log(`Pending req: ${r._id}, location: ${JSON.stringify(r.get('location'))}`);
      }
    }
  } catch (err) {
    console.log("Query Error:", err.message);
  }

  process.exit();
}

run();
