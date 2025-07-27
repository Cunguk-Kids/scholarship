import { Hono } from 'hono';
import { uploadController } from '../controller/upload.controller';

export const ipfsRoute = new Hono();

ipfsRoute.post('/upload', uploadController);
