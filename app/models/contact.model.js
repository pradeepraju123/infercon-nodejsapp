module.exports = mongoose => {
    const Contact = mongoose.model(
      "contactdetails",
      mongoose.Schema(
        {
          date_of_enquiry: String,
          fullname: String,
          location: [],
          phone_number:String,
          email: String,
          phone: String,
          courses: [],
          message: String,
          lead_status: String,
          assignee: String,
          source: String,
          degree: String,
          specification: String,
          year_of_study: Date,
          experience: String,
          is_msg: { type: String, enum: ['yes', 'no'], default: 'no' },
          is_call: { type: String, enum: ['yes', 'no'], default: 'no' },
          is_mail: { type: String, enum: ['yes', 'no'], default: 'no' },
          is_fee: { type: String, enum: ['yes', 'no'], default: 'no' },
          languages: [],
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