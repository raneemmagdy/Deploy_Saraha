import { APPLICATION_NAME, EMAIL_APP, EMAIL_APP_PASSWORD } from "../../../../config/config.service.js";
import nodemailer from "nodemailer";
export const sendEmail = async ({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments = []
} = {}) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for 587
        auth: {
            user: EMAIL_APP,
            pass: EMAIL_APP_PASSWORD
        },
        requireTLS: true,
        tls: {
            rejectUnauthorized: false
        }
    });

    const info = await transporter.sendMail({
        to,
        cc,
        bcc,
        subject,
        attachments,
        html,
        from: `${APPLICATION_NAME} <${EMAIL_APP}>`
    })

    console.log("Message sent: ", info.messageId);

}