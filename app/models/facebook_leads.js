module.exports = mongoose => {
    const facebook = mongoose.model(
      "facebook_leads",
      mongoose.Schema(
        {
          fullname: String,
          email: String,
          phone: String,
          job_title:String
        },
        { timestamps: true }
      )
    );
    return facebook;
  };