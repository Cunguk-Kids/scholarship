import { Hono } from 'hono';
import { sseController } from '../controller/sse.controller';

export const sseRoute = new Hono();

sseRoute.get('/', sseController);
