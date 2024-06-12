module.exports = mongoose => {
    const CareerList = mongoose.model(
    "career_list",
    mongoose.Schema(
      {
        job_id : String,
        company_name : String,
        job_title : String,
        experience : String,
        work_location: String,
        job_description : String,
        skills : String,
        published: Boolean
      }
    )
  );
  return CareerList;
  };