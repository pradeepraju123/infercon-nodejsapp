const db = require("../models");
const Contact = db.contact;
const moment = require("moment-timezone");



// Dashboard API: fetch upcoming followups + new enrollments
exports.getDashboardData = async (req, res) => {
  try {
    const now = moment().startOf('day'); 
    const twoDaysAgo = moment().subtract(2, 'days').startOf('day');

    // Only upcoming followups (today or future)
    const followupLeads = await Contact.find({
      lead_status: "Followup",
      followup_date: { $gte: now.toDate() }   // only today and later
    })
      .sort({ followup_date: 1, followup_time: 1 })
      .limit(10);

       // Format the time before sending response
    const formattedFollowups = followupLeads.map(lead => ({
      ...lead._doc,
      followup_time: lead.followup_time 
    }));

    // New Enrollments (last 10)
    const newEnrollments = await Contact.find({
  lead_status: "New lead",
  createdAt: { $gte: twoDaysAgo.toDate() }
})
  .sort({ createdAt: -1 })
  .limit(10);

     const stats = {
      totalLeads: await Contact.countDocuments({}),
      registeredLeads: await Contact.countDocuments({ isRegistered: 1 }),
      // Using is_fee field instead of paymentStatus
      paidLeads: await Contact.countDocuments({ is_fee: "yes" }),
      rejectedLeads: await Contact.countDocuments({ lead_status: "Not interested" })
    };

    console.log('Training Stats:', stats)

    res.status(200).json({
      status_code: 200,
      message: "Dashboard data fetched successfully",
      data: {
        followupLeads,
        newEnrollments,
        trainingStats: stats 
      }
    });
  } catch (err) {
    console.error("Dashboard API Error:", err);
    res.status(500).json({
      status_code: 500,
      message: "Failed to fetch dashboard data"
    });
  }
};