import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null if it's an external deposit or admin deposit action
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Transaction volume amount is required'],
        min: [1, 'Amount must be greater than zero']
    },
    type: {
        type: String,
        enum: ['transfer', 'deposit', 'withdrawal', 'admin_adjustment'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    reference: {
        type: String,
        required: true,
        unique: true // Guarantees no network glitch duplicate processing
    },
    description: {
        type: String,
        default: 'Wallet transaction'
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
