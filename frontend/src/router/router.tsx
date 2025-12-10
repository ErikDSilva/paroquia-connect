import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/home.tsx";
import HomeAdmin from "../pages/home/home-admin.tsx";
import Avisos from "../pages/avisos/index.tsx"
import Contato from "../pages/contatos/index.tsx"
import Horarios from "../pages/horarios/index.tsx";
import Eventos from "../pages/eventos/eventos.tsx";
import Auth from "../pages/auth.tsx"; 
import ProtectedRoute from "@/components/ProtectedRoute.tsx";

// Admin Pages
import AdminAgenda from "@/pages/admin/agenda/admin-agenda.tsx";
import AdminEventos from "@/pages/admin/eventos/admin-evento.tsx";
import AdminAvisos from "@/pages/admin/avisos/admin-avisos.tsx";
import AdminMembros from "@/pages/admin/membros/admin-membro.tsx";
import AdminHorarios from "@/pages/admin/horarios/admin-horario.tsx";

import ErrorPage from "./error-page.tsx";

const router = createBrowserRouter([
  // Rota Pública de Login
  {
    path: "/auth",
    element: <Auth />,
    errorElement: <ErrorPage />
  },
  
  // Rotas Públicas
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/avisos",
    element: <Avisos />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/contato",
    element: <Contato />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/horarios",
    element: <Horarios />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/eventos",
    element: <Eventos />,
    errorElement: <ErrorPage />,
  },

  // --- ÁREA RESTRITA (ADMIN) ---
  {
    element: <ProtectedRoute onlyAdmin={true} />, // Protege todas as rotas filhas abaixo
    errorElement: <ErrorPage />,
    children: [
        {
            path: "/admin",
            element: <HomeAdmin />,
        },
        {
            path: "/admin/agenda",
            element: <AdminAgenda />,
        },
        {
            path: "/admin/eventos",
            element: <AdminEventos />,
        },
        {
            path: "/admin/avisos",
            element: <AdminAvisos />,
        },
        {
            path: "/admin/membros",
            element: <AdminMembros />,
        },
        {
            path: "/admin/horarios",
            element: <AdminHorarios />,
        }
    ]
  }
]);

export default router;