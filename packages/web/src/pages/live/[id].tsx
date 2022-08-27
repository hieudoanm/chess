import { NextPage } from 'next';
import { useRouter } from 'next/router';
import GameTemplate from '../../components/templates/GameTemplate';
import { useSocket } from '../../contexts/SocketContext';
import useEffectOnce from '../../hooks/useEffortOnce';

const LivePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const socket = useSocket();

  useEffectOnce(() => {
    if (socket && socket.connected) {
      console.log('id', id);

      socket.emit('joinGame', id);

      socket.on('notification', (socketId: string, notification: string) => {
        if (socketId !== socket.id) console.log('notification', notification);
      });
    }
  });

  return <GameTemplate id={id?.toString() || ''} />;
};

export default LivePage;
