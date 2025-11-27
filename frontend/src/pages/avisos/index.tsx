import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "../../components/ui/card.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Search, Bell } from "lucide-react";

import "@/static/avisos/style.css";

// Interface compatível com o retorno da sua API Python
interface Aviso {
  id: number;
  titulo: string;
  categoria: string;
  descricao: string;
  data: string;
  url?: string;
}

const Avisos = () => {
  // Estado para armazenar os avisos vindos do banco
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  // Estado para o campo de busca
  const [searchTerm, setSearchTerm] = useState("");
  // Estado de carregamento (opcional, mas bom para UX)
  const [loading, setLoading] = useState(true);

  // Busca os dados do Backend ao carregar a página
  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/avisos");
        if (response.ok) {
          const data = await response.json();
          setAvisos(data);
        } else {
          console.error("Erro ao buscar avisos");
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvisos();
  }, []);

  // Lógica de filtro para a barra de busca
  const filteredAvisos = avisos.filter((aviso) =>
    aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aviso.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função auxiliar para formatar a data (YYYY-MM-DD -> DD/MM/AAAA)
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // timeZone: 'UTC' garante que não subtraia um dia devido ao fuso horário
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="avisos-page">
      <Header />

      <main className="main-content">
        <div className="avisos-container">
          <div className="header-section">
            <h1 className="page-title">Mural de Avisos</h1>
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

          {loading ? (
            <p className="text-center py-8 text-gray-500">Carregando avisos...</p>
          ) : (
            <div className="avisos-list">
              {filteredAvisos.map((aviso) => (
                <Card key={aviso.id} className="aviso-card overflow-hidden">
                  {/* Verifica se existe URL e se ela não é uma string vazia */}
                  {aviso.url && aviso.url.trim() !== "" && (
                    <div className="aviso-image-wrapper">
                      <img
                        src={aviso.url}
                        alt={`Imagem ilustrativa para ${aviso.titulo}`}
                        className="aviso-image"
                        loading="lazy"
                        // Adiciona um fallback caso a imagem esteja quebrada
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="aviso-card-body">
                    <div className="aviso-card-content">
                      {/* Se não tiver imagem, mostra o ícone de sino */}
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
                        
                        {/* Opcional: Mostrar categoria com badge simples se quiser */}
                        {/* <span className="text-xs font-semibold text-blue-600 mt-2 block">
                           #{aviso.categoria}
                        </span> */}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {!loading && filteredAvisos.length === 0 && (
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