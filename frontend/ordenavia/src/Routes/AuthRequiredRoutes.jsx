import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom'

export const AuthRequiredRoutes = () => {
    const { user_logged } = useSelector((state) => state.user);

    if (!user_logged) {
        return <Navigate to={'/'} replace />
    }

    return <Outlet />
}
