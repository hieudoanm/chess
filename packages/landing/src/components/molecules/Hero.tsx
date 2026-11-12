import Link from 'next/link';
import type { FC, ReactNode } from 'react';
import type { CTALink } from './CTA';

export interface HeroStat {
  value: string | number;
  label: string;
}

interface HeroProps {
  title: ReactNode;
  description: ReactNode;
  primary: CTALink;
  secondary?: CTALink;
  stats: HeroStat[];
  children?: ReactNode;
}

const HeroButton: FC<{ link: CTALink; className: string }> = ({
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

const Hero: FC<HeroProps> = ({
  title,
  description,
  primary,
  secondary,
  stats,
  children,
}) => (
  <section className="pt-20 pb-16">
    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 text-left lg:grid-cols-[1.05fr_1fr]">
      <div>
        <h1 className="text-base-content m-0 text-3xl leading-tight font-bold tracking-tight text-balance md:text-5xl">
          {title}
        </h1>
        <p className="text-base-content/60 mt-6 max-w-xl text-xl">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap justify-start gap-3">
          <HeroButton link={primary} className="btn btn-primary btn-lg" />
          {secondary && (
            <HeroButton link={secondary} className="btn btn-outline btn-lg" />
          )}
        </div>
        <dl className="mt-10 grid grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-base-content text-2xl font-bold tabular-nums">
                {stat.value}
              </dt>
              <dd className="text-base-content/60 m-0 text-sm">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
      {children}
    </div>
  </section>
);

export default Hero;
