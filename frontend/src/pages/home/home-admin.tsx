import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, TrendingUp } from "lucide-react";

import "@/static/home/home-admin.css"

const Admin = () => {
  const stats = [
    {
      title: "Total de Membros",
      value: "247",
      description: "+12 este mês",
      icon: Users,
      trend: "+4.8%"
    },
    {
      title: "Eventos Ativos",
      value: "15",
      description: "Próximos 30 dias",
      icon: Calendar,
      trend: "+2"
    },
    {
      title: "Avisos Publicados",
      value: "8",
      description: "Este mês",
      icon: FileText,
      trend: "+3"
    },
    {
      title: "Inscrições em Eventos",
      value: "128",
      description: "Total ativo",
      icon: TrendingUp,
      trend: "+18%"
    }
  ];

  const recentActivity = [
    { action: "Novo membro cadastrado", user: "Maria Silva", time: "há 2 horas" },
    { action: "Inscrição em evento", user: "João Santos", time: "há 3 horas" },
    { action: "Aviso publicado", user: "Secretaria", time: "há 5 horas" },
    { action: "Evento criado", user: "Secretaria", time: "há 1 dia" },
    { action: "Membro atualizado", user: "Ana Costa", time: "há 2 dias" }
  ];

  return (
    // 'min-h-screen bg-gradient-to-b from-background to-background/80'
    <div className="admin-page">
      <Header />
      
      {/* 'container mx-auto px-4 py-8' */}
      <main className="admin-main-container">
        {/* 'mb-8' */}
        <div className="admin-header-section">
          {/* 'text-4xl font-bold text-foreground mb-2' */}
          <h1 className="admin-title">Painel Administrativo</h1>
          {/* 'text-muted-foreground' */}
          <p className="admin-description">Visão geral da gestão paroquial</p>
        </div>

        {/* Stats Grid */}
        {/* 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8' */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            // 'hover:shadow-lg transition-shadow'
            <Card key={index} className="stat-card">
              {/* 'flex flex-row items-center justify-between pb-2' */}
              <CardHeader className="stat-card-header">
                {/* 'text-sm font-medium text-muted-foreground' */}
                <CardTitle className="stat-card-title">
                  {stat.title}
                </CardTitle>
                {/* 'h-4 w-4 text-primary' */}
                <stat.icon className="stat-card-icon" />
              </CardHeader>
              <CardContent>
                {/* 'text-3xl font-bold text-foreground mb-1' */}
                <div className="stat-value">{stat.value}</div>
                {/* 'text-xs text-muted-foreground mb-2' */}
                <p className="stat-description">{stat.description}</p>
                {/* 'text-xs font-medium text-primary' */}
                <span className="stat-trend">{stat.trend}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações realizadas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 'space-y-4' */}
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                // 'flex items-center justify-between py-3 border-b last:border-b-0'
                <div key={index} className="activity-item">
                  <div>
                    {/* 'font-medium text-foreground' */}
                    <p className="activity-action">{activity.action}</p>
                    {/* 'text-sm text-muted-foreground' */}
                    <p className="activity-user">{activity.user}</p>
                  </div>
                  {/* 'text-sm text-muted-foreground' */}
                  <span className="activity-time">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;