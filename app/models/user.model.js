module.exports = mongoose => {

    const User = mongoose.model(
      "user",
      mongoose.Schema(
        {
          name: String,
          username: String,
          email: String,
          password: String,
          phone_number: Number,
          active: Boolean
        },
        { timestamps: true }
      )
    );
  
    return User;
  };