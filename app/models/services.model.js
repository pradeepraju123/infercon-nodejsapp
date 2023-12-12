module.exports = mongoose => {
  const ServicesData = mongoose.model(
    "services_data",
    mongoose.Schema(
      {
        title: String,
        meta_title: String,
        keywords: String,
        meta_description: String,
        description: String,
        short_description: String,
        image: String,
        published: Boolean,
        comments: [
          {
            question: String,
            answer: String
          },
        ],
        questions_and_answers: [
          {
            question: String,
            answer: String,
          },
        ],
      },
      { timestamps: true }
    )
  );

  return ServicesData;
};
