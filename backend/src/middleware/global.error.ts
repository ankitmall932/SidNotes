import { type Request, type Response, type NextFunction } from "express";

const validateError = ( err: any ) =>
{
    const errors = Object.values( err.errors ).map( ( el: any ) => el.message );
    return {
        statusCode: 400,
        message: errors.join( ", " )
    };
};
const castError = ( err: any ) =>
{
    return {
        statusCode: 400,
        message: `Invalid ${ err.path }:${ err.value }`
    };
};

const duplicateKeyError = ( err: any ) =>
{
    const field = Object.keys( err.keyValue )[ 0 ];
    return {
        statusCode: 400,
        message: `${ field } already exists`
    };
};

const jwtError = () =>
{
    return {
        statusCode: 401,
        message: 'Invalid Token please Login Again'
    };
};

export const globalErrorHandler = ( err: any, req: Request, res: Response, next: NextFunction ): void =>
{
    console.log( err );
    let error = { statusCode: err.statusCode || 500, message: err.message || 'Internal Server Error' };
    if ( err.name === "ValidationError" )
    {
        error = validateError( err );
    }
    if ( err.name === "CastError" )
    {
        error = castError( err );
    }
    if ( err.code === 11000 )
    {
        error = duplicateKeyError( err );
    }
    if ( err.name == "JsonWebTokenError" )
    {
        error = jwtError();
    }
    res.status( error.statusCode ).json( {
        success: false,
        message: error.message
    } );
};
