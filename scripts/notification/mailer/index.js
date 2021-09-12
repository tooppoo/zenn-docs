const mailer = require('nodemailer')

const transporter = mailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: process.env.NOTIFY_MAIL_ACCOUNT,
    pass: process.env.NOTIFY_MAIL_PASSWORD,
  }
})

transporter.sendMail({
  from: process.env.NOTIFY_MAIL_SENDER,
  to: process.env.NOTIFY_MAIL_TO,
  cc: process.env.NOTIFY_MAIL_CC,
  bcc: process.env.NOTIFY_MAIL_BCC,
  subject: process.env.NOTIFY_MAIL_SUBJECT,
  text: process.env.NOTIFY_MAIL_TEXT,
  attachments: process.env.NOTIFY_MAIL_FILES
    .split(',')
    .map(path => ({ path })),
}).then((info) => {
  console.info({ msg: `email send`, res: info.response })
}).catch((error) => {
  console.error(error, { msg: error.msg, stack: error.stack })
})
