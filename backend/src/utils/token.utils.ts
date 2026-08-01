import jwt from 'jsonwebtoken';

export const genAccessToken = ( user: any ) =>
{
    const secret = process.env.JWT_SECRET_TOKEN;
    if ( !secret )
    {
        throw new Error( 'JWT secret is not defined' );
    }
    return jwt.sign( {
        id: user._id
    },
        secret,
        {
            expiresIn: '15m'
        } );
};

export const genRefreshToken = ( user: any ) =>
{
    const secret = process.env.JWT_REFRESH_TOKEN;
    if ( !secret )
    {
        throw new Error( 'JWT Refresh token is not defined' );
    }
    return jwt.sign( {
        id: user._id
    },
        secret,
        {
            expiresIn: '7d'
        } );
};