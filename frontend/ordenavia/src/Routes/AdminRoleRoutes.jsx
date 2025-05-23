import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom'

export const AdminRoleRoutes = () => {
    const { user_logged } = useSelector((state) => state.user);

    if (user_logged.rol != "admin") {
        return <Navigate to={'/'} replace />
    }

    return <Outlet />
}
