// Function to check if a string is a valid URL
function isValidUrl(str) {
    try {
      new URL(str);
      return true;
    } catch (err) {
      return false;
    }
  }
module.exports = { isValidUrl };