module.exports=mongoose=>{
    const schema = new mongoose.Schema({
    contactRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
            contactDetails: {
               name: String,
                email: String,
               phone: String
           },
           assignedTo: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "users",  // assuming "users" collection stores staff/admin
  required: false
},
    
    // All registration fields stored directly
    modeOfEducation: String,
    courses: [String],
    firstname: String,
    middlename: String,
    lastname: String,
    bday: Date,
    gender: String,
    address: String,
    email: String,
    mobile: String,
    additionalMobile: String,
    workMobile: String,
    company: String,
    comments: String,
    education: String,
    industryexp: String,
    yearsOfExp: Number,
    governmentId: String,
    currencyType: String,
    feesCurrency: Number,
    document: String,
    
    // Installment specific fields
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    pendingAmount: {
        type: Number,
        default: 0
    },
    pendingInstallments: {
        type: Number,
        default: 0
    },
    perInstallmentAmount: {
        type: Number,
        default: 0
    },
    overallStatus: {
        type: String,
        enum: ['pending', 'partially_paid', 'completed', 'cancelled'],
        default: 'pending'
    },
    installments: [{
        amount: {
            type: Number,
            required: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'overdue'],
            default: 'pending'
        },
        paymentDate: Date
    }],
    paymentHistory: [{
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        },
        paymentMethod: String,
        reference: String
    }],
    lastPaymentAmount: Number,
    lastPaymentDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// installmentSchema.pre('save', function(next) {
//     this.updatedAt = Date.now();
//     next();
// });

return mongoose.model('Installment', schema);
}
