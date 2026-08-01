import mongoose from "mongoose";

export interface ISession extends mongoose.Document
{
    user: any;
    refreshToken: string;
    revoked: boolean;
}

const sessionSchema = new mongoose.Schema<ISession>( {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refreshToken: String,
    revoked: {
        type: Boolean,
        default: false
    }
} );

const Session = mongoose.model<ISession>( "Session", sessionSchema );

export default Session;