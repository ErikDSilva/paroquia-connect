import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import "@/static/horarios/style.css";

const API_URL = import.meta.env.VITE_API_URL;

// Interface para o dado que vem da API
interface HorarioApi {
  id: number;
  dia: string;
  titulo: string;
  horario: string;
  local: string;
}

// Interfaces para o uso no componente
interface Activity {
  time: string;
  name: string;
  location: string;
}

interface DaySchedule {
  day: string;
  activities: Activity[];
}

// Retorna um número de 0 (Domingo) a 6 (Sábado)
const getCurrentDayIndex = () => {
  const today = new Date();
  return today.getDay();
};

const Horarios = () => {
  const [currentDay, setCurrentDay] = useState(getCurrentDayIndex());
  const [loading, setLoading] = useState(true);

  // Estrutura base dos dias para garantir a ordem correta (Domingo a Sábado)
  // Definido como constante fora ou useMemo seria ideal, mas aqui funciona bem
  const initialSchedule: DaySchedule[] = [
    { day: "Domingo", activities: [] },
    { day: "Segunda-feira", activities: [] },
    { day: "Terça-feira", activities: [] },
    { day: "Quarta-feira", activities: [] },
    { day: "Quinta-feira", activities: [] },
    { day: "Sexta-feira", activities: [] },
    { day: "Sábado", activities: [] },
  ];

  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);

  useEffect(() => {
    // Definimos a função de busca aqui dentro para facilitar o acesso ao escopo
    const fetchHorarios = async () => {
      try {
        // NOTA: Não setamos setLoading(true) aqui para evitar que a tela pisque a cada 3 segundos
        
        const response = await fetch(`${API_URL}/horarios`);
        if (response.ok) {
          const data: HorarioApi[] = await response.json();

          // Clona a estrutura inicial para limpar os dados antigos antes de preencher os novos
          const newSchedule = JSON.parse(JSON.stringify(initialSchedule));

          // Distribui os horários vindos do banco nos dias correspondentes
          data.forEach((item) => {
            const dayIndex = newSchedule.findIndex((d: DaySchedule) => d.day === item.dia);

            if (dayIndex !== -1) {
              newSchedule[dayIndex].activities.push({
                time: item.horario.substring(0, 5), // Corta os segundos
                name: item.titulo,
                location: item.local
              });
            }
          });

          // Ordena as atividades de cada dia pelo horário
          newSchedule.forEach((day: DaySchedule) => {
            day.activities.sort((a, b) => a.time.localeCompare(b.time));
          });

          setSchedule(newSchedule);
        }
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
      } finally {
        // Garante que o loading pare, seja sucesso ou erro, apenas na primeira carga visual
        setLoading(false);
      }
    };

    // 1. Chamada imediata ao montar o componente
    fetchHorarios();

    // 2. Configura o intervalo para atualizar a cada 3 segundos
    const intervalId = setInterval(fetchHorarios, 3000);

    // 3. Limpa o intervalo se o usuário sair da página
    return () => clearInterval(intervalId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio para rodar apenas na montagem/desmontagem do componente

  const nextDay = () => {
    setCurrentDay((prev) => (prev + 1) % schedule.length);
  };

  const prevDay = () => {
    setCurrentDay((prev) => (prev - 1 + schedule.length) % schedule.length);
  };

  // Pega o dia atual baseado no estado
  const currentScheduleData = schedule[currentDay];

  return (
    <div className="horarios-page">
      <Header />

      <main className="main-content">
        <div className="horarios-container">
          <div className="header-section">
            <h1 className="page-title">Horários de Atividades</h1>
            <p className="page-description">Confira os horários das missas e atividades paroquiais</p>
          </div>

          <Card className="schedule-card">
            <div className="schedule-header">
              <Button onClick={prevDay} className="nav-button" disabled={loading}>
                <ChevronLeft className="nav-button-icon" />
              </Button>

              <h2 className="schedule-day-title">{currentScheduleData?.day || "Carregando..."}</h2>

              <Button onClick={nextDay} className="nav-button" disabled={loading}>
                <ChevronRight className="nav-button-icon" />
              </Button>
            </div>

            <div className="activity-list">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                </div>
              ) : currentScheduleData && currentScheduleData.activities.length > 0 ? (
                currentScheduleData.activities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div>
                      <p className="activity-name">{activity.name}</p>
                      <p className="activity-location">{activity.location}</p>
                    </div>
                    <div className="activity-time-wrapper">
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma atividade cadastrada para este dia.
                </p>
              )}
            </div>
          </Card>

          <div className="week-overview">
            {schedule.map((day, index) => (
              <button
                key={index}
                onClick={() => setCurrentDay(index)}
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