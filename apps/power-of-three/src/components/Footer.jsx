import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-secondary/30 bg-card/20 backdrop-blur-md py-6 px-4 sm:px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p className="font-serif-display text-sm text-foreground/50 italic">
          The Power of Three &mdash; Quil Authors Guild &copy; {year}
        </p>
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="font-serif-display text-sm text-foreground/50 hover:text-primary transition-colors italic"
          >
            Home
          </Link>
          <Link
            to="/login"
            className="font-serif-display text-sm text-foreground/50 hover:text-primary transition-colors italic"
          >
            Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}
