import { NavLink } from "react-router-dom"
import { useSelector } from "react-redux";


export const Navbar = () => {
    const userState = useSelector((state) => state.user);

    return (
        <>
            <nav>
                <div className="flex flex-row gap-3">

                    <NavLink to="/">
                        Inicio
                    </NavLink>

                    <NavLink to="/register">
                        Registrarse
                    </NavLink>

                    <NavLink to="/login">
                        Logearse
                    </NavLink>

                    <NavLink to="/logout">
                        Salir
                    </NavLink>

                    <NavLink to="/create_restaurant">
                        Crear Restaurante
                    </NavLink>

                    <NavLink to="/list_restaurants">
                        Listado de restaurantes
                    </NavLink>

                </div>
            </nav>
        </>
    )
}
