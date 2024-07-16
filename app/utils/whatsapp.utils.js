const axios = require('axios');

function createWhatsappMessage(fullname, email, phone, course, message, source, additional_details) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

        // Customize your message template using the provided parameters
        const messageTemplate = `*New enquiry :*\n\n*Source : ${source}*\n\n**Name :* ${fullname}!\n\nWe have received enquiry for this course :  ${course} course.\n\n*Information :*\n\nEmail: ${email}\nPhone: ${phone}\n\nYour Message:\n${message}\n\nAdditional details:\n${additional_details}`;

        const payload = {
            chatId: "120363029514494201@g.us",
            // chatId : "916381794189@c.us",
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


function createplacementDetailsMessage(fullname, email, phone, job_id, student_code) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

        // Customize your message template using the provided parameters
        const messageTemplate = `*New Placement Request :*\n*Name :* ${fullname}!\n\nWe have received placement enquiry for this for this job ID :  ${job_id}.\n\n*Information :*\n\nEmail: ${email}\nPhone: ${phone}\nStudent Code:${student_code}`;

        const payload = {
            chatId: "120363029514494201@g.us",
            // chatId : "916381794189@c.us",
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

//createplacementDetailsMessage('Pradeep', 'rpradeep1797@gmail.com', '6381794189', 'JD-1234', 'IA014')


function createWhatsappOrderMessage(fullname, country, phone, email, amount, order_status, mode) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

        // Customize your message template using the provided parameters for an order
        const messageTemplate = `*New order :*\n\n*Name :* ${fullname}!\n\nWe have received a new order.\n\n*Information :*\n\nCountry: ${country}\nPhone: ${phone}\nEmail: ${email}\nAmount: ${amount}\nStatus: ${order_status}\nMode: ${mode}`;

        const payload = {
            chatId: "120363029514494201@g.us",
            // chatId: "916381794189@c.us",
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


function createWhatsappMessageRegistration(formData) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

        // Customize your message template using the provided parameters
        const messageTemplate = `**New Registration** \n\n**Name : **${formData.firstname} ${formData.middlename} ${formData.lastname}!\n\nWe have received registration for this course ${formData.courses} course. Information.\n\n**Email**: ${formData.email}\n**Phone**: ${formData.mobile}\n\nAdditional Information:\n\n**Mode of Education**: ${formData.modeOfEducation}\n**Birthday**: ${formData.bday}\n**Gender**: ${formData.gender}\n**Address**: ${formData.address}\n**Additional Mobile**: ${formData.additionalMobile}\n**Work Mobile**: ${formData.workMobile}\n**Company**: ${formData.company}\n**Comments**: ${formData.comments}\n**Education**: ${formData.education}\n**Industry Experience**: ${formData.industryexp}\n**Years of Experience**: ${formData.yearsOfExp}\n**Government ID**: ${formData.governmentId}\n**Currency Type**: ${formData.currencyType}\n**Fees Currency**: ${formData.feesCurrency}\n**Document**: ${formData.document}`;
        const payload = {
            chatId: "120363029514494201@g.us",
            // chatId : "916381794189@c.us",
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

function createWhatsappfile(document) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendFileByUrl/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

        // Customize your message template using the provided parameters
        const urlFile = document
        const payload = {
            chatId: "120363029514494201@g.us",
            // chatId : "916381794189@c.us",
            urlFile: urlFile,
            fileName: "attachment.pdf",
            caption: "PDF file",
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

function sendBookingNotification(fullname, email, phone, date, time, message) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

        // Customize your message template using the provided parameters
        const messageTemplate = `*New Booking :*\n\n*Name :* ${fullname}!\n\nWe have received booking for meeting for this reason :  ${message}.\n\n*Information :*\n\nEmail: ${email}\nPhone: ${phone}\n\nDate:\n${date}\n\nTime: ${time}`;

        const payload = {
            chatId: "120363029514494201@g.us",
            // chatId : "916381794189@c.us",
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

function createNotificationMessage(mobile, count) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

        // Customize your message template using the provided parameters
        const messageTemplate = `You got ${count} new leads`;
        const chatId = mobile + "@c.us";
        const payload = {
            chatId: chatId, // Assuming mobile is the staff's mobile number
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


function sendWhatsappMessageToUser(mobile, message) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

        // Customize your message template using the provided parameters
        const messageTemplate = message;

        const payload = {
            chatId: `${mobile}@c.us`,
            // chatId : "916381794189@c.us",
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

module.exports = { createWhatsappMessage, createWhatsappMessageRegistration, createWhatsappfile, sendBookingNotification, createWhatsappOrderMessage,createNotificationMessage, createplacementDetailsMessage, sendWhatsappMessageToUser };
