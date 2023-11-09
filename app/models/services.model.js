module.exports = mongoose => {
  const ServicesData = mongoose.model(
    "services_data",
    mongoose.Schema(
      {
        title: String,
        description: String,
        short_description: String,
        image: String,
        published: Boolean,
        frequently_asked_question: [
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
