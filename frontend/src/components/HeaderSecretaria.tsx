import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { LogOut, ExternalLink } from "lucide-react"; 

export const HeaderSecretaria = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Usuário deslogado");
    navigate("/auth"); 
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        
        <Link to="/admin" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl text-primary">Paróquia</span>
          <span className="text-sm text-muted-foreground font-medium">| Painel</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/admin"
            end 
            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            activeClassName="text-primary bg-secondary"
          >
            Início
          </NavLink>
          <NavLink
            to="/admin/agenda"
            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            activeClassName="text-primary bg-secondary"
          >
            Agenda
          </NavLink>
          <NavLink
            to="/admin/eventos"
            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            activeClassName="text-primary bg-secondary"
          >
            Eventos
          </NavLink>
          <NavLink
            to="/admin/avisos"
            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            activeClassName="text-primary bg-secondary"
          >
            Avisos
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          
          {/* Botão para ver a home pública */}
          <Button variant="ghost" size="sm" asChild>
            <Link 
              to="/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver site
            </Link>
          </Button>

          {/* Botão de Sair (Logout) */}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>

        </div>

      </div>
    </header>
  );
};