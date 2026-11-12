import type { FC } from 'react';
import { PiGithubLogo } from 'react-icons/pi';

interface FooterProps {
  name: string;
  tagline: string;
  githubUrl: string;
}

const Footer: FC<FooterProps> = ({ name, tagline, githubUrl }) => (
  <footer className="border-base-content/10 border-t">
    <div className="text-base-content/50 mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-5 py-6 text-xs">
      <span>
        © {new Date().getFullYear()} {name}
      </span>
      <span>{tagline}</span>
      <nav aria-label="Footer" className="ml-auto flex items-center gap-5">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary inline-flex items-center gap-1.5 font-semibold transition-colors">
          <PiGithubLogo className="h-4 w-4" />
          GitHub
        </a>
        <a
          href={`${githubUrl}#readme`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary font-semibold transition-colors">
          README
        </a>
      </nav>
    </div>
  </footer>
);

Footer.displayName = 'Footer';

export default Footer;
