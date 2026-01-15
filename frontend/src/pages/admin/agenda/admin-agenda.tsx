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
import { CalendarPlus, Edit, Trash2, Church, Heart, Baby, Users, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import "@/static/admin/agenda-evento/style.css"

// Mapeamento de Cores por Tipo
const getTypeColorClass = (type: string) => {
  const map: Record<string, string> = {
    missa: "border-l-blue-600 bg-blue-50 text-blue-700",
    casamento: "border-l-rose-500 bg-rose-50 text-rose-700",
    batismo: "border-l-cyan-500 bg-cyan-50 text-cyan-700",
    pastoral: "border-l-amber-500 bg-amber-50 text-amber-700",
  };
  return map[type] || "border-l-gray-400 bg-gray-50 text-gray-700";
};

// Mapeamento de Ícones
const getTypeIcon = (type: string) => {
  switch (type) {
    case "missa": return <Church className="h-5 w-5" />;
    case "casamento": return <Heart className="h-5 w-5" />;
    case "batismo": return <Baby className="h-5 w-5" />;
    case "pastoral": return <Users className="h-5 w-5" />;
    default: return <Church className="h-5 w-5" />;
  }
};

const AdminAgenda = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [events, setEvents] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "",
    data: "",
    local: "",
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
        description: item.descricao,
        participants: 0,
        criado_por_id: item.criado_por
      }));
      setEvents(eventosFormatados);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  useEffect(() => { fetchEventos(); }, []);

  const handleSaveEvent = async () => {
    if (!formData.titulo || !formData.data) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha Título e Data." });
      return;
    }
    try {
      const url = editingId ? `http://localhost:5000/api/v1/agenda/${editingId}` : 'http://localhost:5000/api/v1/agenda';
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ title: "Sucesso", description: editingId ? "Atualizado." : "Criado." });
        setIsDialogOpen(false);
        resetForm();
        fetchEventos();
      }
    } catch (error) { console.error(error); }
  };

  const handleEditClick = (event: any) => {
    setEditingId(event.id);
    setFormData({
      titulo: event.title,
      tipo: event.type,
      data: event.date,
      local: event.location,
      horario: event.time,
      descricao: event.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Excluir agenda?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/agenda/${id}`, { method: 'DELETE', credentials: "include" });
      if (res.ok) { fetchEventos(); }
    } catch (e) { console.error(e); }
  };

  // Auxiliar para separar Dia e Mês
  const getDateParts = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase()
    };
  };

  const filteredEvents = selectedType === "all" ? events : events.filter(e => e.type === selectedType);

  return (
    <div className="admin-agenda-page">
      <HeaderSecretaria />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Gerenciamento de Agenda</h1>
          <p className="page-subtitle">Organize a agenda</p>
        </div>

        <Card className="border-none shadow-sm bg-transparent">
          <CardHeader className="px-0 pt-0">
            <div className="card-header-wrapper bg-white p-6 rounded-lg border shadow-sm mb-6">
              <div>
                <CardTitle>Agenda Paroquial</CardTitle>
                <CardDescription>Visualizando {filteredEvents.length} agendamentos</CardDescription>
              </div>
              <div className="controls-group">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="select-filter"><SelectValue placeholder="Filtrar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="missa">Missas</SelectItem>
                    <SelectItem value="casamento">Casamentos</SelectItem>
                    <SelectItem value="batismo">Batismos</SelectItem>
                    <SelectItem value="pastoral">Pastorais</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button className="btn-new-event bg-[#002366] hover:bg-[#003399]">
                      <CalendarPlus className="mr-2 h-4 w-4" /> Novo Agendamento
                    </Button>
                  </DialogTrigger>
                  {/* ... CONTEUDO DO DIALOG (Mantido igual ao seu original) ... */}
                  <DialogContent className="dialog-content-lg">
                      <DialogHeader>
                        <DialogTitle>{editingId ? "Editar Agenda" : "Novo Agendamento"}</DialogTitle>
                        <DialogDescription>Preencha os detalhes abaixo.</DialogDescription>
                      </DialogHeader>
                      <div className="dialog-body">
                         {/* Seus inputs aqui (mantive a lógica igual) */}
                         <div className="form-group"><Label>Título</Label><Input value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} /></div>
                         <div className="form-row">
                            <div className="form-group"><Label>Tipo</Label>
                                <Select value={formData.tipo} onValueChange={v => setFormData({...formData, tipo: v})}>
                                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="missa">Missa</SelectItem>
                                        <SelectItem value="casamento">Casamento</SelectItem>
                                        <SelectItem value="batismo">Batismo</SelectItem>
                                        <SelectItem value="pastoral">Pastoral</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="form-group"><Label>Local</Label><Input value={formData.local} onChange={e => setFormData({...formData, local: e.target.value})} /></div>
                         </div>
                         <div className="form-row">
                            <div className="form-group"><Label>Data</Label><Input type="date" min={!editingId ? todayDateString : undefined} value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} /></div>
                            <div className="form-group"><Label>Horário</Label><Input type="time" value={formData.horario} onChange={e => setFormData({...formData, horario: e.target.value})} /></div>
                         </div>
                         <div className="form-group"><Label>Descrição</Label><Textarea value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} /></div>
                      </div>
                      <div className="dialog-footer">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveEvent} className="bg-[#002366]">Salvar</Button>
                      </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-0">
            <div className="grid grid-cols-1 gap-4">
              {filteredEvents.map((event) => {
                const dateParts = getDateParts(event.date);
                const colorClass = getTypeColorClass(event.type); // Classe CSS dinâmica
                
                return (
                  <div key={event.id} className="group relative flex bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200">
                    
                    {/* 1. Borda Colorida Lateral Esquerda */}
                    <div className={`w-2 ${colorClass.split(' ')[0]} border-l-[6px]`}></div>

                    {/* 2. Bloco de Data Visual */}
                    <div className="flex flex-col items-center justify-center min-w-[80px] px-4 py-3 bg-slate-50 border-r border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{dateParts.month}</span>
                      <span className="text-2xl font-bold text-slate-700">{dateParts.day}</span>
                    </div>

                    <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* 3. Detalhes Principais */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                           <Badge variant="outline" className={`capitalize px-2 py-0.5 text-xs font-semibold ${colorClass.split(' ').slice(1).join(' ')} border-transparent`}>
                             {getTypeIcon(event.type)}
                             <span className="ml-1.5">{event.type}</span>
                           </Badge>
                           <span className="flex items-center text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 mr-1" /> {event.time.slice(0, 5)}
                           </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">{event.title}</h3>
                        
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {event.location}
                        </div>
                      </div>

                      {/* 4. Ações (Só aparecem se tiver permissão) */}
                      {(user?.tipo === 'admin' || event.criado_por_id === user?.id) && (
                        <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(event)} className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)} className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAgenda;