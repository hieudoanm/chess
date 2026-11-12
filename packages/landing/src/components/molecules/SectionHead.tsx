import type { FC, ReactNode } from 'react';

interface SectionHeadProps {
  title: string;
  description: ReactNode;
}

const SectionHead: FC<SectionHeadProps> = ({ title, description }) => (
  <div className="mx-auto mb-12 max-w-2xl text-center">
    <h2 className="text-base-content m-0 text-3xl leading-tight font-bold tracking-normal text-balance">
      {title}
    </h2>
    <p className="text-base-content/60 mt-3 text-lg">{description}</p>
  </div>
);

SectionHead.displayName = 'SectionHead';

export default SectionHead;
