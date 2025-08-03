import { Hono } from 'hono';
import { minSseController, sseController } from '../controller/sse.controller';

export const sseRoute = new Hono();

sseRoute.get('/', sseController);
sseRoute.get('/min', minSseController);
