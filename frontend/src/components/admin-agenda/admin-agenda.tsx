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
import { CalendarPlus, Edit, Trash2, Church, Heart, Baby, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "@/static/admin/agenda/style.css"


const AdminAgenda = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");

  const events = [
    { id: 1, title: "Missa Dominical", type: "missa", date: "2024-12-15", time: "10:00", location: "Igreja Matriz", participants: 0 },
    { id: 2, title: "Casamento - João e Maria", type: "casamento", date: "2024-12-20", time: "15:00", location: "Capela São José", participants: 80 },
    { id: 3, title: "Batismo - Pedro Silva", type: "batismo", date: "2024-12-22", time: "14:00", location: "Igreja Matriz", participants: 30 },
    { id: 4, title: "Encontro Jovens", type: "pastoral", date: "2024-12-18", time: "19:00", location: "Salão Paroquial", participants: 45 },
    { id: 5, title: "Missa da Noite", type: "missa", date: "2024-12-15", time: "19:00", location: "Igreja Matriz", participants: 0 }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "missa": return <Church className="icon-sm" />;
      case "casamento": return <Heart className="icon-sm" />;
      case "batismo": return <Baby className="icon-sm" />;
      case "pastoral": return <Users className="icon-sm" />;
      default: return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      missa: "default",
      casamento: "secondary",
      batismo: "outline",
      pastoral: "default"
    };
    return variants[type] || "default";
  };

  const filteredEvents = selectedType === "all" 
    ? events 
    : events.filter(event => event.type === selectedType);

  const handleSaveEvent = () => {
    setIsDialogOpen(false);
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
          <h1 className="page-title">Gerenciamento de Agenda</h1>
          <p className="page-subtitle">Gerencie missas, casamentos, batismos e eventos pastorais</p>
        </div>

        <Card>
          <CardHeader>
            <div className="card-header-wrapper">
              <div>
                <CardTitle>Agenda Paroquial</CardTitle>
                <CardDescription>Total de {events.length} eventos cadastrados</CardDescription>
              </div>
              
              <div className="controls-group">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="select-filter">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="missa">Missas</SelectItem>
                    <SelectItem value="casamento">Casamentos</SelectItem>
                    <SelectItem value="batismo">Batismos</SelectItem>
                    <SelectItem value="pastoral">Eventos Pastorais</SelectItem>
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
                              <SelectItem value="missa">Missa</SelectItem>
                              <SelectItem value="casamento">Casamento</SelectItem>
                              <SelectItem value="batismo">Batismo</SelectItem>
                              <SelectItem value="pastoral">Evento Pastoral</SelectItem>
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
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
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
                        
                        {event.participants > 0 && (
                          <div className="event-participants-info">
                            <span className="metadata-label">Participantes:</span> {event.participants}
                          </div>
                        )}
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

export default AdminAgenda;