module.exports = mongoose => {
    const Placements = mongoose.model(
      "placement_details",
      mongoose.Schema(
        {
          fullname: String,
          student_code: String,
          email: String,
          phone: String,
          job_id: String,
        },
        { timestamps: true }
      )
    );
    return Placements;
  };