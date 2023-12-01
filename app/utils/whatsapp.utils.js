const axios = require('axios');

function createWhatsappMessage(fullname, email, phone, course, message) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3c9955ceda3a49926bdc38e41a23564086a6";

        // Customize your message template using the provided parameters
        const messageTemplate = `Hello ${fullname}!\n\nThank you for your interest in the ${course} course. We have received your inquiry.\n\nEmail: ${email}\nPhone: ${phone}\n\nYour Message:\n${message}`;

        const payload = {
            chatId: "916381794189@c.us",
            message: messageTemplate
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        return axios.post(url, payload, { headers })
            .then(response => {
                console.log(response.data);
                return response.data;  // Assuming you want to return some data after the request
            })
            .catch(error => {
                console.error(error);
                throw error;  // Rethrow the error to handle it outside the function if needed
            });
    } catch (err) {
        console.error(err);
        return false;
    }
}

module.exports = { createWhatsappMessage };
