import { useNavigate } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../Redux/auth/thunks";


export const Logout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(logoutUser());

        setTimeout(() => {
            navigate("/")
        }, 2000);
    }, [])

    return (
        <>
            <h1>Logout</h1>
            <p>Has cerrado sesión satisfactoriamente</p>
        </>
    )
}
