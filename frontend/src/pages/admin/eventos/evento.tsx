import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarPlus, Edit, Trash2, BookOpen, Sparkles, PartyPopper, HandHeart, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "@/static/admin/agenda-evento/style.css"

type Evento = {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  isLimited: boolean;
  vacancy: number;
  registered: number;
};

const Eventos = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [vacancyType, setVacancyType] = useState("limitada");

  // Dados de exemplo com 'registered'
  const events: Evento[] = [
    { id: 1, title: "Retiro de Advento", type: "formacao", date: "2024-12-10", time: "08:00", location: "Casa de Retiros São Paulo", isLimited: true, vacancy: 120, registered: 85 },
    { id: 2, title: "Adoração ao Santíssimo", type: "espiritualidade", date: "2024-12-15", time: "20:00", location: "Igreja Matriz", isLimited: true, vacancy: 40, registered: 40 },
    { id: 3, title: "Quermesse Paroquial", type: "festividade", date: "2024-12-22", time: "17:00", location: "Pátio da Paróquia", isLimited: false, vacancy: 0, registered: 210 },
    { id: 4, title: "Campanha do Agasalho – Triagem", type: "acaoSocial", date: "2024-12-18", time: "14:00", location: "Salão Paroquial", isLimited: true, vacancy: 25, registered: 12 },
    { id: 5, title: "Reunião do CPP", type: "administrativo", date: "2024-12-20", time: "19:30", location: "Sala de Reuniões", isLimited: true, vacancy: 12, registered: 10 }
  ];

  const getTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      formacao: "Formação",
      espiritualidade: "Espiritualidade",
      festividade: "Festividade",
      acaoSocial: "Ação Social",
      administrativo: "Administrativo"
    };
    return typeNames[type] || (type.charAt(0).toUpperCase() + type.slice(1));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "formacao": return <BookOpen className="icon-sm" />;
      case "espiritualidade": return <Sparkles className="icon-sm" />;
      case "festividade": return <PartyPopper className="icon-sm" />;
      case "acaoSocial": return <HandHeart className="icon-sm" />;
      case "administrativo": return <ClipboardList className="icon-sm" />;
      default: return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      formacao: "default",
      espiritualidade: "secondary",
      festividade: "outline",
      acaoSocial: "default",
      administrativo: "secondary"
    };
    return variants[type] || "default";
  };

  const filteredEvents = selectedType === "all"
    ? events
    : events.filter(event => event.type === selectedType);

  const handleSaveEvent = () => {
    setIsDialogOpen(false);
    setVacancyType("limitada");
    toast({
      title: "Evento criado",
      description: "Novo evento adicionado à agenda"
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    toast({
      title: "Evento excluído",
      description: "O evento foi removido da agenda"
    });
  };

  return (
    <div className="admin-agenda-page">
      <Header />

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Gerenciamento de Eventos</h1>
          <p className="page-subtitle">Gerencie eventos pastorais</p>
        </div>

        <Card>
          <CardHeader>
            <div className="card-header-wrapper">
              <div>
                <CardTitle>Eventos Paroquiais</CardTitle>
                <CardDescription>Total de {events.length} eventos cadastrados</CardDescription>
              </div>

              <div className="controls-group">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="select-filter">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="formacao">Formação</SelectItem>
                    <SelectItem value="espiritualidade">Espiritualidade</SelectItem>
                    <SelectItem value="festividade">Festividade</SelectItem>
                    <SelectItem value="acaoSocial">Ação Social</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-new-event">
                      <CalendarPlus className="mr-2 icon-sm" />
                      Novo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dialog-content-lg">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Evento</DialogTitle>
                      <DialogDescription>Preencha os dados do evento</DialogDescription>
                    </DialogHeader>
                    <div className="dialog-body">
                      {/* Campos do formulário */}
                      <div className="form-group">
                        <Label htmlFor="event-title">Título do Evento</Label>
                        <Input id="event-title" placeholder="Ex: Missa Dominical" />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <Label htmlFor="event-type">Tipo</Label>
                          <Select>
                            <SelectTrigger id="event-type">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="formacao">Formação</SelectItem>
                              <SelectItem value="espiritualidade">Espiritualidade</SelectItem>
                              <SelectItem value="festividade">Festividade</SelectItem>
                              <SelectItem value="acaoSocial">Ação Social</SelectItem>
                              <SelectItem value="administrativo">Administrativo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="form-group">
                          <Label htmlFor="event-location">Local</Label>
                          <Input id="event-location" placeholder="Ex: Igreja Matriz" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <Label htmlFor="event-vacancy-type">Tipo de Vagas</Label>
                          <Select value={vacancyType} onValueChange={setVacancyType}>
                            <SelectTrigger id="event-vacancy-type">
                              <SelectValue placeholder="Selecione o tipo de vagas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="limitada">Limitadas</SelectItem>
                              <SelectItem value="aberta">Abertas (Ilimitadas)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {vacancyType === 'limitada' && (
                          <div className="form-group">
                            <Label htmlFor="event-vacancy-count">Nº de Vagas</Label>
                            <Input id="event-vacancy-count" type="number" placeholder="Ex: 50" min="1" />
                          </div>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <Label htmlFor="event-date">Data</Label>
                          <Input id="event-date" type="date" />
                        </div>
                        <div className="form-group">
                          <Label htmlFor="event-time">Horário</Label>
                          <Input id="event-time" type="time" />
                        </div>
                      </div>
                      <div className="form-group">
                        <Label htmlFor="event-description">Descrição</Label>
                        <Textarea id="event-description" placeholder="Descreva o evento..." rows={3} />
                      </div>
                    </div>
                    <div className="dialog-footer">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveEvent}>Criar Evento</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="events-list">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="event-card">
                  <CardContent className="event-card-content">
                    <div className="event-details-wrapper">
                      <div className="event-main-details">
                        <div className="event-icon-badge">
                          <div className="mt-1">
                            {getTypeIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="event-title">{event.title}</h3>
                            <Badge variant={getTypeBadge(event.type) as any}>
                              {getTypeName(event.type)}
                            </Badge>
                          </div>
                        </div>

                        <div className="event-metadata">
                          <div className="metadata-item">
                            <span className="metadata-label">Data:</span> {new Date(event.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Horário:</span> {event.time}
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Local:</span> {event.location}
                          </div>
                        </div>

                        {/* ===== INÍCIO DA ATUALIZAÇÃO DE EXIBIÇÃO ===== */}
                        <div className="event-participants-info">
                          {event.isLimited ? (
                            <>
                              <span className="metadata-label">Vagas:</span> {event.registered} / {event.vacancy}
                              
                              {/* Indicador de "Lotado" */}
                              {event.registered >= event.vacancy && (
                                <span style={{ marginLeft: '0.5rem', fontWeight: 500 }} className="text-destructive">
                                  (Lotado)
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="metadata-label">Registrados:</span> {event.registered}
                            </>
                          )}
                        </div>
                        {/* ===== FIM DA ATUALIZAÇÃO DE EXIBIÇÃO ===== */}
                        
                      </div>

                      <div className="event-actions">
                        <Button variant="ghost" size="icon">
                          <Edit className="icon-sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="icon-sm text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Eventos;