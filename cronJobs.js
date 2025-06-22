// cronJobs.js
const cron = require('node-cron');
const db = require("./app/models");
const path = require('path');
const Contacts = db.contact


cron.schedule('0 10 * * *', async () => {
    console.log('Running scheduled WhatsApp reset task...');
  
    try {
      // Update all contacts where is_msg is true → set it to false
      const result = await Contacts.updateMany(
        { is_msg: true },
        { $set: { is_msg: false } }
      );
  
      console.log(`Updated ${result.modifiedCount} contacts.`);
    } catch (err) {
      console.error('Error in cron:', err);
    }
  });
