// model definition (already correct)
module.exports = mongoose => {
  const schema = new mongoose.Schema({
    course_id: { type: String, required: true, unique: true },
    course_content: { type: [String], required: true },
    imageUrl: { type: String }
  }, { timestamps: true });

  return mongoose.model("message_template", schema);
};
