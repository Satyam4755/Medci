import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const jwt = await import('jsonwebtoken');
    const token = jwt.sign({ id: '6a0363ca1893233bdd2b595c' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });

    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('name', 'Doctor Satyam');
    form.append('qualification', 'MBBS');
    form.append('experience', '5');
    form.append('feeMin', '100');
    form.append('feeMax', '500');
    form.append('clinicName', 'Care Clinic');
    form.append('clinicLocation', 'Delhi');
    form.append('medicalRegistrationNumber', 'MED1234');
    form.append('consultationMode[]', 'Video');
    form.append('consultationMode[]', 'Audio');

    const fetch = (await import('node-fetch')).default;
    const res = await fetch('http://localhost:5006/api/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await res.text();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", data);
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}
run();
