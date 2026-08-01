/**
 * Placeholder OCR Service Architecture
 * 
 * This service is designed to interface with cloud OCR providers 
 * like Google Document AI, AWS Textract, or Azure Document Intelligence.
 * 
 * For now, it implements a structured delay and returns mock extracted data 
 * to prove the architecture.
 */

export const scanDocument = async (imageUrl, documentType) => {
  // Simulate network delay for OCR API
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log(`[OCR SERVICE] Scanning ${documentType} from URL: ${imageUrl}`);

  // Mock extracted JSON structure
  const mockExtractedData = {
    confidenceScore: 0.95,
    extractedText: "DR. JOHN DOE\nREG. NO: 12345\nMEDICAL COUNCIL OF INDIA\nMBBS, MD",
    structured: {
      name: "John Doe",
      registrationNumber: "12345",
      council: "Medical Council of India",
      degree: "MBBS, MD",
    }
  };

  // Basic validation rules that an AI pipeline would use to reject blurry/bad images
  const isImageValid = imageUrl && imageUrl.length > 10;
  if (!isImageValid) {
    throw new Error('Image could not be processed due to low quality or unsupported format.');
  }

  return mockExtractedData;
};
