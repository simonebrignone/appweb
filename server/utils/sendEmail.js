const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,          // es: smtp.gmail.com o smtp.mailgun.org
      port: process.env.EMAIL_PORT,          // es: 465 per SSL, 587 per TLS
      secure: process.env.EMAIL_SECURE === 'true', // true per 465 (SSL), false per 587 (TLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email inviata con successo:', info.messageId);
  } catch (error) {
    console.error('Errore invio email:', error);
    throw new Error('Errore invio email');
  }
};

module.exports = sendEmail;
