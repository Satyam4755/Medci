import axios from 'axios';

const getSenderInfo = () => {
  const emailFrom = process.env.EMAIL_FROM || 'Medcii <satyambpl.2004@gmail.com>';
  const match = emailFrom.match(/^(.*)\s*<(.*)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: 'Medcii', email: emailFrom.trim() };
};

const sendEmail = async (options) => {
  try {
    const sender = getSenderInfo();

    const data = {
      sender,
      to: [
        {
          email: options.email
        }
      ],
      subject: options.subject,
      htmlContent: options.html
    };

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      data,
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending email via Brevo API:', error.response?.data || error.message);
    throw new Error('Email sending failed');
  }
};

export default sendEmail;
