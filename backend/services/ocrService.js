import axios from 'axios';

/**
 * Placeholder OCR Service Architecture
 * 
 * This service is designed to interface with cloud OCR providers 
 * like Google Document AI, AWS Textract, or Azure Document Intelligence.
 * 
 * For now, it implements a structured delay and returns mock extracted data 
 * based on the document type, while performing basic heuristics on the image.
 */

export const scanDocument = async (imageUrl, documentType, expectedName = "Dr. Example Name") => {
  // Simulate network delay for OCR API
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log(`[OCR SERVICE] Scanning ${documentType} from URL: ${imageUrl}`);

  let fileSize = 0;
  try {
    // Basic heuristic: check file size to simulate resolution check
    const response = await axios.head(imageUrl);
    fileSize = parseInt(response.headers['content-length'] || '0', 10);
  } catch (err) {
    console.warn(`[OCR SERVICE] Failed to fetch image metadata: ${err.message}`);
  }

  // Simulate confidence based on file size (assuming >100KB is good, <50KB is blurry)
  let baseConfidence = 95;
  if (fileSize > 0 && fileSize < 50000) {
    baseConfidence = 65; // Simulate low res / blur
  } else if (fileSize > 0 && fileSize < 150000) {
    baseConfidence = 85;
  }

  // Generate random variation +/- 3%
  const confidenceScore = Math.min(100, Math.max(0, baseConfidence + (Math.floor(Math.random() * 7) - 3)));

  let extractedData = {};
  let extractedText = '';

  switch (documentType) {
    case 'Aadhaar':
      extractedText = `GOVERNMENT OF INDIA\n${expectedName}\nDOB: 15/08/1985\n1234 5678 9012`;
      extractedData = {
        doctorName: expectedName,
        aadhaarNumber: '123456789012',
        dob: '15/08/1985'
      };
      break;
    case 'Medical Registration':
      extractedText = `MEDICAL COUNCIL OF INDIA\nREGISTRATION CERTIFICATE\nName: ${expectedName}\nReg No: MCI-12345\nDate: 10/10/2010`;
      extractedData = {
        doctorName: expectedName,
        registrationNumber: 'MCI-12345'
      };
      break;
    case 'Qualification':
      extractedText = `ALL INDIA INSTITUTE OF MEDICAL SCIENCES\nThis is to certify that ${expectedName} has passed MBBS.\nDegree: MBBS, MD`;
      extractedData = {
        doctorName: expectedName,
        university: 'AIIMS',
        degree: 'MBBS, MD'
      };
      break;
    case 'Clinic Proof':
      extractedText = `CLINIC REGISTRATION\nName: ${expectedName}\nClinic: City Care Hospital\nAddress: 123 Health Ave.`;
      extractedData = {
        doctorName: expectedName,
        clinicName: 'City Care Hospital'
      };
      break;
    default:
      extractedText = `Unknown document text for ${expectedName}`;
  }

  return {
    confidenceScore,
    extractedText,
    structured: extractedData
  };
};
