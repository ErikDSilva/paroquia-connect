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
  description: string;
};

// FUNÇÃO UTILITÁRIA PARA VERIFICAR SE O EVENTO ESTÁ NO PASSADO
const isEventInPast = (event: Evento): boolean => {
    // Cria uma string de data/hora no formato ISO 8601 (YYYY-MM-DDTTHH:MM)
    const eventDateTimeString = `${event.date}T${event.time}`;
    const eventDateTime = new Date(eventDateTimeString);

    // Obtém a data/hora atual
    const now = new Date();

    // Compara se a data do evento é anterior ou igual à data/hora atual
    return eventDateTime <= now;
};

  const isFormDateInPast = (formData: any): boolean => {
    if (!formData.data || !formData.horario) return false;

    // Combina a data (YYYY-MM-DD) e o horário (HH:MM) para criar um objeto Date
    const eventDateTimeString = `${formData.data}T${formData.horario}:00`; // Adiciona segundos :00
    const eventDateTime = new Date(eventDateTimeString);

    // Obtém o momento atual para comparação.
    const now = new Date();
    
    // Compara se a data/hora do evento é estritamente anterior à data/hora atual.
    return eventDateTime < now; 
};

const Eventos = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");

  const [editingId, setEditingId] = useState<number | null>(null)

  // ESTADO DO FORMULÁRIO (Adicione isto)
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "",
    local: "",
    tipo_vagas: "limitada",
    numero_vagas: "",
    data: "",
    horario: "",
    descricao: ""
  });

  const getLocalISODate = (date: Date): string => {
    const offset = date.getTimezoneOffset() * 60000; // offset em ms
    const localTime = new Date(date.getTime() - offset);
    return localTime.toISOString().split('T')[0];
}

  // Obter a data de hoje no formato YYYY-MM-DD para o atributo 'min' do input
  const todayDateString = getLocalISODate(new Date());

  // Função para atualizar o estado quando digitar
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Dados de exemplo com 'registered'
  const [events, setEvents] = useState<Evento[]>([]);

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

  // --- NOVO: Função para limpar o formulário e resetar estado de edição ---
  const resetForm = () => {
    setFormData({
      titulo: "", tipo: "", local: "", tipo_vagas: "limitada",
      numero_vagas: "", data: "", horario: "", descricao: ""
    });
    setEditingId(null); // Importante: volta para modo "Criação"
    setIsDialogOpen(false);
  };

  // --- ATUALIZADO: Função única para Salvar (Criar ou Editar) ---
const handleSaveEvent = async () => {
    try {
        // VALIDAÇÃO DE DATA
        if (isFormDateInPast(formData)) {
            toast({
                variant: "destructive",
                title: "Erro de Data",
                description: "Não é possível criar ou editar um evento para uma data passada."
            });
            return; // Interrompe a execução se a data for inválida
        }

        // Define a URL e o Método baseado se estamos editando ou criando
        const url = editingId
            ? `http://localhost:5000/api/v1/eventos/${editingId}`
            : 'http://localhost:5000/api/v1/eventos';

        const method = editingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            toast({
                title: "Sucesso!",
                description: editingId ? "Evento atualizado com sucesso." : "Evento criado com sucesso."
            });

            fetchEventos(); // Atualiza a lista
            resetForm(); // Limpa e fecha
        } else {
            throw new Error('Erro ao salvar');
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível salvar o evento."
        });
    }
};

  // --- NOVO: Função para preencher o formulário ao clicar em Editar ---
  const handleEditClick = (evento: Evento) => {
    setEditingId(evento.id); // Marca que estamos editando este ID
    setFormData({
      titulo: evento.title,
      tipo: evento.type,
      local: evento.location,
      tipo_vagas: evento.isLimited ? "limitada" : "aberta",
      numero_vagas: evento.vacancy ? String(evento.vacancy) : "",
      data: evento.date, // Certifique-se que venha no formato YYYY-MM-DD do backend
      horario: evento.time,
      descricao: evento.description || ""
    });
    setIsDialogOpen(true); // Abre o modal
  };

  // --- ATUALIZADO: Função para deletar chamando a API ---
  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta agenda?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/eventos/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Evento excluído",
          description: "O evento foi removido da agenda"
        });
        fetchEventos(); // Recarrega a lista
      } else {
        throw new Error("Erro ao deletar");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o evento."
      });
    }
  };

  const fetchEventos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/eventos'); // Vamos precisar criar essa rota no backend
      if (response.ok) {
        const data = await response.json();

        // Ajuste os dados do banco para o formato da tela se necessário
        // O Peewee retorna campos como snake_case (tipo_vagas), mas seu frontend usa camelCase ou inglês?
        // Baseado no seu type Evento (linha 16), vamos mapear:
        const eventosFormatados = data.map((evt: any) => ({
          id: evt.id,
          title: evt.titulo,
          type: evt.tipo,
          date: evt.data, // O React espera string YYYY-MM-DD, verifique se o backend manda assim
          time: evt.horario,
          location: evt.local,
          isLimited: evt.tipo_vagas === 'limitada',
          vacancy: evt.numero_vagas || 0,
          registered: 0, // Por enquanto 0, pois ainda não temos contagem de inscritos
          description: evt.descricao
        }));

        // NOVO: LÓGICA DE LIMPEZA AUTOMÁTICA DE EVENTOS PASSADOS
        const pastEvents = eventosFormatados.filter(isEventInPast);
        let successfulDeletions = 0;

        if (pastEvents.length > 0) {
            console.log(`[CLEANUP] Encontrados ${pastEvents.length} eventos passados para exclusão...`);
            
            // Itera e exclui cada evento passado SILENCIOSAMENTE
            for (const event of pastEvents) {
                try {
                    const deleteResponse = await fetch(`http://localhost:5000/api/v1/eventos/${event.id}`, {
                        method: 'DELETE'
                    });

                    if (deleteResponse.ok) {
                        successfulDeletions++;
                    } else {
                        console.error(`[CLEANUP ERROR] Falha ao excluir evento ${event.id}`);
                    }
                } catch (error) {
                    console.error(`[CLEANUP ERROR] Erro de rede ao excluir evento ${event.id}:`, error);
                }
            }

            if (successfulDeletions > 0) {
                toast({
                    title: "Limpeza automática concluída",
                    description: `${successfulDeletions} evento(s) passado(s) foram excluído(s) da agenda.`
                });

                // RECURSIVO: Chama fetchEventos novamente para carregar a lista limpa e sai
                await fetchEventos();
                return;
            }
        }
        // FIM DA LÓGICA DE LIMPEZA AUTOMÁTICA
        
        setEvents(eventosFormatados);
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível carregar a lista de eventos."
      });
    }
  };

  // Carrega os dados ao abrir a página
  useEffect(() => {
    fetchEventos();
  }, []);

  return (
    <div className="admin-agenda-page">
      <HeaderSecretaria />

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
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="formacao">Formação</SelectItem>
                    <SelectItem value="espiritualidade">Espiritualidade</SelectItem>
                    <SelectItem value="festividade">Festividade</SelectItem>
                    <SelectItem value="acaoSocial">Ação Social</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  if (!open) resetForm(); // Reseta ao fechar clicando fora
                  setIsDialogOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button className="btn-new-event" onClick={() => resetForm()}>
                      {/* onClick no botão Novo garante que o form esteja limpo */}
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
                        <Input
                          id="event-title"
                          placeholder="Ex: Missa Dominical"
                          value={formData.titulo}
                          onChange={(e) => handleInputChange('titulo', e.target.value)}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <Label htmlFor="event-type">Tipo</Label>
                          <Select onValueChange={(value) => handleInputChange('tipo', value)}>
                            <SelectTrigger id="event-type">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="outro">Outro  </SelectItem>
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
                          <Input
                            id="event-location"
                            placeholder="Ex: Igreja Matriz"
                            value={formData.local}
                            onChange={(e) => handleInputChange('local', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <Label htmlFor="event-vacancy-type">Tipo de Vagas</Label>
                          <Select
                            value={formData.tipo_vagas}
                            onValueChange={(value) => handleInputChange('tipo_vagas', value)}
                          >
                            <SelectTrigger id="event-vacancy-type">
                              <SelectValue placeholder="Selecione o tipo de vagas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="limitada">Limitadas</SelectItem>
                              <SelectItem value="aberta">Abertas (Ilimitadas)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {formData.tipo_vagas === 'limitada' && (
                          <div className="form-group">
                            <Label htmlFor="event-vacancy-count">Nº de Vagas</Label>
                            <Input
                              id="event-vacancy-count"
                              type="number"
                              placeholder="Ex: 50"
                              min="1"
                              // Esta parte do Input já estava correta no seu código:
                              value={formData.numero_vagas}
                              onChange={(e) => handleInputChange('numero_vagas', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <Label htmlFor="event-date">Data</Label>
                          <Input
                            id="event-date"
                            type="date"
                            min={!editingId ? todayDateString : undefined}
                            value={formData.data}
                            onChange={(e) => handleInputChange('data', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <Label htmlFor="event-time">Horário</Label>
                          <Input
                            id="event-time"
                            type="time"
                            value={formData.horario}
                            onChange={(e) => handleInputChange('horario', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <Label htmlFor="event-description">Descrição</Label>
                        <Textarea
                          id="event-description"
                          placeholder="Descreva o evento..."
                          rows={3}
                          // ADICIONE ESTAS DUAS LINHAS:
                          value={formData.descricao}
                          onChange={(e) => handleInputChange('descricao', e.target.value)}
                        />
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
                            <span className="metadata-label">Horário:</span> {event.time.substring(0, 5)}
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
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(event)}>
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