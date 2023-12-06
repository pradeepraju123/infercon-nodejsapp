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
          document: String
        },
        { timestamps: true }
      )
    );
    return Registration;
  };