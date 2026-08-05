import mongoose from "mongoose";

export interface ITopic
{
    user: any,
    topic: string,
    completed: boolean;
}

const topicSchema = new mongoose.Schema<ITopic>( {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
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

const Topic = mongoose.model<ITopic>( 'Topic', topicSchema );

export default Topic;