import axios from 'axios';
import FormData from 'form-data';

const runTest = async () => {
  try {
    console.log("Registering test doctor...");
    const regRes = await axios.post('http://localhost:5006/api/auth/register', {
      name: 'Test Doctor Trace',
      email: `test-trace-${Date.now()}@example.com`,
      password: 'password123',
      role: 'Doctor'
    });
    const token = regRes.data.token;
    console.log("Token received.");

    console.log("Sending PUT /api/profile request simulating frontend payload...");
    const form = new FormData();
    form.append('name', 'Test Doctor Trace Updated');
    form.append('qualification', ''); // Frontend sends empty string if blank
    form.append('experience', '');
    form.append('feeMin', '');
    form.append('feeMax', '');
    form.append('clinicName', '');
    form.append('clinicLocation', '');
    form.append('medicalRegistrationNumber', '');
    form.append('consultationMode[]', 'Video');
    // Not appending image to simulate missing image or basic profile update

    const res = await axios.put('http://localhost:5006/api/profile', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Success:", res.status);
    console.log(res.data);
  } catch (error) {
    console.error("Test Failed with Status:", error.response?.status);
    console.error(error.response?.data);
  }
};

runTest();
