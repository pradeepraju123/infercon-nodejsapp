module.exports = mongoose => {
    const Registration = mongoose.model(
      "registration_details",
      mongoose.Schema(
        {
          modeOfEducation: String,
          courses: [],
          firstname: String,
          middlename: String,
          lastname: String,
          bday: String,
          gender: String,
          address: String,
          email: String,
          mobile: String,
          additionalMobile: String,
          workMobile: String,
          company: String,
          comments: String,
          education: String,
          industryexp: String,
          yearsOfExp: String,
          governmentId: String,
          currencyType: String,
          feesCurrency: String,
          document: String,
    //        contactRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    //         contactDetails: {
    //             name: String,
    //             email: String,
    //             phone: String
    //         },
    //         totalAmount: Number,
    //         pendingAmount: Number,
    //         pendingInstallments: Number,
    //         perInstallmentAmount: Number,
    //         lastPaymentAmount: Number,
    //         lastPaymentDate: Date,
    //         paymentHistory: [{
    //             amount: Number,
    //             date: Date
    //         }],
    //         installments: [{
    //         amount: Number,       // e.g., 10000 (₹10,000)
    //         dueDate: Date,        // When payment is due
    //         status: {             // Tracks payment status
    //             type: String,
    //             enum: ["pending", "paid", "overdue"],
    //             default: "pending"
    //         },
    //     paymentDate: Date,    // When actually paid
    //     // transactionId: String // Optional: For payment reference
    // }],
    // overallStatus: {
    //     type: String,
    //     enum: ["pending", "partially_paid", "completed"],
    //     default: "pending"
    // }
         },
        { timestamps: true }
      )
    );
    return Registration;
  };