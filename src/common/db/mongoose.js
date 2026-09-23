import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URL, {serverSelectionTimeoutMS: 10000});
