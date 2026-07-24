import mongoose from 'mongoose';

export interface IUser extends mongoose.Document
{
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    otp: string | null;
    otpExpiry: Date | null;
    otpLastSent: Date | null;
}

const userSchema = new mongoose.Schema<IUser>( {
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date
    },
    otpLastSent: {
        type: Date
    }
},
    { timestamps: true }
);

const User = mongoose.model<IUser>( "User", userSchema );

export default User;