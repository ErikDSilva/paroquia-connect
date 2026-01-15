import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Importe o Label
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Calendar, MapPin, Users } from "lucide-react";
import { useState, useEffect } from "react";

import '@/static/eventos/style.css';

// Definição da tipagem baseada no que o Frontend espera
type EventoUI = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  spots: number | null;
  registred: number ;
};

const Eventos = () => {
  const [filter, setFilter] = useState("TODOS");
  const [events, setEvents] = useState<EventoUI[]>([]);

  // --- NOVOS ESTADOS PARA A INSCRIÇÃO ---
  const [selectedEvent, setSelectedEvent] = useState<EventoUI | null>(null);
  const [subForm, setSubForm] = useState({ nome: "", telefone: "" });

  // estado para termos de busca
  const [searchTerm, setSearchTerm] = useState("");

  // Array de categorias para os botões de filtro
  const categories = ["TODOS", "FORMAÇÃO", "ESPIRITUALIDADE", "FESTIVIDADE", "AÇÃO SOCIAL", "ADMINISTRATIVO"];

  // Função auxiliar para converter o 'tipo' do banco para a 'category' da UI
  const mapCategoryName = (backendType: string) => {
    const map: Record<string, string> = {
      'formacao': 'FORMAÇÃO',
      'espiritualidade': 'ESPIRITUALIDADE',
      'festividade': 'FESTIVIDADE',
      'acaoSocial': 'AÇÃO SOCIAL',
      'administrativo': 'ADMINISTRATIVO'
    };
    return map[backendType] || 'OUTROS';
  };

  // Função auxiliar para formatar a data (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

const fetchEventos = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/eventos');
    if (response.ok) {
      const data = await response.json();

      const mappedEvents: EventoUI[] = data.map((evt: any) => ({
        id: evt.id,
        title: evt.titulo,
        description: evt.descricao,
        date: formatDate(evt.data),
        time: evt.horario,
        location: evt.local,
        category: mapCategoryName(evt.tipo),
        spots: evt.numero_vagas,
        registred: evt.registered_count
      }));

      setEvents(mappedEvents);
        }
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
  }
};

  // Busca os dados do Backend
  useEffect(() => {
    fetchEventos();
  }, []);

  const filteredEventos = events.filter(e => {
    // Filtro por Categoria
    const matchesCategory = filter === "TODOS" || e.category === filter;

    // Prepara o Termo de Busca
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    if (!lowerCaseSearchTerm) {
      // Se não houver termo de busca, apenas retorna o resultado da categoria
      return matchesCategory;
    }

    // Filtro por Termo de Busca (Título ou Descrição)
    const matchesSearch =
      e.title.toLowerCase().includes(lowerCaseSearchTerm) || // Busca por Título
      e.description.toLowerCase().includes(lowerCaseSearchTerm); // Busca por Descrição

    // O evento deve satisfazer AMBOS os filtros (Categoria E Busca)
    return matchesCategory && matchesSearch;
  });

  // --- FUNÇÕES DE MANIPULAÇÃO DO MODAL ---

  // Abre o modal e limpa o formulário anterior
  const handleOpenSubscribe = (evento: EventoUI) => {
    setSelectedEvent(evento);
    setSubForm({ nome: "", telefone: "" });
  };

  // Fecha o modal
  const handleCloseSubscribe = () => {
    setSelectedEvent(null);
  };

  // Simula o envio da inscrição
  const handleSubmitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvent) return;

    try {
      const response = await fetch(
        // Chamando a nova rota com o ID do evento na URL
        `http://localhost:5000/api/v1/eventos/${selectedEvent.id}/inscricao`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: subForm.nome,
            telefone: subForm.telefone, // Enviando 'telefone' para o backend
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Sucesso (código 201)
        alert(`Inscrição realizada com sucesso para: ${selectedEvent.title}!`);
        handleCloseSubscribe();
        // Opcional: Recarregar a lista de eventos se a contagem de vagas for importante
        // fetchEventos(); 

        await fetchEventos();
      } else {
        // Erro (Ex: 400, 403 - vagas esgotadas, 404)
        alert(`Falha na inscrição: ${data.error || 'Erro desconhecido.'}`);
      }
    } catch (error) {
      console.error("Erro de conexão ao inscrever:", error);
      alert("Erro de rede. Não foi possível conectar ao servidor para a inscrição.");
    }
  };

  return (
    <div className="eventos-page">
      <Header />

      <main className="main-content">
        <div className="eventos-container">
          <div className="header-section">
            <h1 className="page-title">Agenda de Eventos</h1>
            <p className="page-description">Confira todos os eventos e atividades da paróquia</p>
          </div>

          {/* Search Bar */}
          <div className="search-bar-wrapper">
            <Search className="search-icon" />
            <Input
              placeholder="Buscar eventos..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="category-filters">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`filter-button ${filter === cat
                    ? "filter-button--active"
                    : "filter-button--inactive"
                  }`}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="events-grid">
            {filteredEventos.length > 0 ? (
              filteredEventos.map((evento) => (
                <Card key={evento.id} className="event-card">
                  <div className="event-card-header">
                    <h3 className="event-title">{evento.title}</h3>
                    <Badge className="event-category-badge">
                      {evento.category}
                    </Badge>
                  </div>
                  <p className="event-description">{evento.description}</p>

                  <div className="event-details-list">
                    <div className="event-detail-item">
                      <Calendar className="event-detail-icon" />
                      <span>{evento.date} às {evento.time.substring(0, 5)}</span>
                    </div>
                    <div className="event-detail-item">
                      <MapPin className="event-detail-icon" />
                      <span>{evento.location}</span>
                    </div>
                    {evento.spots !== null && (
                      <div className="event-detail-item">
                        <Users className="event-detail-icon" />
                        <span>
                          {evento.registred} / {evento.spots} vagas preenchidas
                          {evento.registred >= evento.spots && (<Badge variant="destructive" className="ml-2">LOTADO</Badge>)}
                          </span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="event-subscribe-button"
                    onClick={() => handleOpenSubscribe(evento)}
                  >
                    Inscrever-se
                  </Button>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                Nenhum evento encontrado nesta categoria.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL DE INSCRIÇÃO --- */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && handleCloseSubscribe()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Inscrição</DialogTitle>
            <DialogDescription>
              Você está se inscrevendo para: <strong>{selectedEvent?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSubscription} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                placeholder="Digite seu nome"
                value={subForm.nome}
                onChange={(e) => setSubForm({ ...subForm, nome: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone / WhatsApp</Label>
              <Input
                id="telefone"
                placeholder="(00) 00000-0000"
                value={subForm.telefone}
                onChange={(e) => setSubForm({ ...subForm, telefone: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseSubscribe}>
                Cancelar
              </Button>
              <Button type="submit">Confirmar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Eventos;