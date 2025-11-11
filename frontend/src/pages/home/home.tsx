import React from 'react';

// A importação do CSS
import "../../static/home/style.css"

import { Card } from "../../components/ui/card.tsx";
import { Header } from "@/components/Header";
import { Calendar, Bell, Clock } from "lucide-react";
import { Link } from "react-router-dom";

function App() {

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
          {/* Próximos Eventos */}
          <div>
            <h2 className="section-title">Próximos Eventos</h2>
            <Card className="events-card">
              <div className="event-list">
                <div className="event-item">
                  <h3 className="event-item-title">Catequese Infantil</h3>
                  <p className="event-item-detail">Sábado, 15/11 às 14h</p>
                  <p className="event-item-detail">Salão Paroquial</p>
                </div>
                <div className="event-item">
                  <h3 className="event-item-title">Missa Dominical</h3>
                  <p className="event-item-detail">Domingo, 16/11 às 10h</p>
                  <p className="event-item-detail">Igreja Matriz</p>
                </div>
                <div className="event-item">
                  <h3 className="event-item-title">Grupo de Oração</h3>
                  <p className="event-item-detail">Quarta, 19/11 às 19h30</p>
                  <p className="event-item-detail">Capela</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Últimos Avisos */}
          <div>
            <h2 className="section-title">Últimos Avisos</h2>
            <div className="notice-list">
              <Card className="notice-card">
                <div className="notice-item">
                  <div className="notice-icon-wrapper">
                    <Bell className="notice-icon" />
                  </div>
                  <div>
                    <h3 className="notice-title">Inscrições Abertas</h3>
                    <p className="notice-description">
                      Estão abertas as inscrições para a catequese de primeira comunhão 2025.
                    </p>
                    <span className="notice-timestamp">Há 2 dias</span>
                  </div>
                </div>
              </Card>

              <Card className="notice-card">
                <div className="notice-item">
                  <div className="notice-icon-wrapper">
                    <Bell className="notice-icon" />
                  </div>
                  <div>
                    <h3 className="notice-title">Horário Especial</h3>
                    <p className="notice-description">
                      No próximo domingo haverá missa especial às 18h para celebração do padroeiro.
                    </p>
                    <span className="notice-timestamp">Há 5 dias</span>
                  </div>
                </div>
              </Card>

              <Card className="notice-card">
                <div className="notice-item">
                  <div className="notice-icon-wrapper">
                    <Bell className="notice-icon" />
                  </div>
                  <div>
                    <h3 className="notice-title">Campanha Solidária</h3>
                    <p className="notice-description">
                      Participe da campanha de arrecadação de alimentos para famílias carentes.
                    </p>
                    <span className="notice-timestamp">Há 1 semana</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App
