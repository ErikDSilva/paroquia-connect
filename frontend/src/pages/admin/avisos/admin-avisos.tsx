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
import { FilePlus, Edit, Trash2, AlertCircle, Info, CheckCircle, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/context/AuthContext";

import "@/static/admin/avisos/style.css";

const API_URL = import.meta.env.VITE_API_URL;

// Interface atualizada
interface Aviso {
  id: number;
  titulo: string;
  categoria: string;
  descricao: string;
  data: string;
  url?: string;
  criado_por_id: number | null;
}

const getLocalISODate = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000; // offset em ms
  const localTime = new Date(date.getTime() - offset);
  return localTime.toISOString().split('T')[0];
}

// Obter a data de hoje no formato YYYY-MM-DD para o atributo 'min' do input
const todayDateString = getLocalISODate(new Date());

const AdminAvisos = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Estado para saber se estamos editando (armazena o ID ou null)
  const [editingId, setEditingId] = useState<number | null>(null);

  const [notices, setNotices] = useState<Aviso[]>([]);

  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "",
    descricao: "",
    data: "",
    url: ""
  });

  const fetchAvisos = async () => {
    try {
      const response = await fetch(`${API_URL}/avisos`);
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      } else {
        console.error("Erro ao buscar avisos");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  };

  useEffect(() => {
    fetchAvisos();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "importante": return <AlertCircle className="categoryIcon" />;
      case "evento": return <CheckCircle className="categoryIcon" />;
      case "geral": return <Info className="categoryIcon" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "importante": return "destructive";
      case "evento": return "default";
      case "geral": return "secondary";
      default: return "default";
    }
  };

  // Função para abrir o modal em modo de CRIAÇÃO
  const handleOpenCreate = () => {
    setEditingId(null); // Garante que não é edição
    setFormData({ titulo: "", categoria: "", descricao: "", data: "", url: "" }); // Limpa form
    setIsDialogOpen(true);
  };

  // Função para abrir o modal em modo de EDIÇÃO
  const handleOpenEdit = (notice: Aviso) => {
    setEditingId(notice.id);
    setFormData({
      titulo: notice.titulo,
      categoria: notice.categoria,
      descricao: notice.descricao,
      // Se a data vier completa (ISO), pegamos só a parte YYYY-MM-DD para o input type="date"
      data: notice.data.split('T')[0],
      url: notice.url || ""
    });
    setIsDialogOpen(true);
  };

  const filteredNotices = selectedCategory === "all"
    ? notices
    : notices.filter(notice => notice.categoria === selectedCategory);

  // Função Unificada para Salvar (POST ou PUT)
  const handleSaveNotice = async () => {
    // Validação simples
    if (!formData.titulo || !formData.categoria || !formData.data) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios.", variant: "destructive" });
      return;
    }

    try {
      const isEditing = editingId !== null;

      // Define a URL e o Método com base no estado de edição
      const url = isEditing
        ? `${API_URL}/avisos/${editingId}`
        : `${API_URL}/avisos`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: isEditing ? "Aviso atualizado!" : "Aviso publicado!"
        });
        setIsDialogOpen(false);
        setFormData({ titulo: "", categoria: "", descricao: "", data: "", url: "" });
        setEditingId(null);
        fetchAvisos(); // Recarrega a lista
      } else {
        toast({ title: "Erro", description: "Falha ao salvar aviso.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Erro de conexão com o servidor.", variant: "destructive" });
    }
  };

  const handleDeleteNotice = async (noticeId: number) => {
    if (!confirm("Tem certeza que deseja excluir este aviso?")) return;

    try {
      const response = await fetch(`${API_URL}/avisos/${noticeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast({ title: "Aviso excluído", description: "O aviso foi removido." });
        fetchAvisos();
      } else {
        toast({ title: "Erro", description: "Não foi possível excluir.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="pageContainer">
      <HeaderSecretaria />

      <main className="mainContent">
        <div className="headerSection">
          <h1 className="pageTitle">Gerenciamento de Avisos</h1>
          <p className="pageSubtitle">Gerencie os avisos e comunicados da paróquia</p>
        </div>

        <Card>
          <CardHeader>
            <div className="cardHeaderContainer">
              <div>
                <CardTitle>Mural de Avisos</CardTitle>
                <CardDescription>Total de {notices.length} avisos publicados</CardDescription>
              </div>

              <div className="actionsContainer">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="selectTrigger">
                    <SelectValue placeholder="Filtrar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="importante">Importante</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="newNoticeButton" onClick={handleOpenCreate}>
                      <FilePlus className="buttonIcon" />
                      Novo Aviso
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dialogContent">
                    <DialogHeader>
                      <DialogTitle>{editingId ? "Editar Aviso" : "Publicar Novo Aviso"}</DialogTitle>
                      <DialogDescription>
                        {editingId ? "Altere as informações abaixo" : "Preencha as informações do aviso"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="formGrid">
                      <div className="inputGroup">
                        <Label htmlFor="notice-title">Título do Aviso *</Label>
                        <Input
                          id="notice-title"
                          placeholder="Digite o título do aviso"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        />
                      </div>
                      <div className="inputGroup">
                        <Label htmlFor="notice-category">Categoria *</Label>
                        <Select
                          value={formData.categoria}
                          onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                        >
                          <SelectTrigger id="notice-category">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="importante">Importante</SelectItem>
                            <SelectItem value="evento">Evento</SelectItem>
                            <SelectItem value="geral">Geral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* --- NOVO CAMPO DE URL ADICIONADO AQUI --- */}
                      <div className="inputGroup">
                        <Label htmlFor="notice-url">URL da Imagem (Opcional)</Label>
                        <Input
                          id="notice-url"
                          placeholder="https://exemplo.com/imagem.jpg"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />
                      </div>

                      <div className="inputGroup">
                        <Label htmlFor="notice-date">Data de Publicação *</Label>
                        <Input
                          id="notice-date"
                          type="date"
                          min={!editingId ? todayDateString : undefined}
                          value={formData.data}
                          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        />
                      </div>

                      <div className="inputGroup" style={{ gridColumn: '1 / -1' }}>
                        <Label htmlFor="notice-content">Conteúdo</Label>
                        <Textarea
                          id="notice-content"
                          placeholder="Escreva o conteúdo do aviso..."
                          rows={6}
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="dialogFooter">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveNotice}>
                        {editingId ? "Salvar Alterações" : "Publicar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="noticesList">
              {filteredNotices.map((notice) => (
                <Card key={notice.id} className="noticeCard">
                  <CardContent className="cardPadding">
                    <div className="noticeLayout">
                      <div className="noticeContentWrapper">
                        <div className="noticeHeader">
                          <div className="categoryIconWrapper">
                            {getCategoryIcon(notice.categoria)}
                          </div>
                          <div className="noticeInfo">
                            <h3 className="noticeTitle">{notice.titulo}</h3>
                            <div className="noticeMeta">
                              <Badge variant={getCategoryColor(notice.categoria) as any}>
                                {notice.categoria ? notice.categoria.charAt(0).toUpperCase() + notice.categoria.slice(1) : 'Geral'}
                              </Badge>
                              <span className="noticeDate">
                                {notice.data ? new Date(notice.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}
                              </span>
                              {/* Exibe ícone se tiver URL */}
                              {notice.url && (
                                <a href={notice.url} target="_blank" rel="noreferrer" title="Ver imagem" className="ml-2 text-blue-500 hover:text-blue-700">
                                  <LinkIcon size={14} />
                                </a>
                              )}
                            </div>
                            <p className="noticeText">
                              {notice.descricao}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="actionButtons">
                        {/* LÓGICA DE PERMISSÃO NA UI */}
                        {(user?.tipo === 'admin' || notice.criado_por_id === user?.id) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(notice)}
                            >
                              <Edit className="categoryIcon" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNotice(notice.id)}
                            >
                              <Trash2 className="deleteIcon" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredNotices.length === 0 && (
                <p className="text-center text-gray-500 py-8">Nenhum aviso encontrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAvisos;