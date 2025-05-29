import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

import { Register } from '../Pages/auth/Register'
import { Login } from '../Pages/auth/Login'
import { Logout } from '../Pages/auth/Logout'

import { Inicio } from '../Pages/Inicio'

import { UnauthRequiredRoutes } from '../Routes/UnauthRequiredRoutes'
import { AuthRequiredRoutes } from '../Routes/AuthRequiredRoutes'
import { AdminRoleRoutes } from '../Routes/AdminRoleRoutes'

import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { setState } from '../Redux/auth/userSlice'
import { setAxiosAccessToken } from '../utils/axios'
import { ENVS } from '../utils/envs'
import { setNavigator } from '../utils/navigateService'
import { CreateRestaurant } from '../Pages/management/CreateRestaurant'
import { ListRestaurants } from '../Pages/management/ListRestaurants'
import { RestaurantDetail } from '../Pages/orders/menu/RestaurantDetail'
import { EditRestaurant } from '../Pages/management/EditRestaurant'


export const AppRoute = () => {
    const userState = useSelector((state) => state.user);
    const token = useSelector((state) => state.user.user_logged?.access_token);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setNavigator(navigate);
    }, [navigate]);

    useEffect(() => {
        let data = ENVS.FRONTEND_STORAGE_METHOD.getItem(ENVS.FRONTEND_STORAGE_KEY);
        if (!data) return;

        data = JSON.parse(data);
        dispatch(setState(data));
    }, []);

    useEffect(() => {
        if (token) {
            setAxiosAccessToken(token);
        }
    }, [token]);

    useEffect(() => {
        ENVS.FRONTEND_STORAGE_METHOD.setItem(ENVS.FRONTEND_STORAGE_KEY, JSON.stringify(userState));
    }, [userState]);

    return (
        <>
            <h1>Ordenavia</h1>
            <Navbar />

            <hr />

            <Routes>
                <Route path='/' element={<Inicio />} />

                <Route path='/list_restaurants' element={<ListRestaurants />} />
                <Route path='/restaurant/:id' element={<RestaurantDetail />} />
                <Route path='/create_restaurant' element={<CreateRestaurant />} />
                <Route path='/edit_restaurant/:id' element={<EditRestaurant />} />

                <Route element={<UnauthRequiredRoutes />}>
                    <Route path='/register' element={<Register />} />
                    <Route path='/login' element={<Login />} />
                </Route>

                <Route element={<AuthRequiredRoutes />}>
                    <Route path='/logout' element={<Logout />} />

                    <Route element={<AdminRoleRoutes />}>
                        <Route path='/test' element={<Inicio />} />
                    </Route>
                </Route>

                <Route path='/*' element={<Navigate to={'/'} replace />} />
            </Routes>
        </>
    )
}