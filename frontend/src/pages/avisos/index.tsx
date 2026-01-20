import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Card } from "../../components/ui/card.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Search, Bell, RefreshCw } from "lucide-react"; // Importei ícone de refresh opcional

import "@/static/avisos/style.css";

interface Aviso {
  id: number;
  titulo: string;
  categoria: string;
  descricao: string;
  data: string;
  url?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Avisos = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para controlar apenas o carregamento inicial
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Transformamos em useCallback para poder chamar manualmente ou via intervalo
  const fetchAvisos = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/avisos`);
      if (response.ok) {
        const data = await response.json();
        setAvisos(data);
      } else {
        console.error("Erro ao buscar avisos");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      // Removemos o loading apenas após a primeira requisição completar
      setIsLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    // 1. Chama imediatamente ao carregar
    fetchAvisos();

    // 2. Configura um intervalo para chamar a cada 10 segundos (10000ms)
    // Ajuste o tempo conforme necessário para não sobrecarregar seu servidor
    const intervalId = setInterval(() => {
      fetchAvisos();
    }, 10000); 

    // 3. Limpa o intervalo quando o componente for desmontado (sair da página)
    return () => clearInterval(intervalId);
  }, [fetchAvisos]);

  const filteredAvisos = avisos.filter((aviso) =>
    aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aviso.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="avisos-page">
      <Header />

      <main className="main-content">
        <div className="avisos-container">
          <div className="header-section">
            <h1 className="page-title">
              Mural de Avisos
              {/* Botão opcional para recarregar manualmente */}
              <button 
                onClick={fetchAvisos} 
                className="ml-4 p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Atualizar lista"
              >
                <RefreshCw size={20} />
              </button>
            </h1>
            <p className="page-description">
              Comunicados e notícias da paróquia
            </p>
          </div>

          <div className="search-bar-wrapper">
            <Search className="search-icon" />
            <Input
              placeholder="Buscar avisos..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Usamos isLoadingInitial para não esconder a lista durante as atualizações de fundo */}
          {isLoadingInitial ? (
            <p className="text-center py-8 text-gray-500">Carregando avisos...</p>
          ) : (
            <div className="avisos-list">
              {filteredAvisos.map((aviso) => (
                <Card key={aviso.id} className="aviso-card overflow-hidden">
                  {aviso.url && aviso.url.trim() !== "" && (
                    <div className="aviso-image-wrapper">
                      <img
                        src={aviso.url}
                        alt={`Imagem ilustrativa para ${aviso.titulo}`}
                        className="aviso-image"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="aviso-card-body">
                    <div className="aviso-card-content">
                      {(!aviso.url || aviso.url.trim() === "") && (
                        <div className="aviso-icon-wrapper">
                          <Bell className="aviso-icon" />
                        </div>
                      )}

                      <div className="aviso-details">
                        <div className="aviso-header">
                          <h2 className="aviso-title">{aviso.titulo}</h2>
                          <span className="aviso-date">{formatDate(aviso.data)}</span>
                        </div>

                        <p className="aviso-body">{aviso.descricao}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredAvisos.length === 0 && (
                <p className="text-center py-8 text-gray-500">Nenhum aviso encontrado.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Avisos;