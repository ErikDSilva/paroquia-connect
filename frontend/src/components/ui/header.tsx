import { Link } from "react-router-dom";
import { Button } from "./button";

export default function Header() {
  return (
    <header className="bg-gray-300 flex items-center justify-between px-8 py-3">
      {/* Logo e título */}
      <div className="flex items-center space-x-3">
        <div className="w-16 h-16 bg-blue-900 rounded-full"></div>
        <h1 className="text-2xl font-bold text-blue-900">Paroquia</h1>
      </div>

      {/* Links de navegação */}
      <nav className="flex space-x-6 text-lg font-semibold text-blue-900">
        <Link to="/avisos" className="hover:underline">Avisos</Link>
        <Link to="#horarios" className="hover:underline">Horarios</Link>
        <Link to="#eventos" className="hover:underline">Eventos</Link>
        <Link to="#contato" className="hover:underline">Contato</Link>
      </nav>


      <Button variant="outline" className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold px-6 py-2 rounded-lg" asChild>
        <Link to="#">Login</Link>
      </Button>
    </header>
  );
}
