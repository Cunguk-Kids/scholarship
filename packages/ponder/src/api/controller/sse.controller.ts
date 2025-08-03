import { Context } from "hono";

const sseClients: WritableStreamDefaultWriter[] = [];

export const sseController = async (c: Context) => {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  sseClients.push(writer);

  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');

  await writer.write(`retry: 10000\n\n`);

  c.executionCtx.waitUntil(
    readable.pipeTo(new WritableStream({
      close() {
        const i = sseClients.indexOf(writer);
        if (i !== -1) sseClients.splice(i, 1);
      },
      abort() {
        const i = sseClients.indexOf(writer);
        if (i !== -1) sseClients.splice(i, 1);
      }
    }))
  );

  return new Response(readable, {
    headers: c.res.headers,
  });
};

export const sendSseToAll = (event: string, data: any) => {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const writer of sseClients) {
    writer.write(message).catch((err) => {
      console.error('SSE client write error:', err);
    });
  }
};