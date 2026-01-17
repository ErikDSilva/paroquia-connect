import { useState, useEffect, useCallback, useMemo } from "react";
import { HeaderSecretaria } from "@/components/HeaderSecretaria";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

// URL base já inclui o prefixo /api/v1/admin_management
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}/admin_management`;

interface Admin {
    id: number;
    name: string;
    email: string;
    phone: string;
    joined: string; // Mantido, mas será fixado como "N/A" no backend
    is_admin: boolean; // Mantido, mas será fixado como False no backend
}

const AdminMembros = () => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddAdminForm, setShowAddAdminForm] = useState(false);

    const { user } = useAuth(); // Obtenha o usuário logado
    const isAdmin = user?.tipo === 'admin'; // Verificação de nível de acesso

    // --- ESTADOS DE CADASTRO (POST) ---
    const [newAdminData, setNewAdminData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    // --- ESTADOS DE EDIÇÃO (PUT) ---
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '' // Senha é opcional na edição
    });


    // --- FUNÇÕES DE BUSCA/LOAD (GET) ---
    const fetchAdmins = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/admins`);

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Erro ao carregar administradores: ${response.status}`);
            }

            setAdmins(result as Admin[]);
        } catch (err) {
            console.error("Erro ao buscar admins:", err);
            setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar dados.");
            toast({
                title: "Erro de Conexão",
                description: "Não foi possível carregar a lista de administradores.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    // --- LÓGICA DE CADASTRO ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewAdminData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
            toast({
                title: "Erro de Validação",
                description: "Nome, E-mail e Senha são obrigatórios.",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newAdminData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Falha ao cadastrar administrador.");
            }

            toast({
                title: "Administrador Cadastrado!",
                description: `O novo administrador ${newAdminData.name} foi adicionado.`,
            });

            await fetchAdmins();
            setNewAdminData({ name: "", email: "", phone: "", password: "" });
            setShowAddAdminForm(false);
        } catch (error) {
            console.error("Erro no cadastro:", error);
            toast({
                title: "Erro no Cadastro",
                description: error instanceof Error ? error.message : "Erro desconhecido ao cadastrar.",
                variant: "destructive",
            });
        }
    };

    // --- LÓGICA DE EDIÇÃO (PUT) ---
    const handleStartEdit = (admin: Admin) => {
        setEditingAdmin(admin);
        setEditData({
            name: admin.name,
            email: admin.email,
            phone: admin.phone === 'N/A' ? '' : admin.phone,
            password: ''
        });
        // Garante que o formulário de cadastro está fechado
        setShowAddAdminForm(false);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        setEditingAdmin(null);
        setEditData({ name: '', email: '', phone: '', password: '' });
    };

    const handleUpdateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingAdmin) return;

        // 1. Prepara os dados (apenas campos que não são a senha)
        const payload: any = {
            name: editData.name,
            email: editData.email,
            phone: editData.phone || null,
        };

        // 2. Adiciona a senha apenas se for preenchida
        if (editData.password) {
            payload.password = editData.password;
        }

        if (!payload.name || !payload.email) {
            toast({
                title: "Erro de Validação",
                description: "Nome e E-mail são obrigatórios.",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admins/${editingAdmin.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Falha ao atualizar administrador.");
            }

            toast({
                title: "Administrador Atualizado!",
                description: `Os dados de ${payload.name} foram salvos.`,
            });

            handleCancelEdit();
            await fetchAdmins();
        } catch (error) {
            console.error("Erro na atualização:", error);
            toast({
                title: "Erro na Atualização",
                description: error instanceof Error ? error.message : "Erro desconhecido ao atualizar.",
                variant: "destructive",
            });
        }
    };

    // --- FUNÇÃO DE EXCLUSÃO (DELETE) ---
    const handleDeleteAdmin = async (adminId: number, adminName: string) => {
        if (window.confirm(`Tem certeza que deseja excluir permanentemente o administrador "${adminName}"?`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/admins/${adminId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Falha ao excluir administrador.");
                }

                toast({
                    title: "Administrador Excluído",
                    description: `O administrador ${adminName} foi removido com sucesso.`,
                    variant: "destructive"
                });

                await fetchAdmins();

            } catch (error) {
                console.error("Erro na exclusão:", error);
                toast({
                    title: "Erro na Exclusão",
                    description: error instanceof Error ? error.message : "Erro desconhecido ao excluir.",
                    variant: "destructive",
                });
            }
        }
    };

    // --- JSX ---

    const filteredAdmins = useMemo(() => admins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [admins, searchTerm]);


    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
            <HeaderSecretaria />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">Gerenciamento de Administradores</h1>
                    
                </div>

                {/* --- Card de Edição de Administrador (NOVO) --- */}
                {isAdmin && editingAdmin && (
                    <Card className="mb-8 border-primary">
                        <CardHeader className="bg-primary/10">
                            <CardTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5" /> Editando: {editingAdmin.name}
                            </CardTitle>
                            <CardDescription>Atualize as informações do administrador. A senha só será alterada se você preencher o campo.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleUpdateAdmin} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        name="name"
                                        placeholder="Nome Completo"
                                        value={editData.name}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="E-mail"
                                        value={editData.email}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="Nova Senha (deixe vazio para manter)"
                                        value={editData.password}
                                        onChange={handleEditInputChange}
                                    />
                                    <Input
                                        name="phone"
                                        placeholder="Telefone (Opcional)"
                                        value={editData.phone}
                                        onChange={handleEditInputChange}
                                    />
                                </div>
                                <div className="flex gap-4 justify-end">
                                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* --- Card de Cadastro de Novo Administrador --- */}
                {isAdmin && (
                    <Card className="mb-8">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Adicionar Novo Administrador</CardTitle>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAddAdminForm(prev => !prev)}
                                    className="gap-2"
                                >
                                    {showAddAdminForm ? "Ocultar Formulário" : "Novo Admin"}
                                    {showAddAdminForm ? <ChevronUp className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                </Button>
                            </div>
                            {showAddAdminForm && (
                                <CardDescription>Preencha os dados do novo administrador. **A senha será o acesso inicial.**</CardDescription>
                            )}
                        </CardHeader>

                        {showAddAdminForm && (
                            <CardContent>
                                <form onSubmit={handleAddAdmin} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            name="name"
                                            placeholder="Nome Completo"
                                            value={newAdminData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <Input
                                            name="email"
                                            type="email"
                                            placeholder="E-mail"
                                            value={newAdminData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <Input
                                            name="password"
                                            type="password"
                                            placeholder="Senha Inicial"
                                            value={newAdminData.password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <Input
                                            name="phone"
                                            placeholder="Telefone (Opcional)"
                                            value={newAdminData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full md:w-auto mt-4" disabled={!newAdminData.name || !newAdminData.email || !newAdminData.password || isLoading}>
                                        <UserPlus className="h-4 w-4 mr-2" /> Cadastrar Administrador
                                    </Button>
                                </form>
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* --- Card da Lista de Administradores --- */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle>Lista de Administradores</CardTitle>
                                <CardDescription>Total de {admins.length} usuários cadastrados</CardDescription>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar administrador..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-center text-muted-foreground p-6">Carregando administradores...</p>
                        ) : error ? (
                            <div className="text-center p-6 text-red-500 border border-red-300 rounded-md bg-red-50/50">
                                <p className="font-semibold">❌ Ocorreu um Erro na Conexão:</p>
                                <p className="text-sm italic">{error}</p>
                                <Button onClick={fetchAdmins} className="mt-3" variant="outline">Tentar Novamente</Button>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>E-mail</TableHead>
                                            <TableHead>Telefone</TableHead>
                                            <TableHead>Data Cadastro</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAdmins.length > 0 ? (
                                            filteredAdmins.map((admin) => (
                                                <TableRow key={admin.id}>
                                                    <TableCell className="font-medium">{admin.name}</TableCell>
                                                    <TableCell>{admin.email}</TableCell>
                                                    <TableCell>{admin.phone}</TableCell>
                                                    <TableCell>{admin.joined}</TableCell>
                                                    {isAdmin && (
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    title="Editar Admin"
                                                                    onClick={() => handleStartEdit(admin)}
                                                                    disabled={editingAdmin !== null}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                                                                    title="Excluir Administrador"
                                                                    disabled={editingAdmin !== null}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground p-6">
                                                    Nenhum administrador encontrado.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default AdminMembros;