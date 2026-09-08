import User from '../models/User.js';

// Generates an initial random 10-digit account string and ensures it's mathematically unique across your collection
export const generateUniqueAccountNumber = async () => {
    let isUnique = false;
    let accountNumber = '';

    while (!isUnique) {
        // Generate a random 10 digit number starting with 9 (common for virtual bank accounts)
        accountNumber = '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
        
        // Query database to ensure no overlap collision occurs
        const existingAccount = await User.findOne({ accountNumber });
        if (!existingAccount) {
            isUnique = true;
        }
    }
    return accountNumber;
};
