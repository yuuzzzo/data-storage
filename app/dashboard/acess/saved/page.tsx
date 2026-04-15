"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../../files/page.module.css";

interface AcessData {
  id: string;
  servico: string;
  usuario: string;
  senha: string;
}

export default function SavedAcessPage() {
  const [acessos, setAcessos] = useState<AcessData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAcessos() {
      try {
        const response = await fetch("/api/acess", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Erro ao carregar acessos");
        }

        const data: AcessData[] = await response.json();
        setAcessos(data);
      } catch (error) {
        console.error(error);
        setError("Não foi possível carregar os acessos salvos.");
      } finally {
        setLoading(false);
      }
    }

    loadAcessos();
  }, []);

  const filteredAcessos = acessos.filter((acesso) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      acesso.servico.toLowerCase().includes(query) ||
      acesso.usuario.toLowerCase().includes(query)
    );
  });

  return (
    <main className={styles.container}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Acessos Salvos</h1>
            <p className={styles.subtitle}>
              Veja todos os seus logins com as senhas descriptografadas.
            </p>
          </div>
          <span className={styles.status}>Lista atualizada</span>
        </header>

        <div className={styles.filesSection}>
          <h2 className={styles.filesTitle}>Acessos disponíveis</h2>

          <div className={styles.searchBar}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por serviço ou usuário"
              className={styles.searchInput}
              aria-label="Pesquisar acessos"
            />
          </div>

          {loading && (
            <p className={styles.emptyMessage}>Carregando acessos...</p>
          )}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {!loading && !error && filteredAcessos.length === 0 && (
            <p className={styles.emptyMessage}>
              {acessos.length === 0
                ? "Nenhum acesso salvo ainda. Volte para registrar novos acessos."
                : `Nenhum acesso encontrado para "${search}".`}
            </p>
          )}

          {!loading && filteredAcessos.length > 0 && (
            <div className={styles.filesList}>
              {filteredAcessos.map((acesso) => (
                <div key={acesso.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{acesso.servico}</span>
                    <span className={styles.fileType}>{acesso.usuario}</span>
                  </div>
                  <span className={styles.downloadButton}>{acesso.senha}</span>
                </div>
              ))}
            </div>
          )}

          <Link href="/dashboard/acess" className={styles.backButton}>
            Cadastrar novo acesso
          </Link>
        </div>
      </section>
    </main>
  );
}
