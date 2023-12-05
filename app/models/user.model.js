const { INTEGER } = require("sequelize");

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
          active: Boolean,
          type: Number
        },
        { timestamps: true }
      )
    );
  
    return User;
  };