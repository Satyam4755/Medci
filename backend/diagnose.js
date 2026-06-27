import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const consultationRequestSchema = new mongoose.Schema({}, { strict: false });
const ConsultationRequest = mongoose.model('ConsultationRequest', consultationRequestSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  console.log("=====================================================");
  console.log("CONSOLE OUTPUT: AFTER THE FIX");
  console.log("=====================================================");
  
  // Inject a dummy request with [0,0] to prove it
  const patient = await User.findOne({ role: 'Patient' });
  let dummyId = null;
  if (patient) {
    const dummy = await ConsultationRequest.create({
      patient: patient._id,
      problemDescription: "Test [0,0]",
      status: "pending",
      location: { type: "Point", coordinates: [0, 0] }
    });
    dummyId = dummy._id;
  }
  
  const allRequests = await ConsultationRequest.find({ status: 'pending' });
  console.log(`Total Pending Requests in DB: ${allRequests.length}`);
  
  console.log("\nSimulating FIXED React Mapping Logic (PotentialPatients.jsx):");
  
  let markersRendered = 0;
  for (const req of allRequests) {
    const coords = req.get('location')?.coordinates;
    const pat = await User.findById(req.get('patient'));
    const patCoords = pat?.get('location')?.coordinates;
    
    // Fixed frontend code:
    let reqLocation = coords;
    if (!reqLocation || reqLocation[0] === 0) {
      reqLocation = patCoords;
    }
    
    if (!reqLocation || reqLocation[0] === 0) {
        console.log(`Marker for Request ${req._id} -> HIDDEN`);
    } else {
        console.log(`Marker for Request ${req._id} -> SHOWN (Recovered!)`);
        markersRendered++;
    }
  }
  
  console.log(`\nTotal Markers Rendered by Frontend: ${markersRendered}`);
  
  if (dummyId) {
    await ConsultationRequest.findByIdAndDelete(dummyId);
  }
  
  process.exit();
}
run();
