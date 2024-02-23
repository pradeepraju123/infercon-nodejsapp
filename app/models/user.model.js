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
          active: { type: Boolean, default: true },
          userType: { type: String, enum: ['normal', 'staff', 'admin'], default: 'normal' }, // Add userType field
        },
        { timestamps: true }
      )
    );
  
    return User;
  };