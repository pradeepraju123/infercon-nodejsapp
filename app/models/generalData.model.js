module.exports = mongoose => {
   
    const GeneralData = mongoose.model(
      "general_data",
      mongoose.Schema(
        {
          title: String,
          description: String,
          image: String,
          short_description: String,
          published: Boolean,
          type_: String
        },
        { timestamps: true }
      )
    );
  
    return GeneralData;
  };