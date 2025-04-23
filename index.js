var http = require('http');
const express = require("express");
const cors = require("cors");
const db = require("./app/models");
const app = express();

const { SuperfaceClient } = require('@superfaceai/one-sdk');

const sdk = new SuperfaceClient();
async function run(ip) {
  // Load the profile
  const profile = await sdk.getProfile("address/ip-geolocation@1.0.1");

  // Use the profile
  const result = await profile.getUseCase("IpGeolocation").perform(
    {
      ipAddress: ip
    },
    {
      provider: "ipdata",
      security: {
        apikey: {
          apikey: "65eb83e81e7f22df210cb1eaac5ea0abd103c04abc38908c2647864f"
        }
      }
    }
  );

  // Handle the result
  try {
    const data = result.unwrap();
    console.log(data)
    return data;
  } catch (error) {
    console.error(error);
  }
}

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/",async (req, res) => {
  res.json({ message: "Welcome to Infercon." });
  res.send(await run(req.ip));
});

require("./app/routes/blog.routes.js")(app);
require("./app/routes/generaldata.routes.js")(app);
require("./app/routes/services.routes.js")(app);
require("./app/routes/training.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/contact.routes.js")(app);
require("./app/routes/career.routes.js")(app);
require("./app/routes/registration.routes.js")(app);
require("./app/routes/booking.routes.js")(app);
require("./app/routes/order.routes.js")(app);
require("./app/routes/career-list.routes.js")(app);
require("./app/routes/placement.routes.js")(app);
require("./app/routes/facebook.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

