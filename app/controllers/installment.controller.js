const mongoose = require("mongoose");

const ExcelJS = require('exceljs');
const xlsx = require('xlsx');
const db = require("../models");
const config = require("../config/config.js");
// const coursePath = require('../data/courseInfo.json');
const path = require('path');
const fs = require('fs');
const MessageTemplate = db.message_template;



const User = db.users
const Contacts = db.contact
const { hashPassword, generateToken, verifyPassword } = require('../utils/auth.utils.js');
const {bulk_users_meg } = require('../utils/whatsapp.utils.js');
  exports.userupdate = (req, res) => {
      console.log(" userupdate API hit with body:", req.body);
    
      const { id, totalAmount, noofinstallment } = req.body;
    
      if (!id) {
        return res.status(400).json({ message: "id is required" });
      }
    
      User.findByIdAndUpdate(
        id,
        { totalAmount, noofinstallment },
        { new: true }
      )
        .then(data => {
          if (!data) {
            console.log("⚠️ No user found for id:", id);
            res.status(404).json({
              status_code: 404,
              message: `Cannot update User with id=${id}. Maybe User was not found!`
            });
          } else {
            console.log("✅ User updated successfully:", data);
            res.status(200).json({
              status_code: 200,
              message: "User was updated successfully",
              data
            });
          }
        })
        .catch(err => {
          console.error("❌ Error while updating user:", err.message);
          res.status(500).json({
            status_code: 500,
            message: "Error updating User with id=" + id,
            error: err.message
          });
        });
    };
  

  