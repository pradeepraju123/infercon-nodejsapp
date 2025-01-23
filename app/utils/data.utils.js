// Function to check if a string is a valid URL
function isValidUrl(str) {
    try {
      new URL(str);
      return true;
    } catch (err) {
      return false;
    }
  }

let LocationMap = {
    "south_india":["Tamil Nadu", "Andhra Pradesh","Andra Pradesh", "Kerala", "Karnataka", "Pondicherry", "Telangana"],
    "north_india":["Jammu and Kashmir","Himachal Pradesh","Punjab","Chandigarh","Uttarakhand","Haryana","Delhi",
                    "Rajasthan","Uttar Pradesh","Bihar","Sikkim","Arunachal Pradesh","Nagaland","Manipur","Mizoram",
                    "Tripura","Meghalaya","Assam","West Bengal","Jharkhand","Odisha","Chhattisgarh","Madhya Pradesh", "Gujarat",
                  "Daman and Diu","Dadar and Nagar Haveli","Maharashtra","Goa","Lakshadweep Islands",
                   "Andaman and Nicobar Islands","Ladakh"],
  }
module.exports = { isValidUrl, LocationMap };


