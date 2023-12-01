module.exports = mongoose => {
    const Career = mongoose.model(
      "career_details",
      mongoose.Schema(
        {
          fullname: String,
          email: String,
          phone: String,
          position: String,
          resume: String,
          coverletter: String
        },
        { timestamps: true }
      )
    );
    return Career;
  };