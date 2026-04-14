"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../files/page.module.css";

interface AcessData {
  id: string;
  servico: string;
  usuario: string;
  senha: string;
}

export default function AcessPage() {
  const [servico, setServico] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [acessos, setAcessos] = useState<AcessData[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const handleSaveAcess = async () => {
    if (!servico.trim() || !usuario.trim() || !senha.trim()) {
      return alert("Preencha todos os campos para salvar o acesso.");
    }

    setPosting(true);
    try {
      const response = await fetch("/api/acess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servico, usuario, senha }),
      });

      if (!response.ok) throw new Error("Erro ao salvar o acesso");

      alert("Acesso salvo com senha criptografada com sucesso!");
      setServico("");
      setUsuario("");
      setSenha("");
      loadAcessos();
    } catch (error) {
      console.error(error);
      alert("Falha ao salvar o acesso");
    } finally {
      setPosting(false);
    }
  };

  const loadAcessos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/acess", { cache: "no-store" });
      if (!response.ok) throw new Error("Erro ao carregar acessos");
      const data: AcessData[] = await response.json();
      setAcessos(data);
    } catch (error) {
      console.error(error);
      alert("Falha ao carregar acessos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Gerenciar Acessos</h1>
            <p className={styles.subtitle}>
              Salve logins com senha criptografada e veja-os descriptografados aqui.
            </p>
          </div>
          <span className={styles.status}>Pronto para guardar</span>
        </header>

        <div className={styles.form}>
          <label className={styles.inputWrapper}>
            <input
              className={styles.input}
              type="text"
              placeholder="Serviço"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
            />
          </label>

          <label className={styles.inputWrapper}>
            <input
              className={styles.input}
              type="text"
              placeholder="Usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </label>

          <label className={styles.inputWrapper}>
            <input
              className={styles.input}
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>

          <button type="button" className={styles.button} onClick={handleSaveAcess} disabled={posting}>
            {posting ? "Salvando..." : "Salvar acesso"}
          </button>
          <Link href="/dashboard/acess/saved" className={styles.button}>
            Ver Acessos Salvos
          </Link>
          <Link href="/dashboard" className={styles.backButton}>
            Voltar ao Dashboard
          </Link>
          <p className={styles.note}>A senha é armazenada criptografada no banco, mas exibida descriptografada aqui.</p>
        </div>

        {acessos.length > 0 && (
          <div className={styles.filesSection}>
            <h2 className={styles.filesTitle}>Acessos Salvos</h2>
            <div className={styles.filesList}>
              {acessos.map((acesso) => (
                <div key={acesso.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{acesso.servico}</span>
                    <span className={styles.fileType}>{acesso.usuario}</span>
                  </div>
                  <span className={styles.downloadButton}>{acesso.senha}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
