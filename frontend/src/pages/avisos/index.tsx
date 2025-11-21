import { Header } from "@/components/Header";
import { Card } from "../../components/ui/card.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Search, Bell } from "lucide-react";

import "@/static/avisos/style.css";

const Avisos = () => {
  const avisos = [
    {
      id: 1,
      title: "Inscrições Abertas - Catequese 2025",
      content:
        "Estão abertas as inscrições para a catequese de primeira comunhão 2025. Os interessados devem comparecer à secretaria paroquial de segunda a sexta, das 14h às 17h, munidos de certidão de batismo e documento de identidade.",
      date: "10/11/2024",
      imageUrl:
        "https://drive.google.com/thumbnail?id=1MQIrY3OyQl2Xmx1xTmrSw27FsEkWeLG1",
    },
    {
      id: 2,
      title: "Missa Especial do Padroeiro",
      content:
        "No próximo domingo, dia 16/11, haverá missa especial em honra ao nosso padroeiro às 18h. Convidamos toda a comunidade a participar desta celebração especial com procissão e bênção.",
      date: "08/11/2024",
      imageUrl:
        "https://drive.google.com/file/d/17arK0LkZMNtER3QR2Dh9Gd_sq4yLoQg8/",
    },
    {
      id: 3,
      title: "Campanha Solidária de Alimentos",
      content:
        "A paróquia está realizando uma campanha de arrecadação de alimentos não perecíveis para ajudar famílias carentes da nossa comunidade. As doações podem ser entregues na secretaria ou após as missas.",
      date: "05/11/2024",
      imageUrl:
        "https://placehold.co/600x300/dcfce7/166534?text=Campanha+de+Alimentos",
    },
    {
      id: 4,
      title: "Retiro Espiritual - Jovens",
      content:
        "Será realizado um retiro espiritual para jovens de 15 a 25 anos nos dias 23 e 24 de novembro. Inscrições limitadas. Mais informações na secretaria.",
      date: "03/11/2024",
      imageUrl:
        "https://placehold.co/600x300/dbeafe/1e40af?text=Retiro+Jovem",
    },
    {
      id: 5,
      title: "Renovação de Batismo",
      content:
        "Convidamos todas as famílias que desejam renovar as promessas do batismo de seus filhos para a cerimônia especial que acontecerá no dia 30/11 durante a missa das 10h.",
      date: "01/11/2024",
    },
  ];

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
            />
          </div>

          <div className="avisos-list">
            {avisos.map((aviso) => (
              <Card key={aviso.id} className="aviso-card overflow-hidden">
                {aviso.imageUrl && (
                  <div className="aviso-image-wrapper">
                    <img
                      src={aviso.imageUrl}
                      alt={`Imagem ilustrativa para ${aviso.title}`}
                      className="aviso-image"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="aviso-card-body">
                  <div className="aviso-card-content">
                    {!aviso.imageUrl && (
                      <div className="aviso-icon-wrapper">
                        <Bell className="aviso-icon" />
                      </div>
                    )}

                    <div className="aviso-details">
                      <div className="aviso-header">
                        <h2 className="aviso-title">{aviso.title}</h2>
                        <span className="aviso-date">{aviso.date}</span>
                      </div>

                      <p className="aviso-body">{aviso.content}</p>
                    </div>
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
