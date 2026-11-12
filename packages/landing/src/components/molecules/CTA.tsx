import Link from 'next/link';
import type { FC, ReactNode } from 'react';

export interface CTALink {
  label: string;
  href: string;
  external?: boolean;
}

interface CTAProps {
  title: string;
  description: ReactNode;
  primary: CTALink;
  secondary?: CTALink;
}

const CTAButton: FC<{ link: CTALink; className: string }> = ({
  link,
  className,
}) =>
  link.external ? (
    <a href={link.href} target="_blank" rel="noreferrer" className={className}>
      {link.label}
    </a>
  ) : link.href.startsWith('#') ? (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );

const CTA: FC<CTAProps> = ({ title, description, primary, secondary }) => (
  <section className="bg-base-200 py-20">
    <div className="mx-auto w-full max-w-6xl px-5 text-center">
      <h2 className="text-base-content m-0 text-3xl leading-tight font-bold tracking-normal text-balance">
        {title}
      </h2>
      <div className="text-base-content/60 mt-3 text-lg">{description}</div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <CTAButton link={primary} className="btn btn-accent btn-lg" />
        {secondary && (
          <CTAButton link={secondary} className="btn btn-outline btn-lg" />
        )}
      </div>
    </div>
  </section>
);

export default CTA;
