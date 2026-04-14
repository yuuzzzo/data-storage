"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [nome, setNome] = useState("");
  const [extension, setExtension] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Selecione um arquivo!");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("nome", nome);
      formData.append("tipo", extension);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro no upload");

      alert("Arquivo enviado e salvo no banco!");
      setFile(null);
      setNome("");
      setExtension("");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Gerenciar Arquivos</h1>
            <p className={styles.subtitle}>
              Envie e visualize seus arquivos no storage!
            </p>
          </div>
          <span className={styles.status}>Pronto para upload</span>
        </header>

        <div className={styles.form}>
          <label className={styles.inputWrapper}>
            <input
              className={styles.input}
              type="text"
              placeholder="Título do arquivo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>

          <label className={styles.inputWrapper}>
            <div className={styles.fileLabel}>
              <span>{file ? file.name : "Selecione um arquivo"}</span>
              <strong>Escolher</strong>
            </div>
            <input
              className={styles.fileInput}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <label className={styles.inputWrapper}>
            <input
              className={styles.input}
              type="text"
              placeholder="Tipo do arquivo"
              value={extension}
              onChange={(e) => setExtension(e.target.value)}
            />
          </label>

          <button type="button" className={styles.button} onClick={handleUpload} disabled={uploading}>
            {uploading ? "Enviando..." : "Subir para a nuvem"}
          </button>
          <Link href="/dashboard/files/saved" className={styles.button}>
            Ver Arquivos Salvos
          </Link>
          <Link href="/dashboard" className={styles.backButton}>
            Voltar ao Dashboard
          </Link>
          <p className={styles.note}>Arquivos são processados com segurança e experiência fluida.</p>
        </div>
      </section>
    </main>
  );
}
