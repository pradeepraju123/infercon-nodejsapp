// utils/phoneValidation.js
const { findCountry } = require('./countryUtils');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

exports.validatePhoneNumber = (countryName, phoneNumber) => {
  // 1. Check if required fields exist
  if (!countryName || !phoneNumber) {
    return { valid: false, message: "Country and phone number are required." };
  }

  // 2. Find country data
  const countryData = findCountry(countryName);
  if (!countryData) {
    return { valid: false, message: `Country '${countryName}' not found.` };
  }

  // 3. Check if phone contains only digits
  if (!/^\d+$/.test(phoneNumber)) {
    return { valid: false, message: "Only digits allowed (no +, spaces, or special characters)" };
  }

  // 4. Check if phone starts with country dial code
  const cleanDialCode = countryData.dial_code.replace(/\D/g, '');
  if (!phoneNumber.startsWith(cleanDialCode)) {
    return { 
      valid: false, 
      message: `Phone must start with country code: ${cleanDialCode}.` 
    };
  }

  // 5. Check if national number starts with '0' (invalid in many countries)
  const nationalNumber = phoneNumber.slice(cleanDialCode.length);
  if (nationalNumber.startsWith('0')) {
    return { 
      valid: false, 
      message: "Phone cannot start with '0' after country code." 
    };
  }

  // 6. Validate with libphonenumber
  const phoneObj = parsePhoneNumberFromString(`+${phoneNumber}`, countryData.code);
  
  if (!phoneObj?.isPossible()) {
    return { valid: false, message: "Invalid phone number length." };
  }

  if (!phoneObj?.isValid()) {
    return { valid: false, message: "Invalid phone number format." };
  }

  // 7. Return success
  return {
    valid: true,
    message: "Valid phone number.",
    formattedNumber: phoneNumber,
    countryCode: cleanDialCode,
    nationalNumber,
    country: countryData
  };
};