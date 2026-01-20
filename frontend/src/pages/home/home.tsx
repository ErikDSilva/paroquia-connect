import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Calendar, Bell, Clock, RefreshCw } from "lucide-react"; // Adicionei RefreshCw opcional

import "@/static/home/style.css";

const API_URL = import.meta.env.VITE_API_URL;

// Interfaces para tipagem dos dados
interface Evento {
  id: number;
  titulo: string;
  data: string;
  horario: string;
  local: string;
}

interface Aviso {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
}

function App() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  // Controla apenas o loading da primeira carga para não piscar a tela depois
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // 1. Movemos a lógica para um useCallback para ser reutilizável
  const fetchData = useCallback(async () => {
    try {
      // Faz as duas requisições simultaneamente
      const [resEventos, resAvisos] = await Promise.all([
        fetch(`${API_URL}/eventos`),
        fetch(`${API_URL}/avisos`)
      ]);

      if (resEventos.ok && resAvisos.ok) {
        const dadosEventos = await resEventos.json();
        const dadosAvisos = await resAvisos.json();

        // LÓGICA DE EVENTOS:
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const proximosEventos = dadosEventos
          .filter((e: Evento) => new Date(e.data) >= hoje)
          .sort((a: Evento, b: Evento) => new Date(a.data).getTime() - new Date(b.data).getTime())
          .slice(0, 3);

        setEventos(proximosEventos);

        // LÓGICA DE AVISOS:
        setAvisos(dadosAvisos.slice(0, 3));
      }
    } catch (error) {
      console.error("Erro ao carregar dados da home:", error);
    } finally {
      // Garante que o loading inicial suma após a primeira tentativa
      setIsLoadingInitial(false);
    }
  }, []); // Dependências vazias pois API_URL é constante

  // 2. Configura o intervalo de atualização
  useEffect(() => {
    // Busca imediata
    fetchData();

    // Busca a cada 30 segundos
    const intervalId = setInterval(() => {
      fetchData();
    }, 3000);

    // Limpeza ao sair da página
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Função para formatar data (Ex: Sábado, 15/11)
  const formatarDataEvento = (dataString: string) => {
    const date = new Date(dataString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const offsetDate = new Date(date.getTime() + userTimezoneOffset);
    
    return new Intl.DateTimeFormat('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'numeric' 
    }).format(offsetDate);
  };

  // Função para formatar data simples (Ex: 15/11/2024)
  const formatarDataAviso = (dataString: string) => {
    const date = new Date(dataString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="index-page">
      <Header />

      <main className="main-content">
        {/* Quick Access Cards */}
        <div className="quick-access-grid">
          <Link to="/eventos">
            <Card className="quick-access-card">
              <div className="card-content-inner">
                <div className="card-icon-wrapper">
                  <Calendar className="card-icon" />
                </div>
                <div>
                  <h3 className="card-title">Eventos</h3>
                  <p className="card-description">Próximos eventos da paróquia</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/avisos">
            <Card className="quick-access-card">
              <div className="card-content-inner">
                <div className="card-icon-wrapper">
                  <Bell className="card-icon" />
                </div>
                <div>
                  <h3 className="card-title">Avisos</h3>
                  <p className="card-description">Últimos comunicados</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/horarios">
            <Card className="quick-access-card">
              <div className="card-content-inner">
                <div className="card-icon-wrapper">
                  <Clock className="card-icon" />
                </div>
                <div>
                  <h3 className="card-title">Horários</h3>
                  <p className="card-description">Horários das atividades</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      
        <div className="content-grid">
          {/* Próximos Eventos Dinâmicos */}
          <div>
            <div className="flex justify-between items-center mb-4">
               <h2 className="section-title mb-0">Próximos Eventos</h2>
               {/* Botão discreto para atualizar manualmente se precisar */}
               <button onClick={fetchData} title="Atualizar agora" className="text-gray-400 hover:text-blue-600 transition">
                  <RefreshCw size={16} />
               </button>
            </div>
            
            <Card className="events-card">
              <div className="event-list">
                {isLoadingInitial ? (
                  <p className="p-4 text-gray-500">Carregando eventos...</p>
                ) : eventos.length > 0 ? (
                  eventos.map((evento) => (
                    <div key={evento.id} className="event-item">
                      <h3 className="event-item-title">{evento.titulo}</h3>
                      <p className="event-item-detail capitalize">
                        {formatarDataEvento(evento.data)} às {evento.horario}
                      </p>
                      <p className="event-item-detail">{evento.local}</p>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-gray-500">Nenhum evento próximo agendado.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Últimos Avisos Dinâmicos */}
          <div>
            <h2 className="section-title">Últimos Avisos</h2>
            <div className="notice-list">
              {isLoadingInitial ? (
                 <p className="text-gray-500">Carregando avisos...</p>
              ) : avisos.length > 0 ? (
                avisos.map((aviso) => (
                  <Card key={aviso.id} className="notice-card">
                    <div className="notice-item">
                      <div className="notice-icon-wrapper">
                        <Bell className="notice-icon" />
                      </div>
                      <div>
                        <h3 className="notice-title">{aviso.titulo}</h3>
                        <p className="notice-description line-clamp-2">
                          {aviso.descricao}
                        </p>
                        <span className="notice-timestamp">
                          {formatarDataAviso(aviso.data)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500">Nenhum aviso encontrado.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;