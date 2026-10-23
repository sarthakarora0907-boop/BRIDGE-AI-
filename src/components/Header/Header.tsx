'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun, Menu, X, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './Header.module.css';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#examples', label: 'Examples' },
  { href: '#about', label: 'About' },
];

interface HeaderProps {
  goal?: string;
}

export default function Header({ goal }: HeaderProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="Bridge AI — Home">
          <span className={styles.logoIcon} aria-hidden="true">
            <Zap size={18} />
          </span>
          <span className={styles.logoText}>
            Bridge<span className={styles.logoAccent}>AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {goal ? (
            <div
              className={`hidden lg:block truncate max-w-xs ${styles.goalContainer}`}
              title={`Your goal: ${goal}`}
            >
              <span className={styles.goalLabel}>Your goal:</span>{' '}
              <span className={styles.goalValue}>{goal}</span>
            </div>
          ) : (
            <div
              className={`hidden lg:block truncate max-w-xs ${styles.goalContainer}`}
              style={{ display: 'none' }}
              aria-hidden="true"
            >
              <span className={styles.goalLabel}>Your goal:</span>
            </div>
          )}
          <ul role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.navLink}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-icon"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile menu toggle */}
          <button
            className={`btn btn-ghost btn-icon ${styles.menuButton}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          className={styles.mobileNav}
          aria-label="Mobile navigation"
        >
          <ul role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
