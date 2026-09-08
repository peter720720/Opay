import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please add a full name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email address'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Automatically hides password from API response arrays for security
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // The working wallet balance (stored securely in kobo/cents to avoid floating point math errors)
    balance: {
        type: Number,
        default: 0, 
        min: [0, 'Balance cannot drop below zero']
    },
    accountNumber: {
        type: String,
        unique: true,
        sparse: true // Allows creation of admin accounts without requiring unique account numbers
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt tracking
});

// Middleware: Auto-encrypt passwords using bcrypt before saving to the database
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Helper Method: Safely match entered password against encrypted hash during login
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
