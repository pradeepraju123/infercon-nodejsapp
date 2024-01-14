module.exports = mongoose => {

    const Training = mongoose.model(
      "training",
      mongoose.Schema(
        {
          title: String,
          meta_title: String,
          keywords: String,
          meta_description: String,
          short_description: String,
          description: String,
          published: Boolean,
          image: String,
          slug: String,
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