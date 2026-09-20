import nodemailer from 'nodemailer';

const createTransporter = async () => {
  // If no SMTP credentials are provided, try to create an Ethereal account for testing
  if (!process.env.SMTP_HOST) {
    console.log('No SMTP configuration found. Creating Ethereal Email account for local testing...');
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Use provided SMTP credentials
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email using configured SMTP or Ethereal fallback.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
export const sendEmail = async (options) => {
  try {
    const transporter = await createTransporter();
    
    const message = {
      from: process.env.FROM_EMAIL || '"AI Gym Trainer" <noreply@aigymtrainer.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    
    console.log('Email sent: %s', info.messageId);
    
    // Preview only available when sending through an Ethereal account
    if (!process.env.SMTP_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send email');
  }
};
