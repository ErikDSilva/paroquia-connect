import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/home.tsx";
import Avisos from "../pages/avisos/index.tsx"
import Contato from "../pages/contatos/index.tsx"
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
  }
])

export default router;
