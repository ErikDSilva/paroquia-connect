import { useState } from "react";
import { Link } from "react-router-dom";
// IMPORTAÇÕES NECESSÁRIAS
import { Menu } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Você precisa ter o Sheet instalado

// Lista de links para simplificar a renderização
const navLinks = [
  { to: "/", label: "Início" },
  { to: "/avisos", label: "Avisos" },
  { to: "/horarios", label: "Horários" },
  { to: "/eventos", label: "Eventos" },
  { to: "/contato", label: "Contato" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Função para fechar o menu ao clicar em um link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Funções para renderizar os links (usadas na navegação normal e no menu sanduíche)
  const renderNavLinks = (isMobile = false) => (
    navLinks.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={isMobile ? handleLinkClick : undefined} // Fecha o menu apenas no mobile
        className={
          isMobile
            ? "flex w-full py-3 text-lg font-semibold text-foreground/80 hover:text-primary transition-colors"
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
      <div className="container flex h-16 items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl text-primary">Paróquia</span>
        </Link>

        {/* NAVEGAÇÃO DESKTOP (Mostrada apenas em telas médias ou maiores) */}
        <nav className="hidden md:flex items-center gap-1">
          {renderNavLinks()}
        </nav>

        {/* MENU SANDUÍCHE (Mostrado apenas em telas pequenas) */}
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                aria-label="Abrir Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle>Navegação</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {/* Links para o Menu Mobile */}
                {renderNavLinks(true)}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* BOTÃO DE LOGIN REMOVIDO */}
        {/* Você tinha: <Button asChild className="bg-accent hover:bg-accent/90"> <Link to="/auth">Login</Link> </Button> */}

      </div>
    </header>
  );
};