module.exports = mongoose => {
    const Contact = mongoose.model(
      "contactdetails",
      mongoose.Schema(
        {
          fullname: String,
          email: String,
          phone: String,
          courses: [],
          message: String,
          lead_status: String,
          assignee: String,
          source: String,
          additional_details: String,
          city: String,
          state: String,
          country: String
        },
        { timestamps: true }
      )
    );
    return Contact;
  };