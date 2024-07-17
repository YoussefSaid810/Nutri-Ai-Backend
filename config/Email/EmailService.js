const nodemailer = require("nodemailer");
const emailjs = require('@emailjs/nodejs')
const fetch = require('node-fetch');

const transporter = nodemailer.createTransport({
    service: process.env.Service || "gmail",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

emailjs.init({
    publicKey: process.env.PUBLIC_KEY,
    limitRate: {
        // Set the limit rate for the application
        id: 'Nutri-AI',
        // Allow 1 request per second
        throttle: 1000,
    },
});


const userVerification = async (user) => {
    let templateParams = {
        username: user.name,
        code: user.code,
        send_to: user.email
    }

    try {
        let res = await emailjs.send(process.env.SERVICE_ID, process.env.TEMP_ID, templateParams, {
            publicKey: process.env.PUBLIC_KEY,
            privateKey: process.env.PRIVATE_KEY,
        });
        console.log(res.status)
    } catch (error) {
        console.error(error);
        throw new Error('Error here');
    }




};

module.exports = { userVerification };
