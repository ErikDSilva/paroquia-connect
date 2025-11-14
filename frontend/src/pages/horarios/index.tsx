import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import "@/static/horarios/style.css";

const Horarios = () => {
  const [currentDay, setCurrentDay] = useState(0);

  const schedule = [
    {
      day: "Domingo",
      activities: [
        { time: "07:00", name: "Missa", location: "Matriz" },
        { time: "10:00", name: "Missa", location: "Matriz" },
        { time: "17:00", name: "Missa", location: "Matriz" },
        { time: "19:00", name: "Missa", location: "Matriz" },
      ],
    },
    {
      day: "Segunda-feira",
      activities: [
        { time: "07:00", name: "Missa", location: "Capela" },
        { time: "19:00", name: "Missa", location: "Capela" },
      ],
    },
    {
      day: "Terça-feira",
      activities: [
        { time: "07:00", name: "Missa", location: "Capela" },
        { time: "19:00", name: "Missa", location: "Capela" },
      ],
    },
    {
      day: "Quarta-feira",
      activities: [
        { time: "07:00", name: "Missa", location: "Capela" },
        { time: "19:00", name: "Missa", location: "Capela" },
        { time: "19:30", name: "Grupo de Oração", location: "Salão" },
      ],
    },
    {
      day: "Quinta-feira",
      activities: [
        { time: "07:00", name: "Missa", location: "Capela" },
        { time: "19:00", name: "Missa", location: "Capela" },
      ],
    },
    {
      day: "Sexta-feira",
      activities: [
        { time: "07:00", name: "Missa", location: "Capela" },
        { time: "19:00", name: "Missa", location: "Capela" },
        { time: "20:00", name: "Adoração ao Santíssimo", location: "Matriz" },
      ],
    },
    {
      day: "Sábado",
      activities: [
        { time: "07:00", name: "Missa", location: "Capela" },
        { time: "14:00", name: "Catequese Infantil", location: "Salão" },
        { time: "19:00", name: "Missa", location: "Matriz" },
      ],
    },
  ];

  const nextDay = () => {
    setCurrentDay((prev) => (prev + 1) % schedule.length);
  };

  const prevDay = () => {
    setCurrentDay((prev) => (prev - 1 + schedule.length) % schedule.length);
  };

  return (
    // 'min-h-screen bg-background'
    <div className="horarios-page">
      <Header />

      {/* 'container py-8' */}
      <main className="main-content">
        {/* 'max-w-3xl mx-auto' */}
        <div className="horarios-container">
          {/* 'mb-8 text-center' */}
          <div className="header-section">
            {/* 'text-3xl font-bold text-primary mb-2' */}
            <h1 className="page-title">Horários de Atividades</h1>
            {/* 'text-muted-foreground' */}
            <p className="page-description">Confira os horários das missas e atividades paroquiais</p>
          </div>

          {/* Schedule Card */}
          {/* 'p-8' */}
          <Card className="schedule-card">
            {/* 'flex items-center justify-between mb-6' */}
            <div className="schedule-header">
              <Button
                onClick={prevDay}
                // 'variant="ghost" size="icon" hover:bg-primary/10'
                className="nav-button"
              >
                {/* 'h-6 w-6' */}
                <ChevronLeft className="nav-button-icon" />
              </Button>

              {/* 'text-2xl font-bold text-primary' */}
              <h2 className="schedule-day-title">{schedule[currentDay].day}</h2>

              <Button
                onClick={nextDay}
                className="nav-button"
              >
                <ChevronRight className="nav-button-icon" />
              </Button>
            </div>

            {/* 'space-y-4' */}
            <div className="activity-list">
              {schedule[currentDay].activities.map((activity, index) => (
                <div
                  key={index}
                  // 'flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors'
                  className="activity-item"
                >
                  <div>
                    {/* 'font-bold text-lg text-primary' */}
                    <p className="activity-name">{activity.name}</p>
                    {/* 'text-sm text-muted-foreground' */}
                    <p className="activity-location">{activity.location}</p>
                  </div>
                  {/* 'text-right' */}
                  <div className="activity-time-wrapper">
                    {/* 'font-semibold text-lg' */}
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Week Overview */}
          {/* 'mt-8 grid grid-cols-7 gap-2' */}
          <div className="week-overview">
            {schedule.map((day, index) => (
              <button
                key={index}
                onClick={() => setCurrentDay(index)}
                // Classe base + classe condicional
                className={`day-selector-button ${currentDay === index
                    ? "day-selector-button--active"
                    : "day-selector-button--inactive"
                  }`}
              >
                {day.day.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Horarios;
