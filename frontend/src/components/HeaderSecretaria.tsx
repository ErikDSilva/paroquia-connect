import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { LogOut, ExternalLink, Menu } from "lucide-react"; 
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Links administrativos
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
  const [isScrolled, setIsScrolled] = useState(false); // Estado do Scroll

  // Detecta a rolagem
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            /* MOBILE (Fundo Branco): Texto escuro */
            ? "flex w-full py-3 text-lg font-semibold text-slate-700 hover:text-[#002366] hover:bg-blue-50 transition-colors border-b border-gray-100 px-2 rounded-md"
            /* DESKTOP (Fundo Azul): Texto claro */
            : "px-4 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        }
        activeClassName={
          isMobile 
            ? "text-[#002366] bg-blue-50 border-l-4 border-[#002366]" 
            : "text-white bg-white/20 shadow-sm font-bold"
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
          /* ROLANDO: Azul com transparência e Sombra */
          ? "bg-[#002366]/90 backdrop-blur-md shadow-md border-white/10 supports-[backdrop-filter]:bg-[#002366]/85"
          /* NO TOPO: Azul Sólido Limpo */
          : "bg-[#002366] border-transparent shadow-none"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* LOGO (Adaptado para fundo Azul) */}
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:bg-blue-50 transition-colors">
            <span className="text-[#002366] font-bold text-lg">P</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:gap-2">
            <span className="font-bold text-xl text-white leading-tight">Paróquia</span>
            <span className="text-xs md:text-sm text-blue-200 font-medium">| Painel</span>
          </div>
        </Link>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden lg:flex items-center gap-1">
          {renderNavLinks()}
        </nav>

        {/* AÇÕES (Sair/Ver Site/Menu Mobile) */}
        <div className="flex items-center gap-2">
          
          {/* Botões Desktop (Estilizados para fundo Azul) */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="text-blue-100 hover:text-white hover:bg-white/10"
            >
              <Link to="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver site
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-white/20 bg-transparent text-white hover:bg-white hover:text-[#002366] transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>

          {/* MENU MOBILE (Hamburguer) */}
          <div className="lg:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Abrir Menu"
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-[280px] bg-white">
                <SheetHeader className="text-left border-b pb-4 mb-4">
                  <SheetTitle className="text-[#002366] flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#002366] flex items-center justify-center">
                      <span className="text-white text-xs">P</span>
                    </div>
                    Menu Admin
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col">
                  {renderNavLinks(true)}
                </nav>

                {/* Rodapé do Menu Mobile */}
                <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-gray-100">
                  <Button variant="ghost" className="justify-start px-2 text-slate-600 hover:text-[#002366]" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/" target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver site público
                    </Link>
                  </Button>
                  <Button variant="destructive" className="justify-start shadow-sm" onClick={handleLogout}>
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