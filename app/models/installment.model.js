module.exports = mongoose => {
    const schema = new mongoose.Schema({
        contactRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
        contactDetails: {
            name: String,
            email: String,
            phone: String
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
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
            enum: ['pending', 'partially_paid', 'completed', 'cancelled', 'overdue'],
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
                enum: ['pending', 'paid', 'overdue', 'partially_paid'],
                default: 'pending'
            },
            due_amount: { type: Number, default: 0 },
            paymentDate: Date,
             paymentDates: [{
                date: {
                    type: Date,
                    default: Date.now
                },
                amount: Number,
                paymentMethod: String,
                reference: String,
                notes: String
            }],
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
            notes: String,
            due_amount_after_payment: Number,
            payment_type: {
                type: String,
                enum: ['full', 'partial', 'overdue', 'adjustment'],
                default: 'full'
            },
            previous_due_amount: Number,
            installment_amount: Number,
            remaining_balance: Number
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

    schema.pre('save', function(next) {
        this.updatedAt = Date.now();
        
        // Auto-update overdue status before saving
        const today = new Date();
        let hasOverdue = false;
        let totalPaid = 0;
        
        this.installments.forEach((installment, index) => {
            // Update overdue status
            if (installment.status === 'pending' && installment.dueDate < today) {
                const wasNotOverdue = installment.status !== 'overdue';
                installment.status = 'overdue';
                
                // Record overdue status in payment history
                if (wasNotOverdue) {
                    this.paymentHistory.push({
                        amount: 0, // No payment, just status change
                        date: new Date(),
                        paymentMethod: 'system',
                        reference: `OVERDUE_${Date.now()}`,
                        installmentIndex: index,
                        notes: `Installment marked as overdue | Due amount: ${installment.due_amount}`,
                        due_amount_after_payment: installment.due_amount,
                        payment_type: 'overdue',
                        previous_due_amount: installment.due_amount,
                        installment_amount: installment.amount,
                        remaining_balance: this.pendingAmount
                    });
                }
                
                hasOverdue = true;
            }
            
            // Calculate total paid amount
            if (installment.status === 'paid') {
                totalPaid += installment.amount;
            } else if (installment.status === 'partially_paid') {
                totalPaid += (installment.paidAmount ||0);
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
        } else if (totalPaid > 0 && this.pendingAmount < this.totalAmount) {
            this.overallStatus = 'partially_paid';
        } else {
            this.overallStatus = 'pending';
        }
        
        // Ensure due_amount is always calculated
        this.installments.forEach(installment => {
            installment.due_amount = installment.amount - (installment.paidAmount || 0);
        });
        
        next();
    });
    
    return mongoose.model('Installment', schema);
};