import express from '@hieudoanm/express';

import { RegisterRoutes } from './routes';

const app = express({ cors: true });

RegisterRoutes(app);

export default app;
