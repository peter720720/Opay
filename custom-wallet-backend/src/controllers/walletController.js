import axios from 'axios';
import crypto from 'crypto';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { internalWalletBank, supportedBanks } from '../config/supportedBanks.js';

const fallbackBanks = [internalWalletBank, ...supportedBanks];

// @desc    Get all commercial banks supported for verification
// @route   GET /api/wallet/banks
export const getAllBanks = async (req, res) => {
    if (!process.env.FINTECH_PROVIDER_BASE_URL || !process.env.FINTECH_SECRET_KEY) {
        return res.status(200).json({
            success: true,
            providerConfigured: false,
            data: fallbackBanks
        });
    }

    try {
        // Query authorized provider infrastructure for live banking details
        const response = await axios.get(`${process.env.FINTECH_PROVIDER_BASE_URL}/bank`, {
            headers: {
                Authorization: `Bearer ${process.env.FINTECH_SECRET_KEY}`
            }
        });

        if (response.data && response.data.status) {
            // Returns a clean list containing bank names and official bank codes
            return res.status(200).json({ success: true, data: response.data.data });
        }
        return res.status(400).json({ error: 'Unable to fetch bank networks' });
    } catch (error) {
        console.error('Bank provider lookup failed:', error.message);
        return res.status(200).json({
            success: true,
            providerConfigured: true,
            fallback: true,
            data: fallbackBanks
        });
    }
};

// @desc    Fetch beneficiary account owner name
// @route   POST /api/wallet/resolve-beneficiary
export const resolveBeneficiary = async (req, res) => {
    const { accountNumber, bankCode } = req.body;

    if (!/^\d{10}$/.test(String(accountNumber || '')) || !bankCode) {
        return res.status(400).json({ error: 'Account number and bank code required' });
    }

    try {
        // Intercept local lookups instantly if searching your own in-app network account numbers
        if (bankCode === 'INTERNAL_WALLET' || bankCode === '999999') {
            const localUser = await User.findOne({ accountNumber });
            if (localUser) {
                return res.status(200).json({ success: true, accountName: localUser.fullName });
            }

            return res.status(404).json({ error: 'This account is not registered in the OPay Wallet network' });
        }

        if (!process.env.FINTECH_PROVIDER_BASE_URL || !process.env.FINTECH_SECRET_KEY) {
            return res.status(503).json({ error: 'Bank provider is not configured' });
        }

        // Otherwise, resolve via standard external infrastructure routing
        const response = await axios.get(`${process.env.FINTECH_PROVIDER_BASE_URL}/bank/resolve`, {
                params: { account_number: accountNumber, bank_code: bankCode },
                headers: {
                    Authorization: `Bearer ${process.env.FINTECH_SECRET_KEY}`
                }
            });

        if (response.data && response.data.status) {
            return res.status(200).json({
                success: true,
                accountName: response.data.data.account_name
            });
        }
        return res.status(404).json({ error: 'Account holder details could not be matched' });
    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            return res.status(502).json({ error: 'Bank provider authorization failed. Update FINTECH_SECRET_KEY.' });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({
                error: 'Paystack test-mode account lookup limit reached. Use a Paystack test bank code such as 001, wait for the limit to reset, or use an approved live key.'
            });
        }

        return res.status(502).json({ error: 'Bank provider could not verify this account right now' });
    }
};

// @desc    Process P2P internal funds transfers between system users
// @route   POST /api/wallet/transfer
export const internalTransfer = async (req, res) => {
    const { receiverAccountNumber, amountInKobo, description } = req.body;
    const senderId = req.user._id;

    if (!/^\d{10}$/.test(String(receiverAccountNumber || '')) ||
        !Number.isSafeInteger(amountInKobo) || amountInKobo <= 0) {
        return res.status(400).json({ error: 'Valid receiver account and positive integer amount required' });
    }

    try {
        const receiver = await User.findOne({ accountNumber: receiverAccountNumber });

        if (!receiver) return res.status(404).json({ error: 'Receiver account number invalid' });
        if (receiver._id.equals(senderId)) {
            return res.status(400).json({ error: 'Cannot send money to yourself' });
        }

        // Generate atomic references to prevent network double spending glitches
        const reference = 'TRF-' + crypto.randomBytes(8).toString('hex').toUpperCase();

        // Debit only when the current balance can cover the transfer.
        const sender = await User.findOneAndUpdate(
            { _id: senderId, balance: { $gte: amountInKobo } },
            { $inc: { balance: -amountInKobo } },
            { new: true }
        );
        if (!sender) return res.status(400).json({ error: 'Insufficient wallet balance tokens' });

        await User.findByIdAndUpdate(receiver._id, { $inc: { balance: amountInKobo } });

        // Commit permanent footprint audit trail entry
        const transaction = await Transaction.create({
            sender: senderId,
            receiver: receiver._id,
            amount: amountInKobo,
            type: 'transfer',
            status: 'completed',
            reference,
            description: description || 'Wallet Transfer Execution'
        });

        return res.status(200).json({ success: true, message: 'Transfer successful', data: transaction });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// @desc    Get the authenticated user's transaction history
// @route   GET /api/wallet/transactions
export const getTransactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        })
            .populate('sender', 'fullName accountNumber')
            .populate('receiver', 'fullName accountNumber')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
