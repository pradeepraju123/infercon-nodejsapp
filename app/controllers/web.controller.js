const db = require("../models");
const { createfacebook_leads } = require("../utils/whatsapp.utils");
const FacebookLead = db.facebook;

// Create a new Facebook Lead
exports.create = (req, res) => {
  const { fullname, phone } = req.body;


    const lead = new FacebookLead({ fullname, phone });
    lead.save()
    .then(data => {
        createfacebook_leads(data.fullname, data.phone)
      res.status(201).json({ status_code: 201, message: "Facebook_leads created successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while Generating query." });
    });
    };