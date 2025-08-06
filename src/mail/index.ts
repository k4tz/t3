import nodemailer from "nodemailer";
import mailConfig from "../config/mail.ts";

const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
    }
});

async function sendEmail(to: string, subject: string, text: string) {
    const mailOptions = {
        from: mailConfig.fromName + " <" + mailConfig.fromEmail + ">",
        to,
        subject,
        text,
    };
    await transporter.sendMail(mailOptions);
}

export default sendEmail;