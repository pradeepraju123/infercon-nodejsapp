const axios = require('axios');
const config = require("../config/config.js");
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');


const downloadImage = async (imageUrl, destPath) => {
    const protocol = imageUrl.startsWith('https') ? https : http;
  
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);
      protocol.get(imageUrl, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${imageUrl}' (${response.statusCode})`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', err => {
        fs.unlink(destPath, () => reject(err));
      });
    });
  };

// function bulk_users_meg(mobile, message) {
//     try {
                      
//         const url = 'https://media.green-api.com/waInstance1101790684/sendFileByUpload/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6';
//         const filePath = '/Users/trstscore/Nanthini/projects/angular-py/infercon-nodejsapp/whatsapp.png'; 
//         const fileName = path.basename(filePath);

//         if (!fs.existsSync(filePath)) {
//             return;
//         }
//         const chatId = `${mobile}@c.us`;
//         // Build form data
//         const form = new FormData();
//         form.append('chatId', chatId);
//         form.append('caption', message);
//         form.append('fileName', fileName);
//         form.append('file', fs.createReadStream(filePath));

    
//         return axios.post(url, form, {
//             headers: form.getHeaders()
//         })
//         .then(response => {
//             // console.log(' Message sent:', response.data);
//             return response.data;
//         })
//         .catch(error => {
//             console.error('Error sending message:', error.response?.data || error.message);
//             throw error;
//         });

//     } catch (err) {
//         console.error(' Exception:', err);
//         return false;
//     }
// }

async function bulk_users_meg_wati($whatsappNumber)
{

try {
    const whatsapp_authorization_dev = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTljMmYyOC1hMGM4LTRjZDItYTk5Ny0zOWNmNmIxNzA0NDciLCJ1bmlxdWVfbmFtZSI6InByYWRlZXAuckBpbmZlcmNvbi5jb20iLCJuYW1laWQiOiJwcmFkZWVwLnJAaW5mZXJjb24uY29tIiwiZW1haWwiOiJwcmFkZWVwLnJAaW5mZXJjb24uY29tIiwiYXV0aF90aW1lIjoiMDYvMzAvMjAyNSAxNDo1MDowNSIsInRlbmFudF9pZCI6IjQ2MTAzNyIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.zusBUuFmVHd4sWG10gUKzps-Dutmu6ZWgD0pqWQmqWo';
    const payload={
        "template_name": "lead_generation_notification",
        "broadcast_name": "lead_generation_notification",
        "parameters": [
            {
                "name": "name",
                "value": "John"
            },
            {
                "name": "email",
                "value": "pradeep.r@infercon.com"
            },
            {
                "name" : "mobile",
                "value" : "6381794189"
            },
            {
                "name" : "country",
                "value" : "India"
            },
            {
                "name" : "message",
                "value" : "Testing message"
            },
            {
                "name" : "courses",
                "value" : "Siemens PLC, Allen Bradley PLC"
            }
        ]
    }
    const response = await axios.post(
      `https://live-mt-server.wati.io/461037/api/v1/sendTemplateMessage?whatsappNumber=${whatsappNumber}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${whatsapp_authorization_dev}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending WATI message:', error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }

   
}
function bulk_users_meg(mobile, message,file) {
    try {
                      
       const  url = "https://media.green-api.com/waInstance1101781607/sendFileByUpload/7d9fc0a0b68944f0b21443e6c9234ea5cb7f67019f9944e6bb"
        const filePath = file; 
        const fileName = path.basename(filePath);
        

        if (!fs.existsSync(filePath)) {
            return;
        }
        const cleanNumber = mobile.replace(/\D/g, ''); // removes all non-digits

        const chatId = `${cleanNumber}@c.us`;
        // Build form data
        const form = new FormData();
        form.append('chatId', chatId);
        form.append('caption', message);
        form.append('fileName', fileName);
        form.append('file', fs.createReadStream(filePath));
        
        // return;


        return axios.post(url, form, {
            headers: form.getHeaders()
        })
        .then(response => {
            console.log(' Message sent:', response.data);
            return response.data;
        })
        .catch(error => {
            console.error('Error sending message:', error.response?.data || error.message);
            throw error;
        });

    } catch (err) {
        console.error(' Exception:', err);
        return false;
    }
}


  


  


function createWhatsappMessage(fullname, email, phone, course, message, source, additional_details) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

        // Customize your message template using the provided parameters
        const messageTemplate = `*New enquiry :*\n\n*Source : ${source}*\n\n**Name :* ${fullname}!\n\nWe have received enquiry for this course :  ${course} course.\n\n*Information :*\n\nEmail: ${email}\nPhone: ${phone}\n\nYour Message:\n${message}\n\nAdditional details:\n${additional_details}`;


        // const messageTemplate = `Hi ${staff_name},\n\nYou have a new Lead!\n\n*Name:* ${name}\n*Email:* ${email}\n*Mobile:* ${mobile}\n*Course:* ${course}\n\nPlease follow up with the lead as soon as possible.`;

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

function LeadNotificationToStaff(staff_name,staff_mobile, fullname, email, phone, course) {
    try {
        const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

        // Customize your message template using the provided parameters
        // const messageTemplate = `*New enquiry :*\n\n*Source : ${source}*\n\n**Name :* ${fullname}!\n\nWe have received enquiry for this course :  ${course} course.\n\n*Information :*\n\nEmail: ${email}\nPhone: ${phone}\n\nYour Message:\n${message}\n\nAdditional details:\n${additional_details}`;


        const messageTemplate = `Hi ${staff_name},\n\nYou have a new Lead!\n\n*Name:* ${fullname}\n*Email:* ${email}\n*Mobile:* ${phone}\n*Course:* ${course}\n\nPlease follow up with the lead as soon as possible.`;

        const payload = {
            // chatId: "120363029514494201@g.us",
            chatId : staff_mobile+"@c.us",
            message: messageTemplate
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        return axios.post(url, payload, { headers })
            .then(response => {

                let data = JSON.stringify({
                    "chatId": staff_mobile+"@c.us",
                    "contact": {
                      "phoneContact": phone,
                      "firstName": fullname,
                      "middleName": "",
                      "lastName": "",
                      "company": ""
                    }
                  });
                  
                  let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: "https://api.green-api.com/waInstance1101790684/sendContact/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6",
                    headers: { 
                      'Content-Type': 'application/json'
                    },
                    data : data
                  };
                  
                  axios.request(config)
                  .then((response) => {
                    console.log(JSON.stringify(response.data));
                  })
                  .catch((error) => {
                    console.log(error);
                  });
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

// function createNotificationMessage(mobile, count) {
//     try {
//         const url = "https://api.green-api.com/waInstance1101790684/sendMessage/97f9a5416c5e4f3a9955c8da3a49926bdc38e41a23564666a6";

//         // Customize your message template using the provided parameters
//         const messageTemplate = `You got ${count} new leads`;
//         const chatId = mobile + "@c.us";
//         const payload = {
//             chatId: chatId, // Assuming mobile is the staff's mobile number
//             message: messageTemplate
//         };

//         const headers = {
//             'Content-Type': 'application/json'
//         };

//         return axios.post(url, payload, { headers })
//             .then(response => {
//                 console.log(response.data);
//                 return response.data;  // Assuming you want to return some data after the request
//             })
//             .catch(error => {
//                 console.error(error);
//                 throw error;  // Rethrow the error to handle it outside the function if needed
//             });
//     } catch (err) {
//         console.error(err);
//         return false;
//     }
// }
async function createNotificationMessage(mobile, count) {
   try {
    const whatsapp_authorization_dev = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTljMmYyOC1hMGM4LTRjZDItYTk5Ny0zOWNmNmIxNzA0NDciLCJ1bmlxdWVfbmFtZSI6InByYWRlZXAuckBpbmZlcmNvbi5jb20iLCJuYW1laWQiOiJwcmFkZWVwLnJAaW5mZXJjb24uY29tIiwiZW1haWwiOiJwcmFkZWVwLnJAaW5mZXJjb24uY29tIiwiYXV0aF90aW1lIjoiMDYvMzAvMjAyNSAxNDo1MDowNSIsInRlbmFudF9pZCI6IjQ2MTAzNyIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.zusBUuFmVHd4sWG10gUKzps-Dutmu6ZWgD0pqWQmqWo';
    const payload={
        "template_name": "lead_generation_notification",
        "broadcast_name": "lead_generation_notification",
        "parameters": [
            {
                "name": "name",
                "value": "John"
            },
            {
                "name": "email",
                "value": "pradeep.r@infercon.com"
            },
            {
                "name" : "mobile",
                "value" : "6381794189"
            },
            {
                "name" : "country",
                "value" : "India"
            },
            {
                "name" : "message",
                "value" : "Testing message"
            },
            {
                "name" : "courses",
                "value" : "Siemens PLC, Allen Bradley PLC"
            }
        ]
    }
    const response = await axios.post(
      `https://live-mt-server.wati.io/461037/api/v1/sendTemplateMessage?whatsappNumber=${mobile}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${whatsapp_authorization_dev}`,
        },
      }
    );
    console.log('response');
    console.log(response);

    return response.data;
  } catch (error) {
    console.error('Error sending WATI message:', error.response?.data || error.message);
    return { error: error.response?.data || error.message };
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

module.exports = { createWhatsappMessage, bulk_users_meg_wati,createWhatsappMessageRegistration, createWhatsappfile, sendBookingNotification, createWhatsappOrderMessage,createNotificationMessage, createplacementDetailsMessage, sendWhatsappMessageToUser, LeadNotificationToStaff ,bulk_users_meg};
