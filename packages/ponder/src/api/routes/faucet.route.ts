import { Hono } from 'hono';
import { validate } from '../middlewares/zod.middleware';
import { faucetController } from '../controller/faucet.controller';
import { faucetSchema } from '../validators/faucet.validation';

export const faucetRoute = new Hono();

faucetRoute.post('/', validate(faucetSchema), faucetController);
