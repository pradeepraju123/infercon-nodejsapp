const { findCountry } = require('../utils/countryUtils');

exports.validatePhoneNumber = (req, res) => {
  try {
    const { countryName, phoneNumber } = req.body;
    
    if (!countryName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Both countryName and phoneNumber are required'
      });
    }

    const countryData = findCountry(countryName);
    
    if (!countryData) {
      return res.status(404).json({
        success: false,
        message: `Country '${countryName}' not found in our list`
      });
    }

    // Check for spaces
    if (/\s/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Spaces are not allowed in phone number',
        expectedFormat: `+${countryData.dial_code}XXXXXXXXXX`
      });
    }

    // Check for special characters (except + at start)
    if (/[^0-9+]/.test(phoneNumber) || (phoneNumber.match(/\+/g) || []).length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Special characters are not allowed in phone number',
        expectedFormat: `+${countryData.dial_code}XXXXXXXXXX`
      });
    }

    // Check if starts with country code
    const dialCode = countryData.dial_code.replace(/\D/g, '');
    if (!phoneNumber.startsWith(`+${dialCode}`)) {
      return res.status(400).json({
        success: false,
        message: `Phone number must start with country code +${dialCode}`,
        expectedFormat: `+${dialCode}XXXXXXXXXX`
      });
    }

    // Get the number part after country code
    const numberPart = phoneNumber.slice(`+${dialCode}`.length);
    
    // Check for zero after country code
    if (numberPart.startsWith('0')) {
      return res.status(400).json({
        success: false,
        message: 'Phone number cannot start with 0 after country code',
        expectedFormat: `+${dialCode}XXXXXXXXXX`
      });
    }

    // Check if remaining is all digits
    if (!/^\d+$/.test(numberPart)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must contain only digits after country code'
      });
    }

    // Validation passed
    return res.json({
      success: true,
      message: `Valid ${countryData.name} phone number`,
      formattedNumber: `+${dialCode}${numberPart}`,
      country: countryData
    });

  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during phone validation'
    });
  }
};