const nodemailer = require('nodemailer');

// Determines the correct transporter based on available environment variables.
// Uses Gmail if credentials are set, otherwise falls back to Ethereal for local testing.
const createTransporter = async () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const service = process.env.EMAIL_SERVICE || 'gmail';

        const smtpOptions = {
            gmail: {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                family: 4, // Force IPv4 to fix Render ENETUNREACH IPv6 error
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            },
            outlook: {
                host: 'smtp.office365.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            }
        };

        const config = smtpOptions[service] || smtpOptions.gmail;
        const transport = nodemailer.createTransport(config);

        await transport.verify();
        console.log(`Mail service connected via ${service}.`);
        return { transport, isReal: true };
    }

    // No credentials set — use Ethereal for local testing
    const account = await nodemailer.createTestAccount();
    const transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: account.user, pass: account.pass }
    });

    console.log('No EMAIL_USER/EMAIL_PASS found in .env — using Ethereal test account.');
    console.log('Ethereal login:', account.user, '/', account.pass);
    return { transport, isReal: false };
};

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
    const { transport, isReal } = await createTransporter();

    const info = await transport.sendMail({
        from: `"Crypto App" <${process.env.EMAIL_USER || 'no-reply@crypto-app.dev'}>`,
        to: toEmail,
        subject: 'Reset your password',
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
                <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Reset your password</h2>
                <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">
                    We received a request to reset the password for your account.
                    Click the button below to set a new password. This link expires in 10 minutes.
                </p>
                <a href="${resetUrl}"
                   style="display: inline-block; background: #0052ff; color: #fff; font-weight: 600;
                          font-size: 15px; padding: 14px 32px; border-radius: 50px; text-decoration: none;">
                    Reset Password
                </a>
                <p style="color: #999; font-size: 13px; margin-top: 32px;">
                    If you did not request this, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
                <p style="color: #ccc; font-size: 11px; text-align: center;">
                    Crypto App &mdash; Academic Demo Project
                </p>
            </div>
        `
    });

    if (isReal) {
        console.log(`Password reset email sent to ${toEmail}.`);
        return null; // Real email sent — no preview URL needed
    }

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Ethereal preview:', previewUrl);
    return previewUrl;
};

module.exports = { sendPasswordResetEmail };
