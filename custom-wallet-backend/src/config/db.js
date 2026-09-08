import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🍃 MongoDB Connected Safely: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        // Exit system process with failure if database cannot connect
        process.exit(1); 
    }
};

export default connectDB;
