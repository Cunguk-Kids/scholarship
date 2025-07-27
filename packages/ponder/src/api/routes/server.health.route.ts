import { Hono } from 'hono';
import { serverHealthController } from '../controller/health.controller';

export const serverHealthRoute = new Hono();

serverHealthRoute.get('/', serverHealthController);
