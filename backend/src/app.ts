import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';


const app = express();
app.set( 'trust proxy', 1 );
app.use( helmet() );
app.use( cors( {

} ) );
app.use( morgan( 'dev' ) );
app.use( express.json() );


export default app;