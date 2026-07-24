import transporter from "./mailer.utils.js";


export const registerEmail = async ( email: string, otp: string, username: string ) =>
{
    try
    {
        await transporter.sendMail( {
            from: `"SidNotes" <${ process.env.MAIL_FROM }>`,
            to: email,
            subject: `Your OTP for SidNotes Email Verification`,
            html: `<h1>Hello ${ username }</h1>
            <h2>This is your Account Registration otp from SidNotes</h2> 
            <h3>${ otp }</h3>`
        } );
    } catch ( err: any )
    {
        throw new Error( err );
    }
};