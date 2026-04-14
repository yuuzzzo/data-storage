"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../page.module.css";

interface FileData {
  id: string;
  nome: string;
  storagePath: string;
  tipo: string;
}

export default function SavedFilesPage() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFiles() {
      try {
        const response = await fetch("/api/files", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Erro ao carregar arquivos");
        }

        const data: FileData[] = await response.json();
        setFiles(data);
      } catch (error) {
        console.error(error);
        setError("Não foi possível carregar os arquivos salvos.");
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, []);

  return (
    <main className={styles.container}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Arquivos Salvos</h1>
            <p className={styles.subtitle}>
              Veja os arquivos já enviados ao storage e baixe-os quando quiser.
            </p>
          </div>
          <span className={styles.status}>Lista atualizada</span>
        </header>

        <div className={styles.filesSection}>
          <h2 className={styles.filesTitle}>Arquivos disponíveis para download</h2>

          {loading && <p className={styles.emptyMessage}>Carregando arquivos...</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {!loading && !error && files.length === 0 && (
            <p className={styles.emptyMessage}>
              Nenhum arquivo salvo ainda. Volte para enviar um arquivo novo.
            </p>
          )}

          {!loading && files.length > 0 && (
            <div className={styles.filesList}>
              {files.map((file) => (
                <div key={file.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.nome}</span>
                    <span className={styles.fileType}>{file.tipo}</span>
                  </div>
                  <a
                    href={file.storagePath}
                    download={file.nome}
                    className={styles.downloadButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Baixar
                  </a>
                </div>
              ))}
            </div>
          )}

          <Link href="/dashboard/files" className={styles.backButton}>
            Enviar novo arquivo
          </Link>
        </div>
      </section>
    </main>
  );
}
