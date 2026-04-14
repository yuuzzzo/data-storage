"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../../files/page.module.css";

interface LinkData {
  id: string;
  url: string;
  titulo?: string;
}

export default function SavedLinksPage() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLinks() {
      try {
        const response = await fetch("/api/links", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Erro ao carregar links");
        }

        const data: LinkData[] = await response.json();
        setLinks(data);
      } catch (error) {
        console.error(error);
        setError("Não foi possível carregar os links salvos.");
      } finally {
        setLoading(false);
      }
    }

    loadLinks();
  }, []);

  return (
    <main className={styles.container}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Links Salvos</h1>
            <p className={styles.subtitle}>
              Veja todos os seus links e abra-os quando precisar.
            </p>
          </div>
          <span className={styles.status}>Lista atualizada</span>
        </header>

        <div className={styles.filesSection}>
          <h2 className={styles.filesTitle}>Links disponíveis</h2>

          {loading && <p className={styles.emptyMessage}>Carregando links...</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {!loading && !error && links.length === 0 && (
            <p className={styles.emptyMessage}>
              Nenhum link salvo ainda. Volte para cadastrar links novos.
            </p>
          )}

          {!loading && links.length > 0 && (
            <div className={styles.filesList}>
              {links.map((link) => (
                <div key={link.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{link.titulo || link.url}</span>
                    <span className={styles.fileType}>{link.url}</span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.downloadButton}
                  >
                    Abrir
                  </a>
                </div>
              ))}
            </div>
          )}

          <Link href="/dashboard/links" className={styles.backButton}>
            Cadastrar novo link
          </Link>
        </div>
      </section>
    </main>
  );
}
