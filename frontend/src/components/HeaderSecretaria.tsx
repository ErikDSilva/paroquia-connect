import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { LogOut, ExternalLink, Menu } from "lucide-react"; // Certifique-se de que o Menu vem do lucide-react
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Definimos os links em um array para facilitar a manutenção
const adminLinks = [
  { to: "/admin", label: "Início", end: true },
  { to: "/admin/agenda", label: "Agenda" },
  { to: "/admin/eventos", label: "Eventos" },
  { to: "/admin/avisos", label: "Avisos" },
  { to: "/admin/horarios", label: "Horários" },
  { to: "/admin/membros", label: "Membros" },
];

export const HeaderSecretaria = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    console.log("Usuário deslogado");
    navigate("/auth");
  };

  const renderNavLinks = (isMobile = false) => (
    adminLinks.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        onClick={isMobile ? () => setIsMenuOpen(false) : undefined}
        className={
          isMobile
            ? "flex w-full py-3 text-lg font-semibold text-foreground/80 hover:text-primary transition-colors border-b border-muted"
            : "px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
        }
        activeClassName={isMobile ? "text-primary" : "text-primary bg-secondary"}
      >
        {link.label}
      </NavLink>
    ))
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* LOGO */}
        <Link to="/admin" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:gap-2">
            <span className="font-bold text-xl text-primary leading-tight">Paróquia</span>
            <span className="text-xs md:text-sm text-muted-foreground font-medium">| Painel</span>
          </div>
        </Link>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden lg:flex items-center gap-1">
          {renderNavLinks()}
        </nav>

        {/* AÇÕES (Sair/Ver Site/Menu Mobile) */}
        <div className="flex items-center gap-2">
          
          {/* Botões visíveis apenas em Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver site
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>

          {/* MENU MOBILE (Hamburguer) */}
          <div className="lg:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir Menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader className="text-left">
                  <SheetTitle className="text-primary">Menu Administrativo</SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col mt-6">
                  {renderNavLinks(true)}
                </nav>

                <div className="flex flex-col gap-3 mt-8 pt-6 border-t">
                  <Button variant="ghost" className="justify-start px-0" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/" target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver site público
                    </Link>
                  </Button>
                  <Button variant="destructive" className="justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da Conta
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
        </div>
      </div>
    </header>
  );
};