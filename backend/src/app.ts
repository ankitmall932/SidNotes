import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { globalErrorHandler } from './middleware/global.error.js';
import authRouter from './routes/auth.routes.js';


const app = express();
app.set( 'trust proxy', 1 );
app.use( helmet() );
app.use( cors( {

} ) );
app.use( morgan( 'dev' ) );
app.use( express.json() );

app.use( "/api/auth", authRouter );

app.use( globalErrorHandler );

export default app;