import Container from '@mui/material/Container';
import React from 'react';
import FullScreen from '../../atoms/FullScreen';
import Board from '../../organisms/Board';

type GameTemplateProps = {
  id: string;
};

const GameTemplate: React.FC<GameTemplateProps> = ({ id }) => {
  return (
    <FullScreen>
      <Container className="h-full">
        <div className="flex items-center justify-center h-full">
          <Board id={id} />
        </div>
      </Container>
    </FullScreen>
  );
};

export default GameTemplate;
