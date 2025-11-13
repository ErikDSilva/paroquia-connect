import { Header } from "@/components/Header";
import { Card } from "../../components/ui/card.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Search, Bell } from "lucide-react";

import "@/static/avisos/style.css"

// --- Componentes Fictícios (para o exemplo) ---
// (Você já deve ter componentes reais para 'Header', 'Card', e 'Input')

// ---------------------------------------------


const Avisos = () => {
  const avisos = [
    {
      id: 1,
      title: "Inscrições Abertas - Catequese 2025",
      content: "Estão abertas as inscrições para a catequese de primeira comunhão 2025. Os interessados devem comparecer à secretaria paroquial de segunda a sexta, das 14h às 17h, munidos de certidão de batismo e documento de identidade.",
      date: "10/11/2024",
    },
    {
      id: 2,
      title: "Missa Especial do Padroeiro",
      content: "No próximo domingo, dia 16/11, haverá missa especial em honra ao nosso padroeiro às 18h. Convidamos toda a comunidade a participar desta celebração especial com procissão e bênção.",
      date: "08/11/2024",
    },
    {
      id: 3,
      title: "Campanha Solidária de Alimentos",
      content: "A paróquia está realizando uma campanha de arrecadação de alimentos não perecíveis para ajudar famílias carentes da nossa comunidade. As doações podem ser entregues na secretaria ou após as missas.",
      date: "05/11/2024",
    },
    {
      id: 4,
      title: "Retiro Espiritual - Jovens",
      content: "Será realizado um retiro espiritual para jovens de 15 a 25 anos nos dias 23 e 24 de novembro. Inscrições limitadas. Mais informações na secretaria.",
      date: "03/11/2024",
    },
    {
      id: 5,
      title: "Renovação de Batismo",
      content: "Convidamos todas as famílias que desejam renovar as promessas do batismo de seus filhos para a cerimônia especial que acontecerá no dia 30/11 durante a missa das 10h.",
      date: "01/11/2024",
    },
  ];

  return (
    // 'min-h-screen bg-background'
    <div className="avisos-page">
      <Header />
      
      {/* 'container py-8' */}
      <main className="main-content">
        {/* 'max-w-4xl mx-auto' */}
        <div className="avisos-container">
          {/* 'mb-8' */}
          <div className="header-section">
            {/* 'text-3xl font-bold text-primary mb-2' */}
            <h1 className="page-title">Mural de Avisos</h1>
            {/* 'text-muted-foreground' */}
            <p className="page-description">Comunicados e notícias da paróquia</p>
          </div>

          {/* Search Bar */}
          {/* 'relative mb-8' */}
          <div className="search-bar-wrapper">
            {/* 'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' */}
            <Search className="search-icon" />
            <Input 
              placeholder="Buscar avisos..." 
              // 'pl-10 h-12'
              className="search-input"
            />
          </div>

          {/* Avisos List */}
          {/* 'space-y-4' */}
          <div className="avisos-list">
            {avisos.map((aviso) => (
              // 'p-6 hover:shadow-md transition-shadow'
              <Card key={aviso.id} className="aviso-card">
                {/* 'flex gap-4' */}
                <div className="aviso-card-content">
                  {/* 'h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0' */}
                  <div className="aviso-icon-wrapper">
                    {/* 'h-6 w-6 text-accent' */}
                    <Bell className="aviso-icon" />
                  </div>
                  {/* 'flex-1' */}
                  <div className="aviso-details">
                    {/* 'flex items-start justify-between mb-2' */}
                    <div className="aviso-header">
                      {/* 'text-xl font-semibold text-primary' */}
                      <h2 className="aviso-title">{aviso.title}</h2>
                      {/* 'text-sm text-muted-foreground whitespace-nowrap ml-4' */}
                      <span className="aviso-date">
                        {aviso.date}
                      </span>
                    </div>
                    {/* 'text-foreground/80 leading-relaxed' */}
                    <p className="aviso-body">{aviso.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Avisos;