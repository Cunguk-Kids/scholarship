import { Hono } from 'hono';
import { uploadController, uploadERC721Controller } from '../controller/upload.controller';

export const ipfsRoute = new Hono();

ipfsRoute.post('/upload', uploadController);
ipfsRoute.post('/upload/erc-721', uploadERC721Controller);
