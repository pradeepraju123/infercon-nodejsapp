module.exports = app => {
  const dashboard = require("../controllers/dashboard.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
  const router = require("express").Router();
  // Dashboard API
  router.get("/", authenticateToken,dashboard.getDashboardData);
  app.use("/api/v1/dashboard", router);
};