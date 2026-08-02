import mongoose from 'mongoose';

export interface IUser
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
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    otpLastSent: {
        type: Date,
        default: null
    }
},
    { timestamps: true }
);

const User = mongoose.model<IUser>( "User", userSchema );

export default User;