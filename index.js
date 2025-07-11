var http = require('http');
const express = require("express");
const cors = require("cors");
const db = require("./app/models");
const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));
require('./cronJobs');


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
require("./app/routes/templates.routes.js")(app);


// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

