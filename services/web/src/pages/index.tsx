import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { nanoid } from 'nanoid';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import FullScreen from '../components/atoms/FullScreen';

const HomePage: NextPage = () => {
  const [engineId] = useState<string>(nanoid());
  const [liveId] = useState<string>(nanoid());

  return (
    <FullScreen>
      <Container className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-4">
          <div className="flex items-end md:items-center">
            <Link href={`/engine/${engineId}`}>
              <Button type="button" variant="outlined" className="w-full">
                Play Engine
              </Button>
            </Link>
          </div>
          <div className="flex items-start md:items-center">
            <Link href={`/live/${liveId}`}>
              <Button type="button" variant="outlined" className="w-full">
                Play Online
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </FullScreen>
  );
};

export default HomePage;
