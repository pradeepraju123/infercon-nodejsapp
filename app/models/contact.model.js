module.exports = mongoose => {
    const Contact = mongoose.model(
      "contactdetails",
      mongoose.Schema(
        {
          date_of_enquiry: String,
          fullname: String,
          location: [],
          email: String,
          phone: String,
          courses:[],
          message: String,
          lead_status: String,
          followup_date: Date,
          followup_time: String, 
          assignee: String,
          assigned_date:Date,
          assigned_time:String,
          source: String,
          degree: String,
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
          excel_upload: { type: Number, default: 0 }, // Default value set to 0
          comments:[{texts:String,
            createdBy: String,
            createdAt:{
              type:Date,
              default:Date.now
            }
          }],
          createdBy: {
          type: String,
          default: 'System' // Default value if not specified
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