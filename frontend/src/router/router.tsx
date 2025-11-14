import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/home.tsx";
import HomeAdmin from "../pages/home/home-admin.tsx";
import Avisos from "../pages/avisos/index.tsx"
import Contato from "../pages/contatos/index.tsx"
import Horarios from "../pages/horarios/index.tsx";
import Eventos from "../pages/eventos/eventos.tsx";

import ErrorPage from "./error-page.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />
    ,
  },
  {
    path: "/admin",
    element: <HomeAdmin />,
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
  }
])

export default router;
