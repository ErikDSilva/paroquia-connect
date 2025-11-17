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
import { FilePlus, Edit, Trash2, AlertCircle, Info, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminAvisos = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const notices = [
    {
      id: 1,
      title: "Início das Celebrações de Natal",
      category: "importante",
      date: "2024-12-10",
      content: "Informamos que as celebrações especiais de Natal iniciarão no dia 20 de dezembro. Confira a programação completa...",
      views: 234
    },
    {
      id: 2,
      title: "Horário Especial - Ano Novo",
      category: "evento",
      date: "2024-12-08",
      content: "Missa especial de Ano Novo será às 23h do dia 31/12. Haverá confraternização após a celebração...",
      views: 189
    },
    {
      id: 3,
      title: "Campanha do Agasalho",
      category: "geral",
      date: "2024-12-05",
      content: "A paróquia está arrecadando agasalhos para distribuição às famílias carentes. Ponto de coleta na secretaria...",
      views: 156
    },
    {
      id: 4,
      title: "Manutenção do Sistema - Domingo",
      category: "importante",
      date: "2024-12-03",
      content: "O sistema ficará indisponível no domingo das 2h às 6h para manutenção programada...",
      views: 98
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "importante": return <AlertCircle className="h-4 w-4" />;
      case "evento": return <CheckCircle className="h-4 w-4" />;
      case "geral": return <Info className="h-4 w-4" />;
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

  const filteredNotices = selectedCategory === "all"
    ? notices
    : notices.filter(notice => notice.category === selectedCategory);

  const handleSaveNotice = () => {
    setIsDialogOpen(false);
    toast({
      title: "Aviso publicado",
      description: "O aviso foi publicado com sucesso"
    });
  };

  const handleDeleteNotice = (noticeId: number) => {
    toast({
      title: "Aviso excluído",
      description: "O aviso foi removido do mural"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Gerenciamento de Avisos</h1>
          <p className="text-muted-foreground">Gerencie os avisos e comunicados da paróquia</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Mural de Avisos</CardTitle>
                <CardDescription>Total de {notices.length} avisos publicados</CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
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
                    <Button className="w-full sm:w-auto">
                      <FilePlus className="mr-2 h-4 w-4" />
                      Novo Aviso
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Publicar Novo Aviso</DialogTitle>
                      <DialogDescription>Preencha as informações do aviso</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="notice-title">Título do Aviso</Label>
                        <Input id="notice-title" placeholder="Digite o título do aviso" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notice-category">Categoria</Label>
                        <Select>
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
                      <div className="grid gap-2">
                        <Label htmlFor="notice-content">Conteúdo</Label>
                        <Textarea
                          id="notice-content"
                          placeholder="Escreva o conteúdo do aviso..."
                          rows={6}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notice-date">Data de Publicação</Label>
                        <Input id="notice-date" type="date" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveNotice}>Publicar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNotices.map((notice) => (
                <Card key={notice.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getCategoryIcon(notice.category)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground mb-2">{notice.title}</h3>
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant={getCategoryColor(notice.category) as any}>
                                {notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(notice.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {notice.content}
                            </p>
                            <div className="text-xs text-muted-foreground mt-3">
                              {notice.views} visualizações
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNotice(notice.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

export default AdminAvisos;
