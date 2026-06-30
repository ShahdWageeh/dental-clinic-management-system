import mongoose from 'mongoose';

const cached = globalThis.mongooseConnection || {
    conn: null,
    promise: null
};

globalThis.mongooseConnection = cached;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI environment variable is not defined');
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongooseInstance) => {
            console.log('MongoDB connected successfully');
            return mongooseInstance.connection;
        });
    }

    try{
        cached.conn = await cached.promise;
        return cached.conn;
    }catch(error){
        cached.promise = null;
        console.error('MongoDB connection failed:', error.message);
        throw error
    }
}

export default connectDB;
