import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { globalErrorHandler } from './middleware/global.error.js';
import authRouter from './routes/auth.routes.js';
import topicRouter from './routes/topic.routes.js';


const app = express();
app.set( 'trust proxy', 1 );
app.use( cookieParser() );
app.use( helmet() );
app.use( cors( {

} ) );
app.use( morgan( 'dev' ) );
app.use( express.json() );

app.use( "/api/auth", authRouter );
app.use( '/topic', topicRouter );

app.use( globalErrorHandler );

export default app;