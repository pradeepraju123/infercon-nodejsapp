module.exports = mongoose => {

    const Training = mongoose.model(
      "training",
      mongoose.Schema(
        {
          title: String,
          description: String,
          published: Boolean,
          image: String
        },
        { timestamps: true }
      )
    );
  
    return Training;
  };