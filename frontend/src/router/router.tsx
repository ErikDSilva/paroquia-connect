import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/home.tsx";
import HomeAdmin from "../pages/home/home-admin.tsx";
import Avisos from "../pages/avisos/index.tsx"
import Contato from "../pages/contatos/index.tsx"
import Horarios from "../pages/horarios/index.tsx";
import Eventos from "../pages/eventos/eventos.tsx";
import AdminAgenda from "@/pages/admin/agenda/admin-agenda.tsx";
import AdminEventos from "@/pages/admin/eventos/admin-evento.tsx";
import AdminAvisos from "@/pages/admin/avisos/admin-avisos.tsx";
import AdminMembros from "@/pages/admin/membros/admin-membro.tsx";

import ErrorPage from "./error-page.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />
    ,
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
    {
    path: "/admin",
    element: <HomeAdmin />,
    errorElement: <ErrorPage />
    ,
  },
  {
    path: "/admin/agenda",
    element: <AdminAgenda />,
    errorElement: <ErrorPage />
    ,
  },
  {
    path: "/admin/eventos",
    element: <AdminEventos />,
    errorElement: <ErrorPage />
    ,
  },
  {
    path: "/admin/avisos",
    element: <AdminAvisos />,
    errorElement: <ErrorPage />
  },
  {
    path: "/admin/membros",
    element: <AdminMembros />,
    errorElement: <ErrorPage />
  }
])

export default router;
