
const nodemailer = require('nodemailer');


// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
});


// Check email connection
transporter.verify((error, success) => {

    if (error) {
        console.error('Email service error:', error);
    } else {
        console.log('Email service is ready to send messages');
    }

});


// Send email
const sendEmail = async (to, subject, text, html) => {

    try {

        const info = await transporter.sendMail({

            from: `"Banking System" <${process.env.EMAIL_USER}>`,

            to: to,

            subject: subject,

            text: text,

            html: html

        });

        console.log('================================');
        console.log('EMAIL SENT SUCCESSFULLY');
        console.log('To:', to);
        console.log('Message ID:', info.messageId);
        console.log('================================');

        return info;

    } catch (error) {

        console.error('================================');
        console.error('EMAIL SENDING FAILED');
        console.error('To:', to);
        console.error(error);
        console.error('================================');

        throw error;
    }
};


// Registration email
async function sendRegistrationEmail(userEmail, name) {

    const subject = 'Welcome to Banking System';

    const text = `
Hello ${name},

Thank you for registering with our banking system.

We're excited to have you on board!

Best regards,
The Banking System Team
`;

    const html = `
<p>Hello ${name},</p>

<p>
    Thank you for registering with our banking system.
</p>

<p>
    We're excited to have you on board!
</p>

<p>
    Best regards,<br>
    The Banking System Team
</p>
`;

    await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
}


async function sendTransactionEmail(userEmail, name, amount, toAccount) {

    const subject = 'Transaction successful';


    const text = `Hello ${name}, \n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nThank you for using our banking system.\n\nBest regards,\nThe Banking System Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Thank you for using our banking system.</p><p>Best regards,<br>The Banking System Team</p>`;

    await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
    
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {

    const subject = 'Transaction failed';

    const text = `Hello ${name}, \n\nYour transaction of $${amount} to account ${toAccount} has failed.\n\nPlease check your account balance and try again.\n\nBest regards,\nThe Banking System Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} has failed.</p><p>Please check your account balance and try again.</p><p>Best regards,<br>The Banking System Team</p>`;

    await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
    
}



module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};

