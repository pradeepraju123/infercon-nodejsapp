module.exports = mongoose => {

    const Training = mongoose.model(
      "training",
      mongoose.Schema(
        {
          title: String,
          short_description: String,
          description: String,
          published: Boolean,
          image: String,
          event_details: [
            {
              title: String,
              detail: String
            },
          ],
          systems_used: [
            {
              title : String,
              detail: String
            }
          ]
        },
        { timestamps: true }
      )
    );
  
    return Training;
  };