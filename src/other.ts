import { setData } from './dataStore';

export function clearV1() {
  setData({
    users: [],
    channels: [],
    dms: [],
    msgcount: 0
  });
  return {};
}

import crypto from 'crypto';

export function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

// 'use strict';
const nodemailer = require('nodemailer');

// async..await is not allowed in global scope, must use a wrapper
export async function resetPasswordEmail(email: string, text:string) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  const testAccount = await nodemailer.createTestAccount();
  console.log(testAccount);
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'keyon.vonrueden92@ethereal.email', // generated ethereal user
      pass: 'a3sTBaRMjRCzuyww1P', // generated ethereal password
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"UNSW Memes" <memes@unsw.com>', // sender address
    to: email, // list of receivers
    subject: 'Password Reset', // Subject line
    text: text, // plain text body
    html: '<b><var>text</var></b>', // html body
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
