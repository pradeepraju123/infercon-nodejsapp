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
exports.updateinstallment = (req, res) => {
    console.log("✅ updateinstallment API hit with body:", req.body);
    return res.json({ message: "Route is working!", body: req.body });
};

  