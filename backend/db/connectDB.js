import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error Connecting to MongoDB: ${error.message}`);
        console.log('Please ensure MongoDB is running locally on port 27017');
        process.exit(1);
    }
}