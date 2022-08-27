import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import { RegisterRoutes } from './routes';

const app = express();
app.use(json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

RegisterRoutes(app);

export default app;
