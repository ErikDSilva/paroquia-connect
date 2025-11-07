import React from "react";

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
        <a href="#avisos" className="hover:underline">Avisos</a>
        <a href="#horarios" className="hover:underline">Horarios</a>
        <a href="#eventos" className="hover:underline">Eventos</a>
        <a href="#contato" className="hover:underline">Contato</a>
      </nav>

      {/* Botão de login */}
      <button className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold px-6 py-2 rounded-lg">
        Login
      </button>
    </header>
  );
}
