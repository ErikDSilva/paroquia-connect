import { useState, useEffect } from "react";
import { HeaderSecretaria } from "@/components/HeaderSecretaria";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import "@/static/admin/horarios/style.css";

// Interface alinhada com o Banco de Dados (titulo em vez de tipo)
interface Horario {
  id: number;
  dia: string;
  titulo: string;
  horario: string;
  local: string;
}

const diasSemana = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo"
];

const AdminHorarios = () => {
  const { toast } = useToast();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
  
  const [formData, setFormData] = useState({
    dia: "",
    titulo: "", // Campo livre para o nome da atividade
    horario: "",
    local: ""
  });

  // 1. BUSCAR DADOS (GET)
  const fetchHorarios = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/horarios");
      if (response.ok) {
        const data = await response.json();
        setHorarios(data);
      } else {
        console.error("Erro ao buscar horários");
        toast({ title: "Erro", description: "Falha ao carregar horários.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      toast({ title: "Erro", description: "Erro de conexão com o servidor.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, []);

  // 2. SALVAR (POST ou PUT)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!formData.dia || !formData.titulo || !formData.horario || !formData.local) {
        toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
        return;
    }

    try {
        const isEditing = editingHorario !== null;
        const url = isEditing 
            ? `http://localhost:5000/api/v1/horarios/${editingHorario.id}`
            : "http://localhost:5000/api/v1/horarios";
        
        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            toast({ 
                title: isEditing ? "Horário atualizado" : "Horário adicionado",
                description: "Operação realizada com sucesso."
            });
            setIsDialogOpen(false);
            resetForm();
            fetchHorarios();
        } else {
            const errorData = await response.json();
            toast({ title: "Erro", description: errorData.error || "Falha ao salvar.", variant: "destructive" });
        }

    } catch (error) {
        console.error(error);
        toast({ title: "Erro", description: "Erro de conexão.", variant: "destructive" });
    }
  };

  // Prepara formulário para edição
  const handleEdit = (horario: Horario) => {
    setEditingHorario(horario);
    setFormData({
      dia: horario.dia,
      titulo: horario.titulo,
      // Garante formato HH:MM para o input time
      horario: horario.horario.substring(0, 5),
      local: horario.local
    });
    setIsDialogOpen(true);
  };

  // 3. DELETAR (DELETE)
  const handleDelete = async (id: number) => {
    if(!confirm("Deseja realmente excluir este horário?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/v1/horarios/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            toast({ title: "Horário excluído", description: "O horário foi removido." });
            fetchHorarios();
        } else {
            toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
        }
    } catch (error) {
        console.error(error);
        toast({ title: "Erro", description: "Erro de conexão.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingHorario(null);
    setFormData({
      dia: "",
      titulo: "",
      horario: "",
      local: ""
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getHorariosPorDia = (dia: string) => {
    return horarios
      .filter(h => h.dia === dia)
      .sort((a, b) => a.horario.localeCompare(b.horario));
  };

  return (
    <div className="pageWrapper">
      <HeaderSecretaria />
      
      <main className="mainContainer">
        <div className="contentWrapper">
          <div className="pageHeader">
            <div>
              <h1 className="title">Gerenciar Horários</h1>
              <p className="subtitle">
                Cadastre e organize os horários das atividades semanais da paróquia
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="iconWithText" />
                  Novo Horário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingHorario ? "Editar Horário" : "Novo Horário"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do horário da atividade
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSave}>
                  <div className="formContainer">
                    <div className="formGroup">
                      <Label htmlFor="dia">Dia da Semana</Label>
                      <Select
                        value={formData.dia}
                        onValueChange={(value) => setFormData({ ...formData, dia: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                        <SelectContent>
                          {diasSemana.map(dia => (
                            <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="formGroup">
                      <Label htmlFor="titulo">Nome da Atividade</Label>
                      <Input
                        id="titulo"
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        placeholder="Ex: Missa, Terço, Grupo de Oração..."
                        required
                      />
                    </div>

                    <div className="formGroup">
                      <Label htmlFor="horario">Horário</Label>
                      <Input
                        id="horario"
                        type="time"
                        value={formData.horario}
                        onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                        required
                      />
                    </div>

                    <div className="formGroup">
                      <Label htmlFor="local">Local</Label>
                      <Input
                        id="local"
                        value={formData.local}
                        onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                        placeholder="Ex: Igreja Matriz"
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingHorario ? "Salvar Alterações" : "Adicionar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="cardsList">
            {diasSemana.map(dia => {
              const horariosDoDia = getHorariosPorDia(dia);
              
              return (
                <Card key={dia}>
                  <CardHeader>
                    <CardTitle>{dia}</CardTitle>
                    <CardDescription>
                      {horariosDoDia.length} {horariosDoDia.length === 1 ? 'atividade' : 'atividades'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {horariosDoDia.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Horário</TableHead>
                            <TableHead>Atividade</TableHead>
                            <TableHead>Local</TableHead>
                            <TableHead className="cellActions">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {horariosDoDia.map(horario => (
                            <TableRow key={horario.id}>
                              <TableCell className="font-medium">
                                {horario.horario.substring(0, 5)}
                              </TableCell>
                              <TableCell>{horario.titulo}</TableCell>
                              <TableCell>{horario.local}</TableCell>
                              <TableCell className="cellActions">
                                <div className="actionButtons">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(horario)}
                                  >
                                    <Pencil className="icon" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(horario.id)}
                                  >
                                    <Trash2 className="deleteIcon" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="emptyState">
                        Nenhuma atividade cadastrada para este dia
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHorarios;