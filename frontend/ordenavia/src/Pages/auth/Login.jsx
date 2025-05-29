import { useForm } from "../../hooks/useForm";
import { useDispatch } from "react-redux";
import { loginUser, registerUser } from "../../Redux/auth/thunks";


export const Login = () => {
    const { 
        onInputChange, 
        onResetForm, 
        email, 
        password, 
        errorMessage 
    } = useForm({
        email: '',
        password: '',
        errorMessage: undefined,
    });

    const dispatch = useDispatch();

    const onSubmit = (e) => {
        e.preventDefault();

        // Field validation
        if (!email.trim() || !email.includes('@')) {
            onInputChange({ target: { name: "errorMessage", value: "Valid email is required" } });
            return;
        }
        if (!password.trim()) {
            onInputChange({ target: { name: "errorMessage", value: "Password is required" } });
            return;
        }

        // Dispatch registration action
        dispatch(loginUser({
            email,
            password,
        }));
    };

    return (
        <>
            <h1>Login</h1>

            {errorMessage && <p>{errorMessage}</p>}

            <form onSubmit={onSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={email}
                    autoComplete="email"
                    onChange={onInputChange}
                />
                <br />
                <br />

                <input
                    type="password"
                    placeholder="Contraseña"
                    name="password"
                    value={password}
                    autoComplete="current-password"
                    onChange={onInputChange}
                />
                <br />
                <br />

                <button type="submit">Enviar</button>
            </form>
        </>
    );
};
