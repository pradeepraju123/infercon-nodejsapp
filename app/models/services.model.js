module.exports = mongoose => {
    const ServicesData = mongoose.model(
      "services_data",
      mongoose.Schema(
        {
          title: String,
          description: String,
          image: String,
          published: Boolean
        },
        { timestamps: true }
      )
    );
  
    return ServicesData;
  };