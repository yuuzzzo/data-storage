"use client";

import Link from "next/link";
import styles from "../page.module.css";

export default function DashboardPage() {
  return (
    <main className={styles.container}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Data Storage</h1>
            <p className={styles.subtitle}>
              Organize seus arquivos, links e acessos seguramente em um único lugar.
            </p>
          </div>
          <span className={styles.status}>Developed by: YURI-DEV</span>
        </header>

        <div className={styles.gridContainer}>
          <Link href="/dashboard/files" className={styles.cardLink}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📁 Gerenciar Arquivos</h2>
              <p className={styles.cardDescription}>
                Envie e gerencie seus arquivos no storage com segurança.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/links" className={styles.cardLink}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>🔗 Gerenciar Links</h2>
              <p className={styles.cardDescription}>
                Organize e acesse todos os seus links importantes aqui.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/acess" className={styles.cardLink}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>🔐 Gerenciar Acessos</h2>
              <p className={styles.cardDescription}>
                Mantenha suas senhas seguras e criptografadas no banco.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
