import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Lista de links
const navLinks = [
  { to: "/", label: "Início" },
  { to: "/avisos", label: "Avisos" },
  { to: "/horarios", label: "Horários" },
  { to: "/eventos", label: "Eventos" },
  { to: "/contato", label: "Contato" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const renderNavLinks = (isMobile = false) => (
    navLinks.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={isMobile ? handleLinkClick : undefined}
        className={
          isMobile
            /* MOBILE (Fundo Branco): Mantém texto escuro */
            ? "flex w-full py-3 text-lg font-medium text-slate-600 hover:text-[#002366] hover:bg-slate-50 rounded-md px-2 transition-colors"
            /* DESKTOP (Fundo Azul): Texto claro para contraste */
            : "px-4 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-all"
        }
        activeClassName={
          isMobile 
            ? "text-[#002366] font-bold bg-blue-50" // Mobile Ativo
            : "text-white font-bold bg-white/20 shadow-sm" // Desktop Ativo (Fundo translúcido branco)
        }
      >
        {link.label}
      </NavLink>
    ))
  );

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out border-b ${
        isScrolled 
          /* ROLANDO: Azul Marinho com transparência (Vidro) + Sombra */
          ? "bg-[#002366]/90 backdrop-blur-md shadow-md border-white/10 supports-[backdrop-filter]:bg-[#002366]/85"
          /* NO TOPO: Azul Marinho mais sólido (ou suave) sem sombra */
          : "bg-[#002366] border-transparent shadow-none"
      }`}
    >
      <div className="container px-6 flex h-16 items-center justify-between">
        
        {/* LOGO - Cores Invertidas para fundo escuro */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Círculo agora é BRANCO para destacar no azul */}
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-blue-50 transition-colors">
            {/* Letra 'P' agora é Azul */}
            <span className="text-[#002366] font-bold text-lg">P</span>
          </div>
          {/* Texto 'Paróquia' agora é Branco */}
          <span className="font-bold text-xl text-white tracking-tight group-hover:text-blue-100 transition-colors">
            Paróquia
          </span>
        </Link>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden md:flex items-center gap-1">
          {renderNavLinks()}
        </nav>

        {/* MENU SANDUÍCHE (Mobile) */}
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Abrir Menu"
                // Ícone Branco no header azul
                className="text-white hover:bg-white/10"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            
            {/* Conteúdo do Menu Mobile (Mantém fundo branco padrão para legibilidade) */}
            <SheetContent side="right" className="w-[280px] sm:w-[300px] bg-white border-l-gray-200">
              <SheetHeader className="text-left border-b border-gray-100 pb-4 mb-4">
                <SheetTitle className="text-[#002366] text-xl font-bold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#002366] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {renderNavLinks(true)}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
};