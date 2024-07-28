const nodeMailer = require("nodemailer");


module.exports.sendMail = async (sent_from, send_to, subject, message) => {
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        service: process.env.SMTP_SERVICE,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const mailOptions = {
        from: sent_from,
        to: send_to,
        subject: subject,
        html: message,
    }

    transporter.sendMail(mailOptions, (err, data) => {
       // if (err) console.log(err);
    })
}