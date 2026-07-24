import { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from "../models/user.model.js";
import { registerEmail } from "../utils/sendMail.utils.js";
import { generateOtp } from "../utils/genOtp.utils.js";

export const register = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        let { username, password, email } = req.body;
        email = email.toLowerCase();
        const existingUser = await User.findOne( { email } );
        if ( existingUser && existingUser.isVerified )
        {
            res.status( 400 ).json( {
                message: "User already exist with this email. Please login"
            } );
            return;
        }
        const hashPass = await bcrypt.hash( password, 10 );
        const otp = generateOtp();
        let user;
        if ( existingUser )
        {
            existingUser.username = username;
            existingUser.password = password;
            existingUser.otp = otp;
            existingUser.otpExpiry = new Date( Date.now() + 5 * 60 * 1000 );
            existingUser.otpLastSent = new Date();
            await existingUser.save();
            user = existingUser;
        } else
        {
            user = await User.create( {
                username,
                email,
                password: hashPass,
                otp,
                otpExpiry: new Date( Date.now() + 5 * 60 * 1000 ),
                otpLastSent: new Date()
            } );
        }
        await registerEmail( email, otp, user.username );
        res.status( 201 ).json( {
            message: "User Register Successfully, Please check your email for otp"
        } );
    } catch ( err )
    {
        next( err );
    }
};

export const verifyOtp = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        let { email, otp } = req.body;
        email = email.toLowerCase();
        const user = await User.findOne( { email } );
        if ( !user )
        {
            res.status( 404 ).json( {
                message: 'User not found please register your email'
            } );
            return;
        }
        if ( user?.isVerified )
        {
            res.status( 400 ).json( {
                message: 'User is already verified please login '
            } );
            return;
        }
        if ( user?.otp !== otp )
        {
            res.status( 400 ).json( {
                message: 'Invalid OTP Please enter the correct otp'
            } );
            return;
        }
        if ( user?.otpExpiry instanceof Date && user.otpExpiry.getTime() < Date.now() )
        {
            res.status( 400 ).json( {
                message: 'OTP expired. Please request a new OTP'
            } );
            return;
        }
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        user.otpLastSent = null;
        await user.save();
        res.status( 200 ).json( {
            message: 'User verified successfully'
        } );
    } catch ( err )
    {
        next( err );
    }
};
