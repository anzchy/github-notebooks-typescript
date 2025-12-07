import fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { env } from './config/env';

import { noteRoutes } from './routes/note.routes';

const app = fastify({
  logger: true,
});

// Setup Zod validation for Fastify
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Register Plugins
app.register(cors, {
  origin: '*', // Adjust in production
});

// Register Routes
app.register(noteRoutes, { prefix: '/api/notes' });

// Basic Health Check Route
app.get('/', async () => {
  return { 
    status: 'ok', 
    system: 'GitHub Issues Notebook System (TypeScript)',
    timestamp: new Date().toISOString() 
  };
});

// Start Server
const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`
    ╔══════════════════════════════════════╗
    ║   GitHub Issues Notebook System (TS) ║
    ║   Running on http://${env.HOST}:${env.PORT}   ║
    ╚══════════════════════════════════════╝
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
