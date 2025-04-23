module.exports = mongoose => {
    const facebook = mongoose.model(
      "facebook_leads",
      mongoose.Schema(
        {
          fullname: String,
          phone: String
        },
        { timestamps: true }
      )
    );
    return facebook;
  };