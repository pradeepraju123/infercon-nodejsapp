module.exports = mongoose => {
    const Order = mongoose.model(
      "orderdetails",
      mongoose.Schema(
        {
          fullname: String,
          email: String,
          phone: String,
          courses: String,
          amount: String,
          mode: String,
          country: String,
          state: String,
          order_status : String
        },
        { timestamps: true }
      )
    );
    return Order;
  };