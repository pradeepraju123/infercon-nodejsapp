module.exports = mongoose => {
    const Booking = mongoose.model(
      "booking_details",
      mongoose.Schema(
        {
          fullname: String,
          email: String,
          phone: String,
          date: String,
          time: String,
          message: String,
          assignedTo: String,
        },
        { timestamps: true }
      )
    );
    return Booking;
  };