import nodemailer from 'nodemailer';
import { log } from './logger.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  secure: false,
  auth: {
    user: '',
    pass: ''
  }
});

export async function sendEmail(payload) {
  transporter.sendMail(payload, (err, info) => {
    if (err) {
      log.error(err, "Error sending email");
      return;
    }

    log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  });
}
