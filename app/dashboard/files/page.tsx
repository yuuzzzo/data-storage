"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [nome, setNome] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-detecta extensão quando arquivo é selecionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    // Auto-preenche nome se vazio
    if (selectedFile && !nome) {
      const nameWithoutExtension = selectedFile.name.split(".").slice(0, -1).join(".");
      setNome(nameWithoutExtension || selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Selecione um arquivo!" });
      return;
    }

    if (!nome.trim()) {
      setMessage({ type: "error", text: "Digite um nome para o arquivo!" });
      return;
    }

    setUploading(true);
    setMessage(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("nome", nome.trim());

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao fazer upload do arquivo");
      }

      setMessage({ 
        type: "success", 
        text: `✓ ${file.name} enviado com sucesso!` 
      });
      
      setFile(null);
      setNome("");
      
      // Limpa mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setMessage({ type: "error", text: `✗ ${errorMessage}` });
      console.error(error);
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
          <span className={styles.status}>
            {file ? `Pronto: ${file.name}` : "Pronto para upload"}
          </span>
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
              <span>
                {file 
                  ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)` 
                  : "Selecione um arquivo"}
              </span>
              <strong>Escolher</strong>
            </div>
            <input
              className={styles.fileInput}
              type="file"
              onChange={handleFileChange}
            />
          </label>

          {message && (
            <div 
              className={`${styles.message} ${styles[`message-${message.type}`]}`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <button 
            type="button" 
            className={styles.button} 
            onClick={handleUpload} 
            disabled={uploading || !file}
          >
            {uploading ? "Enviando..." : "Subir para a nuvem"}
          </button>
          
          <Link href="/dashboard/files/saved" className={styles.button}>
            Ver Arquivos Salvos
          </Link>
          
          <Link href="/dashboard" className={styles.backButton}>
            Voltar ao Dashboard
          </Link>
          
          <p className={styles.note}>
            ✓ Suporta: PDF, DOC, XLS, PPT, JPG, PNG, ZIP, EXE, MSI, DEB, RPM, APK e mais
          </p>
        </div>
      </section>
    </main>
  );
}
