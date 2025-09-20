import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react(),
        {
          name: 'image-proxy',
          configureServer(server) {
            server.middlewares.use('/api/image-proxy', async (req, res) => {
              try {
                const u = new URL(req.url || '', 'http://localhost');
                const target = u.searchParams.get('url');
                if (!target) {
                  res.statusCode = 400;
                  res.end('Missing url');
                  return;
                }
                const up = await fetch(target);
                if (!up.ok) {
                  res.statusCode = up.status;
                  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                  res.end(await up.text());
                  return;
                }
                const ab = await up.arrayBuffer();
                res.statusCode = 200;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', up.headers.get('content-type') || 'image/png');
                res.end(Buffer.from(ab));
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.end(`Proxy error: ${e?.message || e}`);
              }
            });
          },
          configurePreviewServer(server) {
            server.middlewares.use('/api/image-proxy', async (req, res) => {
              try {
                const u = new URL(req.url || '', 'http://localhost');
                const target = u.searchParams.get('url');
                if (!target) {
                  res.statusCode = 400;
                  res.end('Missing url');
                  return;
                }
                const up = await fetch(target);
                if (!up.ok) {
                  res.statusCode = up.status;
                  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                  res.end(await up.text());
                  return;
                }
                const ab = await up.arrayBuffer();
                res.statusCode = 200;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', up.headers.get('content-type') || 'image/png');
                res.end(Buffer.from(ab));
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.end(`Proxy error: ${e?.message || e}`);
              }
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // Provider switching and Qwen endpoints
        'process.env.IMAGE_PROVIDER': JSON.stringify(env.IMAGE_PROVIDER || 'google'),
        'process.env.QWEN_IMAGE_API_GENERATE': JSON.stringify(env.QWEN_IMAGE_API_GENERATE || ''),
        'process.env.QWEN_IMAGE_API_EDIT': JSON.stringify(env.QWEN_IMAGE_API_EDIT || ''),
        'process.env.QWEN_API_KEY': JSON.stringify(env.QWEN_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
