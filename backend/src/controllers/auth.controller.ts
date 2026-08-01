import { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from "../models/user.model.js";
import { registerEmail, resetEmail } from "../utils/sendMail.utils.js";
import { generateOtp } from "../utils/genOtp.utils.js";
import { genAccessToken, genRefreshToken } from "../utils/token.utils.js";
import Session from "../models/session.model.js";
import Device from "../models/device.model.js";
import { UAParser } from "ua-parser-js";

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
        if ( existingUser )
        {
            existingUser.username = username;
            existingUser.password = password;
            existingUser.otp = otp;
            existingUser.otpExpiry = new Date( Date.now() + 5 * 60 * 1000 );
            existingUser.otpLastSent = new Date();
            await existingUser.save();
        } else
        {
            await User.create( {
                username,
                email,
                password: hashPass,
                otp,
                otpExpiry: new Date( Date.now() + 5 * 60 * 1000 ),
                otpLastSent: new Date()
            } );
        }
        await registerEmail( email, otp, username );
        res.status( 201 ).json( {
            message: "User Register Successfully, Please check your email for otp"
        } );
    } catch ( err )
    {
        next( err );
    }
};

export const resendOtp = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        let { email } = req.body;
        email = email.toLowerCase();
        const user = await User.findOne( { email } );
        if ( !user )
        {
            res.status( 404 ).json( {
                message: 'User Not Found Please Register your email first'
            } );
            return;
        }
        const now: any = new Date();
        if ( user.otpLastSent instanceof Date && now - user.otpLastSent.getTime() < 30000 )
        {
            res.status( 405 ).json( {
                message: 'OTP already sent, Please check your email '
            } );
            return;
        }
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = new Date( Date.now() + 5 * 60 * 10000 );
        user.otpLastSent = now;
        await user.save();
        res.status( 200 ).json( {
            message: 'Otp sent successfully'
        } );
        await registerEmail( email, otp, user?.username );
    } catch ( err )
    {
        next( err );
    }
};

export const verifyOtp = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const isProduction = process.env.NODE_ENV === 'production';
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
        const accessToken = genAccessToken( user );
        const refreshToken = genRefreshToken( user );
        await Session.create( {
            user: user._id,
            refreshToken
        } );
        const parser = new UAParser( req.headers[ 'user-agent' ] );
        const result = parser.getResult();
        const browser = result.browser.name || 'Unknown Browser';
        const os = result.os.name || 'Unknown Os';
        const device = result.device.type || 'Desktop';
        const ip = req.headers[ 'x-forwarded-for' ] || req.socket.remoteAddress;
        await Device.create( {
            user: user._id,
            browser,
            device,
            os,
            ip,
            token: accessToken,
            lastActive: new Date()
        } );
        res.cookie( 'refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000
        } );
        res.status( 200 ).json( {
            message: 'User verified successfully',
            accessToken,
            user: {
                name: user.username,
                email: user.email
            }
        } );
    } catch ( err )
    {
        next( err );
    }
};

export const login = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const isProduction = process.env.NODE_ENV === 'production';
        let { email, password } = req.body;
        email = email.toLowerCase();
        const user = await User.findOne( { email } );
        if ( !user )
        {
            res.status( 404 ).json( {
                message: 'User Not Found with this email, Please Register your email first'
            } );
            return;
        }
        if ( user && !user.isVerified )
        {
            res.status( 401 ).json( {
                message: 'The Given email is not verified please register and verify your email first'
            } );
            return;
        }
        const match = await bcrypt.compare( password, user.password );
        if ( !match )
        {
            res.status( 401 ).json( {
                message: 'Invalid password, Please enter the correct password'
            } );
            return;
        }
        const accessToken = genAccessToken( user );
        const refreshToken = genRefreshToken( user );
        await Session.create( {
            user: user._id,
            refreshToken
        } );
        const parser = new UAParser( req.headers[ 'user-agent' ] );
        const result = parser.getResult();
        const browser = result.browser.name || 'Unknown Browser';
        const os = result.os.name || 'Unknown Os';
        const device = result.device.type || 'Desktop';
        const ip = req.headers[ 'x-forwarded-for' ] || req.socket.remoteAddress;
        await Device.create( ( {
            user: user._id,
            browser,
            os,
            device,
            ip,
            token: accessToken,
            lastActive: new Date()
        } ) );
        res.cookie( 'refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000
        } );
        res.status( 200 ).json( {
            message: `Welcome Back ${ user.username }`,
            accessToken,
            user: {
                name: user.username,
                email: user.email
            }
        } );
    }
    catch ( err )
    {
        next( err );
    }
};

export const resetPassword = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        let { email, password, otp } = req.body;
        email = email.toLowerCase();
        const user = await User.findOne( { email } );
        if ( !user )
        {
            res.status( 400 ).json( {
                message: 'User Not Found'
            } );
            return;
        }
        if ( user && !user.isVerified )
        {
            res.status( 400 ).json( {
                message: 'Firstly Verify the User'
            } );
            return;
        }
        if ( !otp )
        {
            const otp = generateOtp();
            user.otp = otp;
            user.otpExpiry = new Date( Date.now() + 5 * 60 * 1000 );
            await user.save();
            await resetEmail( email, otp );
            res.status( 200 ).json( {
                message: 'OTP sent to your email please check the email'
            } );
            return;
        }
        else
        {
            if ( user.otp !== otp )
            {
                res.status( 400 ).json( {
                    message: 'Invalid OTP'
                } );
                return;
            }
            if ( user?.otpExpiry instanceof Date && user.otpExpiry.getTime() < Date.now() )
            {
                res.status( 400 ).json( {
                    message: 'OTP Expired'
                } );
            }
            const hashPass = await bcrypt.hash( password, 10 );
            user.password = hashPass;
            user.otp = null;
            user.otpExpiry = null;
            await user.save();
            res.status( 200 ).json( {
                message: 'Password Reset Successfully'
            } );
        }
    } catch ( err )
    {
        {
            next( err );
        }
    }
};
