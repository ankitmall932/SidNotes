import mongoose from 'mongoose';

const connectDB = async () =>
{
    if ( !process.env.MONGO_URI )
    {
        throw new Error( 'Mongo Uri is missing' );
    }
    await mongoose.connect( process.env.MONGO_URI );
    console.log( 'DB connected successfully' );
};

export default connectDB;