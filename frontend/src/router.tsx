import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home.tsx";
import App from "./pages/avisos/app.tsx"


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/avisos" element={< App/>} />
        {/* <Route path="/avisos" element={< />} />
        <Route path="/horarios" element={< />} />
        <Route path="/eventos" element={< />} />
        <Route path="/contato" element={< />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
