// model definition (already correct)
module.exports = mongoose => {
  const schema = new mongoose.Schema({
    course_id: { type: String, required: true, unique: true },
    template_title_first:{type: String, default: ''},
    template_title_second:{type: String, default: ''},
    template_title_third:{type: String, default: ''},
    course_content: { type: [String], required: true },
    imageUrl: { type: String, default: '' },
  }, { timestamps: true });

  return mongoose.model("message_template", schema);
};
