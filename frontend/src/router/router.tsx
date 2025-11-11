import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/home.tsx";
import Avisos from "../pages/avisos/app.tsx";
import Contatos from "../pages/contatos/index.tsx";
import ErrorPage from "./error-page.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage/>
    ,
  },
  {
    path: "/avisos",
    element: <Avisos />,
    errorElement: <ErrorPage/>,
  },
  {
    path: "/contatos",
    element: <Contatos />,
    errorElement: <ErrorPage/>,
  }
])

export default router;
