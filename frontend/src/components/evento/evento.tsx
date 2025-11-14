import '@/static/eventos/style.css';
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, MapPin, Users } from "lucide-react";
import { useState } from "react";

const Eventos = () => {
  const [filter, setFilter] = useState("TODOS");

  const eventos = [
    {
      id: 1,
      title: "Catequese - Infantil",
      description: "Inscrições abertas para turma de catequese infantil.",
      date: "15/11/2024",
      time: "14:00",
      location: "Salão Paroquial",
      category: "FORMAÇÃO",
      spots: 25,
    },
    {
      id: 2,
      title: "Reunião com os Funcionários",
      description: "Reunião mensal com os funcionários da paróquia.",
      date: "18/11/2024",
      time: "15:00",
      location: "Secretaria",
      category: "ADMINIST.",
      spots: 10,
    },
    {
      id: 3,
      title: "Retiro Espiritual",
      description: "Retiro com os jovens da paróquia.",
      date: "23/11/2024",
      time: "08:00",
      location: "Casa de Retiro",
      category: "ORAÇÃO",
      spots: 30,
    },
    {
      id: 4,
      title: "Confissão Especial",
      description: "Horário especial para confissões individuais.",
      date: "25/11/2024",
      time: "16:00",
      location: "Igreja Matriz",
      category: "SACRAMENT.",
      spots: null,
    },
  ];

  const categories = ["TODOS", "FORMAÇÃO", "SACRAMENT.", "ADMINIST.", "ORAÇÃO"];

  const filteredEventos = filter === "TODOS" 
    ? eventos 
    : eventos.filter(e => e.category === filter);

  return (
    <div className="eventos-page">
      <Header />
      
      <main className="main-content">
        <div className="eventos-container">
          <div className="header-section">
            <h1 className="page-title">Agenda de Eventos</h1>
            <p className="page-description">Confira todos os eventos e atividades da paróquia</p>
          </div>

          <div className="search-bar-wrapper">
            <Search className="search-icon" />
            <Input 
              placeholder="Buscar eventos..." 
              className="search-input"
            />
          </div>

          {/* Category Filters */}
          <div className="category-filters">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`filter-button ${
                  filter === cat
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
            {filteredEventos.map((evento) => (
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
                    <span>{evento.date} às {evento.time}</span>
                  </div>
                  <div className="event-detail-item">
                    <MapPin className="event-detail-icon" />
                    <span>{evento.location}</span>
                  </div>
                  {evento.spots && (
                    <div className="event-detail-item">
                      <Users className="event-detail-icon" />
                      <span>{evento.spots} vagas disponíveis</span>
                    </div>
                  )}
                </div>

                <Button className="event-subscribe-button">
                  Inscrever-se
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Eventos;