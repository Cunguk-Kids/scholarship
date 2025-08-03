import { Hono, Context } from 'hono';
import { streamSSE } from 'hono/streaming';
type SSEStream = {
  write: (payload: { event?: string; data: string; id?: string; }) => Promise<void>;
};

const clients: SSEStream[] = [];

export const sseController = (c: Context) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');

  return streamSSE(c, async (stream) => {
    const sseClient: SSEStream = {
      write: (data) => stream.writeSSE(data),
    };
    clients.push(sseClient);

    await stream.writeSSE({ event: 'init', data: 'connected' });

    const heartbeat = setInterval(() => {
      void stream.writeSSE({ data: '💓' });
    }, 15000);

    c.req.raw.signal?.addEventListener('abort', () => {
      const i = clients.indexOf(sseClient);
      if (i !== -1) clients.splice(i, 1);
      clearInterval(heartbeat);
    });

    await new Promise(() => { });
  });
};

export const sendSseToAll = async (event: string, data: unknown) => {
  for (const client of clients) {
    await client.write({
      data: JSON.stringify(data),
      event: event,
      id: String(Date.now()),
    });
  }
};

export const minSseController = async (c: Context) => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(`retry: 10000\n\n`));
      const interval = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(`event: ping\ndata: ${Date.now()}\n\n`));
      }, 3000);

      c.executionCtx.waitUntil(
        new Promise((resolve) => {
          stream.cancel = () => {
            clearInterval(interval);
            resolve(undefined);
            return Promise.resolve();
          };
        })
      );
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    }
  });
};



