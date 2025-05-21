module.exports = mongoose => {
  const schema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    course_content: { type: [String], required: true },
    imageUrl: { type: String } // renamed to imageUrl to match usage
  }, { timestamps: true });

  return mongoose.model("message_template", schema);
};
