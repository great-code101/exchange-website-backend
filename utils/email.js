const nodemailer = require('nodemailer');

let transporter = null;

// Creates a reusable Ethereal test transporter.
// Ethereal is a free, disposable SMTP service — perfect for demos and testing.
// In production, swap this with a real provider like SendGrid or AWS SES.
const getTransporter = async () => {
    if (transporter) return transporter;

    const account = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });

    console.log('Mail service initialised.');
    console.log('Ethereal inbox:', `https://ethereal.email/login`);
    console.log('Login with:', account.user, '/', account.pass);

    return transporter;
};

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
    const transport = await getTransporter();

    const info = await transport.sendMail({
        from: '"Crypto App" <no-reply@crypto-app.dev>',
        to: toEmail,
        subject: 'Reset your password',
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
                <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Reset your password</h2>
                <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">
                    We received a request to reset the password for your account. Click the button below to set a new password.
                    This link is valid for 10 minutes.
                </p>
                <a href="${resetUrl}" 
                   style="display: inline-block; background: #0052ff; color: #fff; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 50px; text-decoration: none;">
                    Reset Password
                </a>
                <p style="color: #999; font-size: 13px; margin-top: 32px;">
                    If you did not request this, you can safely ignore this email. Your password will not change.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
                <p style="color: #ccc; font-size: 11px; text-align: center;">
                    Crypto App — Student Demo Project
                </p>
            </div>
        `
    });

    // Returns the Ethereal preview URL so you can inspect the email in the terminal
    return nodemailer.getTestMessageUrl(info);
};

module.exports = { sendPasswordResetEmail };
