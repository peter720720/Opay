import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { generateUniqueAccountNumber } from '../config/walletUtils.js';

// Helper function to sign JSON Web Tokens
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new wallet user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'Email address already registered' });
        }

        // Admin accounts must be provisioned separately; public signup always creates a user.
        const accountNumber = await generateUniqueAccountNumber();

        const user = await User.create({
            fullName,
            email,
            password,
            role: 'user',
            accountNumber,
            balance: 0 // Starts empty, balances are kept as integers (Kobo/Cents)
        });

        return res.status(201).json({
            success: true,
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            accountNumber: user.accountNumber,
            token: generateToken(user._id)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Explicitly pull the hidden password field for verification
        const user = await User.findOne({ email }).select('+password');
        
        if (user && (await user.matchPassword(password))) {
            return res.status(200).json({
                success: true,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                accountNumber: user.accountNumber,
                balance: user.balance,
                token: generateToken(user._id)
            });
        } else {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// @desc    Get user profile data
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            return res.status(200).json({
                success: true,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                accountNumber: user.accountNumber,
                balance: user.balance
            });
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
