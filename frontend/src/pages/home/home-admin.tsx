import { useState, useEffect } from "react";
import { HeaderSecretaria } from "@/components/HeaderSecretaria";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, Clock, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import "@/static/home/home-admin.css";

const Admin = () => {
  // Estado para armazenar os dados vindos do Python
  const [dashboardData, setDashboardData] = useState({
    stats: {
      eventos: 0,
      avisos: 0,
      agenda: 0,
      horarios: 0
    },
    activity: []
  });

  const [loading, setLoading] = useState(true);

  // Busca os dados assim que o componente monta
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/dashboard", {
          credentials: 'include' // <--- OBRIGATÓRIO: Envia o cookie para o Flask
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error("Erro ao buscar dados do dashboard");
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Mapeamento dos dados do backend para os Cards visuais
  // Observação: O backend retorna 'agenda' e 'horarios', então ajustei os títulos dos cards

  const { user } = useAuth();

  const statsCards = [
    // {
    //   title: "Meus Agendamentos",
    //   value: dashboardData.stats.agenda,
    //   description: user?.tipo === 'admin' ? "Total da paróquia" : "Criados por você",
    //   icon: Users,
    //   trend: "Ativos"
    // },
    {
      title: "Agendamentos",
      value: dashboardData.stats.agenda,
      description: "Total registrado",
      icon: Users, // Usando ícone de usuários/agenda
      trend: "Ativos"
    },
    {
      title: "Eventos",
      value: dashboardData.stats.eventos,
      description: "Cadastrados no sistema",
      icon: Calendar,
      trend: "Total"
    },
    {
      title: "Avisos",
      value: dashboardData.stats.avisos,
      description: "Publicados no mural",
      icon: FileText,
      trend: "Visíveis"
    },
    {
      title: "Horários de Missa",
      value: dashboardData.stats.horarios,
      description: "Missas/Confissões",
      icon: Clock, // Troquei para Clock para fazer sentido com Horários
      trend: "Fixos"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg animate-pulse">Carregando painel paroquial...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <HeaderSecretaria />

      <main className="admin-main-container">
        <div className="admin-header-section">
          <h1 className="admin-title">Painel Administrativo</h1>
          <p className="admin-description">Visão geral da gestão paroquial</p>
        </div>

        {/* Stats Grid - Dados Reais */}
        <div className="stats-grid">
          {statsCards.map((stat, index) => (
            <Card key={index} className="stat-card">
              <CardHeader className="stat-card-header">
                <CardTitle className="stat-card-title">
                  {stat.title}
                </CardTitle>
                <stat.icon className="stat-card-icon" />
              </CardHeader>
              <CardContent>
                <div className="stat-value">{stat.value}</div>
                <p className="stat-description">{stat.description}</p>
                <span className="stat-trend">{stat.trend}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity - Dados Reais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>Últimas ações realizadas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="activity-list">
              {dashboardData.activity.length === 0 ? (
                <p className="text-muted-foreground py-4">Nenhuma atividade recente encontrada.</p>
              ) : (
                dashboardData.activity.map((activity: any, index: number) => (
                  <div key={index} className="activity-item">
                    <div>
                      <p className="activity-action">{activity.action}</p>
                      {/* O Backend retorna 'item' (ex: nome do evento), usamos aqui */}
                      <p className="activity-user">{activity.item}</p>
                    </div>
                    {/* O backend ainda não manda o tempo exato, então deixamos um placeholder ou tratamos depois */}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;