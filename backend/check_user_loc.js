import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  for (const u of users) {
    console.log(`User ${u._id}: location =`, JSON.stringify(u.get('location')));
  }
  process.exit();
}
run();
