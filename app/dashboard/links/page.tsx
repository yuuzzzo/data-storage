"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../files/page.module.css";

interface LinkData {
  id: string;
  url: string;
  titulo?: string;
}

export default function LinksPage() {
  const [url, setUrl] = useState("");
  const [titulo, setTitulo] = useState("");
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const handleSaveLink = async () => {
    if (!url.trim()) return alert("Informe a URL do link.");

    setPosting(true);
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, titulo }),
      });

      if (!response.ok) throw new Error("Erro ao salvar o link");

      alert("Link salvo com sucesso!");
      setUrl("");
      setTitulo("");
      loadLinks();
    } catch (error) {
      console.error(error);
      alert("Falha ao salvar o link");
    } finally {
      setPosting(false);
    }
  };

  const loadLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/links", { cache: "no-store" });
      if (!response.ok) throw new Error("Erro ao carregar links");
      const data: LinkData[] = await response.json();
      setLinks(data);
    } catch (error) {
      console.error(error);
      alert("Falha ao carregar links");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Gerenciar Links</h1>
            <p className={styles.subtitle}>
              Cadastre e veja seus links salvos com o mesmo estilo dos arquivos.
            </p>
          </div>
          <span className={styles.status}>Pronto para cadastrar</span>
        </header>

        <div className={styles.form}>
          <label className={styles.inputWrapper}>
            <input
              className={styles.input}
              type="text"
              placeholder="Título do link (opcional)"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </label>

          <label className={styles.inputWrapper}>
            <input
              className={styles.input}
              type="url"
              placeholder="URL do link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>

          <button type="button" className={styles.button} onClick={handleSaveLink} disabled={posting}>
            {posting ? "Salvando..." : "Salvar link"}
          </button>
          <Link href="/dashboard/links/saved" className={styles.button}>
            Ver Links Salvos
          </Link>
          <Link href="/dashboard" className={styles.backButton}>
            Voltar ao Dashboard
          </Link>
          <p className={styles.note}>Organize seus links com o mesmo visual do storage de arquivos.</p>
        </div>

        {links.length > 0 && (
          <div className={styles.filesSection}>
            <h2 className={styles.filesTitle}>Links Salvos</h2>
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
          </div>
        )}
      </section>
    </main>
  );
}
