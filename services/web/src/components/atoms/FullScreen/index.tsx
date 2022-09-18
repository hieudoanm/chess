import React, { ReactNode } from 'react';

type FullScreenProps = { children?: ReactNode };

const FullScreen: React.FC<FullScreenProps> = ({ children = <></> }) => {
  return <div className="w-screen h-screen">{children}</div>;
};

FullScreen.displayName = 'FullScreen';
FullScreen.defaultProps = { children: <></> };

export default FullScreen;
