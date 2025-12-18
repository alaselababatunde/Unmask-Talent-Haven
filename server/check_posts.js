import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';

dotenv.config({ path: './server/.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const checkPosts = async () => {
    await connectDB();

    try {
        const count = await Post.countDocuments();
        console.log(`Total posts: ${count}`);

        const posts = await Post.find().sort({ createdAt: -1 }).limit(5);
        console.log('Latest 5 posts:');
        posts.forEach(p => {
            console.log(`- ID: ${p._id}, Type: ${p.mediaType}, User: ${p.user}, Created: ${p.createdAt}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

checkPosts();
