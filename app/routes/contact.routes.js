module.exports = app => {
    const contact = require("../controllers/contact.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", contact.create);
    router.post("/create-with-creator", authenticateToken, contact.createwithcreator);
    // Retrieve all Tutorials
    router.post("/get", authenticateToken, contact.getAll);
    router.post("/getUnregistration",authenticateToken,contact.getNonRegisteredContacts)
     // Download contact details
     router.post("/download", contact.download);
    // Update a Tutorial with id
    router.post("/:id",  contact.update);

    router.get("/phonevalidation",contact.getAllContacts);

    router.get("/batches",contact.getPhoneNumbersInChunks)
    // Retrieve a single Tutorial with id
    router.get("/:id", contact.findOne);
    
    router.post("/action/update-many", authenticateToken, contact.updateBulk);

    router.post("/action/send-notification", contact.sendnotification);
   
    router.post("/action/send-message", contact.sendMessageToUser);
    
    router.post("/action/send-lead-details",contact.sendLeadDetailsToStaff);

    router.post('/contacts/:id/comments', contact.addComment);

   router.get('/contacts/:id/comments', contact.getComments);

   router.post("/:id/mark-registered", contact.markAsRegistered); // Mark a lead as registered
   
    router.post("/filter/registered",authenticateToken, contact.filterByRegistrationStatus); // Filter leads

  router.post("/action/on-assignee-select", contact.onAssigneeSelect);
    
    app.use('/api/v1/contact', router);
    
  };