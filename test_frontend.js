import fs from 'fs';
const file = fs.readFileSync('frontend/src/pages/Doctor/PotentialPatients.jsx', 'utf-8');
const lines = file.split('\n');
lines.forEach((l, i) => {
  if(l.includes('userLocation.coordinates')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});
