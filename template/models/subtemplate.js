// models/subtemplate.js
module.exports = mongoose => {
  const schema = new mongoose.Schema({
    course_id: { type: String, required: true }, // Reference to the main course
    title: { type: String, required: true },
    content: { type: [String], required: true },
    order: { type: Number, required: true }, // To maintain sequence
    imageUrl: { type: String, default: '' },
  }, { timestamps: true });

  return mongoose.model("subtemplate", schema);
};