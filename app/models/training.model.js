module.exports = mongoose => {

    const Training = mongoose.model(
      "training",
      mongoose.Schema(
        {
          title: String,
          meta_title: String,
          keywords: String,
          meta_description: String,
          courses_type: String,
          sub_type: String,
          short_description: String,
          description: String,
          published: Boolean,
          featured: Boolean,
          image: String,
          second_image: String,
          related_trainings: [],
          certificate_image: String,
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
          ],
          additional_details: [
            {
              super_title: String,
              super_description: String,
              title: String,
              detail: String,
              type_detail: String
            }
          ]
        },
        { timestamps: true }
      )
    );
  
    return Training;
  };