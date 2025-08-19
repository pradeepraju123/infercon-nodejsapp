const db = require("../models");
const Contact = db.contact;
const moment = require("moment-timezone");
const User=db.users


// Dashboard API: fetch upcoming followups + new enrollments
exports.getDashboardData = async (req, res) => {
  try {
    const { followupPage = 1, followupLimit = 10, enrollmentsPage = 1, enrollmentsLimit = 10 } = req.query;
    
    const now = moment().tz('Asia/Kolkata').startOf('day');
    const twoDaysAgo = moment().tz('Asia/Kolkata').subtract(2, 'days').startOf('day');
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: "User not found."
      });
    }

    const isAdmin = user.userType === 'admin';

    // Followup query condition
    const followupCondition = {
      lead_status: "Followup",
      followup_date: { $gte: now.toDate() }
    };

    // New enrollments query condition
    const newEnrollmentsCondition = {
      lead_status: "New lead",
      createdAt: { $gte: twoDaysAgo.toDate() }
    };

    if (!isAdmin) {
      followupCondition.$or = [
        { assignee: user.name },
        { assignee: user.username }
      ];
      newEnrollmentsCondition.$or = [
        { assignee: user.name },
        { assignee: user.username }
      ];
    }

    // Calculate skip values for pagination
    const followupSkip = (followupPage - 1) * followupLimit;
    const enrollmentsSkip = (enrollmentsPage - 1) * enrollmentsLimit;

    // Get total counts for pagination metadata
    const totalFollowups = await Contact.countDocuments(followupCondition);
    const totalEnrollments = await Contact.countDocuments(newEnrollmentsCondition);

    // Upcoming followups with pag-ination
    const followupLeads = await Contact.find(followupCondition)
      .sort({ followup_date: 1, followup_time: 1 })
      .skip(followupSkip)
      .limit(parseInt(followupLimit));

    // New Enrollments with pagination
    const newEnrollments = await Contact.find(newEnrollmentsCondition)
      .sort({ createdAt: -1 })
      .skip(enrollmentsSkip)
      .limit(parseInt(enrollmentsLimit));

    // Stats condition
    const statsCondition = isAdmin ? {} : {
      $or: [
        { assignee: user.name },
        { assignee: user.username }
      ]
    };

    const stats = {
      totalLeads: await Contact.countDocuments(statsCondition),
      registeredLeads: await Contact.countDocuments({ 
        ...statsCondition,
        isRegistered: 1 
      }),
      paidLeads: await Contact.countDocuments({ 
        ...statsCondition,
        is_fee: "yes" 
      }),
      rejectedLeads: await Contact.countDocuments({ 
        ...statsCondition,
        lead_status: "Not interested" 
      })
    };

    res.status(200).json({
      status_code: 200,
      message: "Dashboard data fetched successfully",
      data: {
        followupLeads,
        newEnrollments,
        trainingStats: stats,
        pagination: {
          followups: {
            total: totalFollowups,
            page: parseInt(followupPage),
            limit: parseInt(followupLimit),
            pages: Math.ceil(totalFollowups / followupLimit)
          },
          enrollments: {
            total: totalEnrollments,
            page: parseInt(enrollmentsPage),
            limit: parseInt(enrollmentsLimit),
            pages: Math.ceil(totalEnrollments / enrollmentsLimit)
          }
        }
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