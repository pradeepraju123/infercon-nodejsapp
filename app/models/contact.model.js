module.exports = mongoose => {
    const Contact = mongoose.model(
      "contactdetails",
      mongoose.Schema(
        {
          fullname: String,
          phone_number:String,
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
          country: String,
          excel_upload: { type: Number, default: 0 } // Default value set to 0

        },
        { timestamps: true }
      )
    );
    return Contact;
  };