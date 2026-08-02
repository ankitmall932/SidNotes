import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { type TokenPayload } from '../types/tokenPayload.js';

export const protect = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const authHeader = req.headers.authorization;
        if ( !authHeader || !authHeader.startsWith( 'Bearer ' ) )
        {
            res.status( 401 ).json( {
                message: 'Token Not Found'
            } );
            return;
        }
        const token = authHeader.split( ' ' )[ 1 ];
        if ( !token )
        {
            res.status( 401 ).json( {
                message: 'Token Not Found'
            } );
            return;
        }
        const secret = process.env.JWT_SECRET_TOKEN;
        if ( !secret )
        {
            throw new Error( 'JWT secret is not defined' );
        }
        const decoded = jwt.verify( token, secret ) as TokenPayload;
        const user = await User.findById( decoded.id ).select( '-password' );
        if ( !user )
        {
            res.status( 401 ).json( {
                message: 'User not found'
            } );
            return;
        }
        req.user = user;
        req.token = token;
        next();
    } catch ( err )
    {
        next( err );
    }
};
