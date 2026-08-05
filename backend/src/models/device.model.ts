import mongoose from "mongoose";

export interface IDevice
{
    user: any;
    browser: string;
    device: string;
    os: string;
    ip: any;
    token: string;
    lastActive: Date;
}

const deviceSchema = new mongoose.Schema<IDevice>( {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    browser: String,
    os: String,
    device: String,
    ip: String,
    token: String,
    lastActive: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true,
    } );

const Device = mongoose.model<IDevice>( "Device", deviceSchema );

export default Device;