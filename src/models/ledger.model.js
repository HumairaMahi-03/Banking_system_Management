const mongoose =  require('mongoose');
const transactionModel = require('./transaction.model');


const ledgerSchema = new mongoose.Schema({  
    account :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Account reference is required'],
        index: true,
        immutable: true

    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: [true, 'Transaction reference is required'],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ['DEBIT', 'CREDIT'],
            message: "Type must be either 'DEBIT' or 'CREDIT'"
        },
        required: [true, 'Type is required'],
        immutable: true
    }

})


function preventLedgerModification(next) {
    if (!this.isNew) {
        const err = new Error('Ledger entries cannot be modified once created');
        next(err);
    } else {
        next();
    }
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('save', preventLedgerModification);
ledgerSchema.pre('insertMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);

const ledgerModel = mongoose.model('Ledger', ledgerSchema); 

module.exports = ledgerModel;

