import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl text-primary">Paróquia</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/avisos"
            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            activeClassName="text-primary bg-secondary"
          >
            Avisos
          </NavLink>
          <NavLink
            to="/horarios"
            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            activeClassName="text-primary bg-secondary"
          >
            Horários
          </NavLink>
          <NavLink
            to="/eventos"
            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            activeClassName="text-primary bg-secondary"
          >
            Eventos
          </NavLink>
          <NavLink
            to="/contato"
            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            activeClassName="text-primary bg-secondary"
          >
            Contato
          </NavLink>
        </nav>

        <Button asChild className="bg-accent hover:bg-accent/90">
          <Link to="/auth">Login</Link>
        </Button>
      </div>
    </header>
  );
};
