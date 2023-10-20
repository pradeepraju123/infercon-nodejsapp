module.exports = mongoose => {
   
    const GeneralData = mongoose.model(
      "general_data",
      mongoose.Schema(
        {
          title: String,
          description: String,
          published: Boolean
        },
        { timestamps: true }
      )
    );
  
    return GeneralData;
  };