import dotenv from 'dotenv';
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log('NODE_ENV', NODE_ENV);
NODE_ENV === 'development' && dotenv.config();

import http from 'http';
import { HttpError } from 'http-errors';
import { Server, Socket } from 'socket.io';
import app from './app';
import logger from './libs/logger';
import { joinGame, move, notify } from './services/socket.service';
import { normalizePort, onError, onListening } from './utils/server';

// Get port from environment and store in Express.
const PORT = normalizePort(process.env.PORT || '8080');
app.set('port', PORT);

const httpServer = http.createServer(app);

const main = async () => {
  const io = new Server(httpServer, {
    cors: { origin: ['http://localhost:3000'], credentials: true },
  });

  io.on('connection', (socket: Socket) => {
    const { id, connected } = socket;
    logger.info({ id, connected }, 'Client is connected');

    socket.on('disconnect', () => logger.info('Client is disconnected'));

    socket.on('joinGame', (room: string) => joinGame(io, socket, room));

    socket.on('move', (room: string, boardState: any) => {
      move(io, socket, room, boardState);
    });

    socket.on('notification', (room: string, notification: string) => {
      notify(io, socket, room, notification);
    });
  });

  httpServer.listen(PORT);
  httpServer.on('listening', () => onListening(httpServer));
  httpServer.on('error', (error: HttpError) => onError(error, PORT));
};

main().catch((error: Error) => logger.error(error));

process.on('unhandledRejection', (reason: string) => {
  // I just caught an unhandled promise rejection,
  // since we already have fallback handler for unhandled errors (see below),
  // let throw and let him handle that
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  // I just received an error that was never handled, time to handle it and then decide whether a restart is needed
  logger.error(error);
  process.exit(1);
});
