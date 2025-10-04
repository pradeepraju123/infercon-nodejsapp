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
    installmentType: {
            type: String,
            enum: ['auto', 'manual'],
            default: 'manual'
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
        paymentDate: Date,
            customAmount: {
                type: Boolean,
                default: false
            },
            customDueDate: {
                type: Boolean,
                default: false
            },
            paidAmount: {
                type: Number,
                default: 0
            },
            notes: String
        }],
    paymentHistory: [{
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        },
        paymentMethod: String,
        reference: String,
        installmentIndex: Number,
        notes: String
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
schema.pre('save', function(next) {
        this.updatedAt = Date.now();
        
        // Auto-update overdue status before saving
        const today = new Date();
        let hasOverdue = false;
        let totalPaid = 0;
        
        this.installments.forEach(installment => {
            // Update overdue status
            if (installment.status === 'pending' && installment.dueDate < today) {
                installment.status = 'overdue';
                hasOverdue = true;
            }
            
            // Calculate total paid amount
            if (installment.status === 'paid') {
                totalPaid += installment.amount;
            } else if (installment.status === 'partially_paid') {
                totalPaid += installment.paidAmount;
            }
        });
        
        // Update overall amounts
        this.pendingAmount = this.totalAmount - totalPaid;
        this.pendingInstallments = this.installments.filter(inst => 
            ['pending', 'overdue', 'partially_paid'].includes(inst.status)
        ).length;
        
        // Update overall status
        if (this.pendingAmount <= 0) {
            this.overallStatus = 'completed';
        } else if (hasOverdue) {
            this.overallStatus = 'overdue';
        } else if (totalPaid > 0) {
            this.overallStatus = 'partially_paid';
        } else {
            this.overallStatus = 'pending';
        }
        
        next();
    });
return mongoose.model('Installment', schema);
}
