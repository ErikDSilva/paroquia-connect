import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";


interface ProtectedRouteProps {
    onlyAdmin?: boolean;
}



const ProtectedRoute = ({ onlyAdmin = false }: ProtectedRouteProps) => {

    const { user, isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) return <div className="p-4">Carregando...</div>;


    // 1. Não logado -> Vai para Login

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }




    // 3. Se passou, renderiza a rota filha (O AdminDashboard, AdminEventos, etc)

    return <Outlet />;

};



export default ProtectedRoute;