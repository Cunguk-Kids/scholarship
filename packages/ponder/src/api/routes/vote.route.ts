import { Hono } from 'hono';
import { voteController } from '../controller/vote.controller';
import { validate } from '../middlewares/zod.middleware';
import { voterSchema } from '../validators/vote.validator';

export const voteRoute = new Hono();

voteRoute.post('/', validate(voterSchema), voteController);
