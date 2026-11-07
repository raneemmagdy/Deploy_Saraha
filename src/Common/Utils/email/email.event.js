import { EventEmitter } from "node:events";
import { sendEmail } from "./send.email.js";
import { emailTemplate } from "./email.template.js";

export const emailEmitter = new EventEmitter();

emailEmitter.on("Otp", async ({ to, subject = "Verify your email", code, title = "Confirm_email", expiredTime } = {}) => {
  try {
    await sendEmail({
      to,
      subject,
      html: emailTemplate({
        title,
        body: ` <p style="font-size:15px; color:#444; text-align:center; margin-bottom: 25px; line-height:1.6;">
                       Use the code below to verify your account:
                    </p>
  
                    <div style="margin: 0 auto 25px; background:linear-gradient(135deg, #3b82f6, #7c3aed); color:#fff; font-size:24px; font-weight:700; letter-spacing:6px; text-align:center; padding:16px 0; border-radius:12px; width:80%; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                      ${code}
                    </div>
  
                    <p style="font-size:14px; color:#666; text-align:center; margin-bottom:20px;">
                      This code will expire in <b>${expiredTime} minutes</b>. Do not share it with anyone.
                    </p>
  
                    <p style="font-size:13px; color:#999; text-align:center;">
                      Didn’t request this? Just ignore this email.
                    </p>
           `
      })
    })
  } catch (error) {
    console.log("Fail to send email", error)
  }
})