import logger from '@hieudoanm/pino';
import { Server, Socket } from 'socket.io';

export const joinGame = (io: Server, socket: Socket, room: string) => {
  logger.info('room', { room });
  socket.join(room);
  io.to(room).emit('notification', socket.id, 'a user just joined');
};

export const move = (
  io: Server,
  socket: Socket,
  room: string,
  boardState: any
) => {
  io.to(room).emit('move', socket.id, boardState);
};

export const notify = (
  io: Server,
  socket: Socket,
  room: string,
  notification: string
) => {
  io.to(room).emit('notification', socket.id, notification);
};
