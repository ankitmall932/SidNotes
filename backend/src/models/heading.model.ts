import mongoose from "mongoose";

export interface IHeading
{
    user: any,
    topic: any,
    heading: string,
    body: string,
    completed: boolean;
}

const headingSchema = new mongoose.Schema<IHeading>( {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    heading: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
} );

const Heading = mongoose.model<IHeading>( 'Heading', headingSchema );

export default Heading;