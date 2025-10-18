module.exports = mongoose => {
  const Schema = mongoose.Schema;

  const FeeSchema = new Schema({
    amount: { type: Number, default: 0 },
    date: { type: String, default: "" }
  }, { _id: false }); 

  const Contact = mongoose.model(
    "contactdetails",
    mongoose.Schema(
      {
        date_of_enquiry: String,
        fullname: String,
        location: [],
        email: String,
        phone: String,
        courses: [],
        message: String,
        lead_status: String,
        followup_date: Date,
        followup_time: String, 
        assignee: String,
        assigned_date: Date,
        assigned_time: String,
        source: String,
        degree: String,
        fees: {
          type: [FeeSchema],
          default: []
        },   
        specification: String,
        year_of_study: Date,
        experience: String,
        is_msg: { type: String, enum: ['yes', 'no'], default: 'no' },
        is_call: { type: String, enum: ['yes', 'no'], default: 'no' },
        is_mail: { type: String, enum: ['yes', 'no'], default: 'no' },
        is_fee: { type: String, enum: ['yes', 'no'], default: 'no' },
        isRegistered: { type: Boolean, default: false },
        languages: [],
        additional_details: String,
        city: String,
        state: String,
        country: String,
        excel_upload: { type: Number, default: 0 },
        
      
        student_code: String,
        course: String,        
        course_name: String,
        staff_name: String,
        total_amount: { type: Number, default: 0 },
        vilt_cilt: String,
        outstanding: { type: Number, default: 0 },
        remarks: String,
        
        
        bank_charges: { 
          type: Number, 
          default: 0 
        },
        bank_charges_date: { 
          type: Date 
        },
        
        comments: [{
          texts: String,
          createdBy: String,
          createdAt: {
            type: Date,
            default: Date.now
          }
        }],
        createdBy: {
          type: String,
          default: 'System'
        },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        deletedBy: { type: String } 
      },
      { timestamps: true }
    )
  );
  return Contact;
};