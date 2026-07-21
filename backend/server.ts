import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

connectDB();

app.listen( process.env.PORT, () =>
{
    console.log( `app is listen on port ${ process.env.PORT }` );
} );
