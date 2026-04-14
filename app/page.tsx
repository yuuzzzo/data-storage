'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>DataStorage</h1>
          <p className={styles.subtitle}>Gerenciar seus dados</p>
          <p className={styles.subtitle}>Developed by: Yuri-DEV</p>
        </div>

        <div className={styles.buttonsGrid}>
          <Link href="/dashboard/links" className={styles.buttonLink}>
            <button
              className={`${styles.navButton} ${styles.button} ${styles.buttonPrimary}`}
            >
              <span className={styles.buttonIcon}>🔗</span>
              <span className={styles.buttonLabel}>Links</span>
            </button>
          </Link>

          <Link href="/dashboard/files" className={styles.buttonLink}>
            <button
              className={`${styles.navButton} ${styles.button} ${styles.buttonSecondary}`}
            >
              <span className={styles.buttonIcon}>📁</span>
              <span className={styles.buttonLabel}>Files</span>
            </button>
          </Link>

          <Link href="/dashboard/acess" className={styles.buttonLink}>
            <button
              className={`${styles.navButton} ${styles.button} ${styles.buttonTertiary}`}
            >
              <span className={styles.buttonIcon}>🔐</span>
              <span className={styles.buttonLabel}>Access</span>
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.footer}>
        Version 1.0 • Premium Storage Solution
      </div>
    </div>
  );
}
