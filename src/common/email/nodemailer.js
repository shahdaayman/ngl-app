//create transporter
import nodemailer from "nodemailer";
import {config} from "dotenv";
config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    dnsTimeout: 10000,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS

    },
});

export async function sendEmail(to, subject, html){
    try {
        await transporter.sendMail({
            from: `"NGL-APP" <${process.env.MAIL_USER}>`,
            to: to,
            subject: subject,
            html: html
        });
    } catch (cause) {
        throw Object.assign(new Error('Unable to send verification email. Please try again later.', {cause}), {status: 503});
    }
}
