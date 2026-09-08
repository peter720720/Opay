import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import crypto from 'crypto';

// @desc    Fund a user account (Credit adjustment entry)
// @route   POST /api/admin/fund-user
export const fundUserAccount = async (req, res) => {
    const { targetAccountNumber, amountInKobo, reason } = req.body;

    if (!/^\d{10}$/.test(String(targetAccountNumber || '')) ||
        !Number.isSafeInteger(amountInKobo) || amountInKobo <= 0) {
        return res.status(400).json({ error: 'Target account and positive adjustment value required' });
    }

    try {
        const user = await User.findOne({ accountNumber: targetAccountNumber });
        if (!user) {
            return res.status(404).json({ error: 'Wallet holder account record not found' });
        }

        // Adjust balance securely by acting strictly on full integers.
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $inc: { balance: amountInKobo } },
            { new: true }
        );

        // Create an open audit trail listing the credit event
        const reference = 'ADM-' + crypto.randomBytes(8).toString('hex').toUpperCase();
        const transaction = await Transaction.create({
            sender: req.user._id, // Tracks which admin initialized this funding event
            receiver: user._id,
            amount: amountInKobo,
            type: 'admin_adjustment',
            status: 'completed',
            reference,
            description: reason || 'Administrative Credit Provision'
        });

        return res.status(200).json({
            success: true,
            message: `Successfully allocated funds to ${user.fullName}`,
            newBalance: updatedUser.balance,
            auditLog: transaction
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
