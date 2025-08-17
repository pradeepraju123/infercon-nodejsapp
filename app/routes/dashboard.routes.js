module.exports = app => {
  const dashboard = require("../controllers/dashboard.controller.js");
  const router = require("express").Router();
  // Dashboard API
  router.get("/", dashboard.getDashboardData);
  app.use("/api/v1/dashboard", router);
};