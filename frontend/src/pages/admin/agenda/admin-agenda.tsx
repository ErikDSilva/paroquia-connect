import { useState, useEffect } from "react";
import { HeaderSecretaria } from "@/components/HeaderSecretaria";
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
import "@/static/admin/agenda-evento/style.css"

const AdminAgenda = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [events, setEvents] = useState<any[]>([]);

  // NOVO: Estado para controlar se estamos editando (guarda o ID do evento)
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "",
    data: "",
    local: "",
    horario: "",
    descricao: ""
  });

  // Função auxiliar para limpar o formulário e o estado de edição
  const resetForm = () => {
    setFormData({ titulo: "", tipo: "", data: "", local: "", horario: "", descricao: "" });
    setEditingId(null);
  };

  const fetchEventos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/agenda');
      const data = await response.json();

      const eventosFormatados = data.map((item: any) => ({
        id: item.id,
        title: item.titulo,
        type: item.tipo,
        date: item.data,
        time: item.horario,
        location: item.local,
        description: item.descricao, // Importante trazer a descrição para poder editar
        participants: 0 
      }));

      setEvents(eventosFormatados);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      toast({ variant: "destructive", title: "Erro", description: "Erro de conexão com o servidor." });
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  // Lógica Unificada: Salvar (POST) ou Editar (PUT)
  const handleSaveEvent = async () => {
    // Validação simples
    if (!formData.titulo || !formData.data) {
        toast({ variant: "destructive", title: "Atenção", description: "Preencha pelo menos Título e Data." });
        return;
    }

    try {
      // Define URL e Método baseado no modo (Edição ou Criação)
      const url = editingId 
        ? `http://localhost:5000/api/v1/agenda/${editingId}` 
        : 'http://localhost:5000/api/v1/agenda';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ 
            title: "Sucesso", 
            description: editingId ? "Evento atualizado." : "Evento criado." 
        });
        setIsDialogOpen(false);
        resetForm(); // Limpa tudo
        fetchEventos(); // Recarrega a lista
      } else {
        toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar." });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Erro de rede." });
    }
  };

  // NOVO: Função chamada ao clicar no botão de lápis
  const handleEditClick = (event: any) => {
    setEditingId(event.id); // Marca que estamos editando este ID
    
    // Preenche o formulário com os dados do evento clicado
    setFormData({
        titulo: event.title,
        tipo: event.type,
        data: event.date, // Certifique-se que o formato vindo do back é YYYY-MM-DD
        local: event.location,
        horario: event.time,
        descricao: event.description || ""
    });
    
    setIsDialogOpen(true); // Abre o modal
  };

  // Função chamada ao fechar o modal manualmente (cancelar ou clicar fora)
  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
        resetForm(); // Se fechar, limpa o estado de edição para não bugar o "Novo Evento" depois
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/v1/agenda/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: "Deletado", description: "Evento removido." });
        fetchEventos();
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  return (
    <div className="admin-agenda-page">
      <HeaderSecretaria />

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

                {/* MODIFICADO: onOpenChange controlado para limpar form ao fechar */}
                <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                  <DialogTrigger asChild>
                    <Button className="btn-new-event" onClick={resetForm}>
                      <CalendarPlus className="mr-2 icon-sm" />
                      Novo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dialog-content-lg">
                    <DialogHeader>
                      {/* Título dinâmico */}
                      <DialogTitle>{editingId ? "Editar Evento" : "Criar Novo Evento"}</DialogTitle>
                      <DialogDescription>
                        {editingId ? "Altere os dados abaixo e salve." : "Preencha os dados do novo evento."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="dialog-body">
                      {/* Campos do formulário (sem alterações, apenas usam o state formData) */}
                      <div className="form-group">
                        <Label htmlFor="event-title">Título do Evento</Label>
                        <Input
                          id="event-title"
                          placeholder="Ex: Missa Dominical"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <Label htmlFor="event-type">Tipo</Label>
                          <Select value={formData.tipo} onValueChange={(val) => setFormData({ ...formData, tipo: val })}>
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
                          <Input
                            id="event-location"
                            placeholder="Ex: Igreja Matriz"
                            value={formData.local}
                            onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <Label htmlFor="event-date">Data</Label>
                          <Input
                            id="event-date"
                            type="date"
                            value={formData.data}
                            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <Label htmlFor="event-time">Horário</Label>
                          <Input
                            id="event-time"
                            type="time"
                            value={formData.horario}
                            onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <Label htmlFor="event-description">Descrição</Label>
                        <Textarea
                          id="event-description"
                          placeholder="Descreva o evento..."
                          rows={3}
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="dialog-footer">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveEvent}>
                        {editingId ? "Salvar Alterações" : "Criar Evento"}
                      </Button>
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
                            <span className="metadata-label">Data:</span> {new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')}
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
                        {/* BOTÃO EDITAR AGORA TEM AÇÃO */}
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClick(event)}
                        >
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