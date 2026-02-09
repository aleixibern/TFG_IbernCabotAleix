import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = () => {
    // 1. Mirem si tenim la clau d'accés
    const token = localStorage.getItem('token');

    // 2. Si hi és, deixem passar (Outlet). Si no, fem fora a /login.
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};