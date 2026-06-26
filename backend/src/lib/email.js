import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);




// sending verification emaill -->>
export async function sendVerificationEmail(email,token) {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
    await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: "Verify your PulseOps email",
        html: `<p>Click below to verify your email. This link expires in 24 hours.</p>
                <a href="${link}">Link</a>`
    })
}

// sending down alert --->>>

export async function sendDownAlert(email, monitorName, url) {
    await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: `${monitorName} is DOWN`,
        html: `<p><strong>${monitorName}</strong> (${url}) is not responding.</p>`,
    })
}


// sending recovery alert ->>>>> 

export async function sendRecoveryAlert(email, monitorName, url) {
    await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: `${monitorName} recovered`,
        html: `<p><strong>${monitorName}</strong> (${url}) is back up.</p>`,
    })
}