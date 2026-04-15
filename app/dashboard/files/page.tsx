"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { supabaseClient } from "../../lib/supabaseClient";
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  createStorageFileName,
  formatSize,
  getFileExtension,
} from "../../lib/fileUtils";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [nome, setNome] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile && !nome) {
      const nameWithoutExtension = selectedFile.name
        .split(".")
        .slice(0, -1)
        .join(".");
      setNome(nameWithoutExtension || selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Selecione um arquivo!" });
      return;
    }

    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setMessage({
        type: "error",
        text: `Tipo de arquivo não permitido: .${extension}`,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage({
        type: "error",
        text: `Arquivo muito grande. Máximo permitido: ${formatSize(MAX_FILE_SIZE)}`,
      });
      return;
    }

    if (!nome.trim()) {
      setMessage({ type: "error", text: "Digite um nome para o arquivo!" });
      return;
    }

    setUploading(true);
    setMessage(null);

    const storageFileName = createStorageFileName(file.name);
    let uploadCompleted = false;

    try {
      const { error: uploadError } = await supabaseClient.storage
        .from("my-files")
        .upload(storageFileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });

      if (uploadError) {
        throw new Error(`Erro no upload do storage: ${uploadError.message}`);
      }

      uploadCompleted = true;

      const response = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim() || file.name,
          fileName: storageFileName,
          tipo: extension,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error || `Erro ao salvar metadados (${response.status})`,
        );
      }

      setMessage({
        type: "success",
        text: `✓ ${file.name} enviado com sucesso!`,
      });
      setFile(null);
      setNome("");

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      if (uploadCompleted) {
        await supabaseClient.storage.from("my-files").remove([storageFileName]);
      }

      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
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
                  ? `${file.name} (${formatSize(file.size)})`
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
            ✓ Suporta: PDF, DOC, XLS, PPT, JPG, PNG, ZIP, EXE, MSI, DEB, RPM,
            APK e mais
          </p>
        </div>
      </section>
    </main>
  );
}
