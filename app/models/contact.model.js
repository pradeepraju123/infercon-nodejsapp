module.exports = mongoose => {
    const Contact = mongoose.model(
      "contactdetails",
      mongoose.Schema(
        {
          fullname: String,
          email: String,
          phone: String,
          courses: [],
          message: String
        },
        { timestamps: true }
      )
    );
    return Contact;
  };