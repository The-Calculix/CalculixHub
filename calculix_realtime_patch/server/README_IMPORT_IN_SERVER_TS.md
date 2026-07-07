Add this to your existing server.ts or src/server.ts:

import express from 'express';
import cors from 'cors';
import { userDataRouter } from './routes/userData';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', userDataRouter);

Do not paste the service-role key into frontend files.
