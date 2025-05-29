import { useNavigate } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../Redux/auth/thunks";


export const Register = () => {
    const { 
        onInputChange, 
        onResetForm, 
        email, 
        password, 
        password_confirm,
        first_name, 
        last_name, 
        birth_date, 
        username, 
        phone, 
        gender, 
        errorMessage 
    } = useForm({
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        birth_date: '',
        username: '',
        phone: '',
        gender: '',
        errorMessage: undefined,
    });

    const dispatch = useDispatch();

    const onSubmit = (e) => {
        e.preventDefault();

        // Field validation
        if (!first_name.trim()) {
            onInputChange({ target: { name: "errorMessage", value: "First name is required" } });
            return;
        }
        if (!last_name.trim()) {
            onInputChange({ target: { name: "errorMessage", value: "Last name is required" } });
            return;
        }
        if (!birth_date.trim()) {
            onInputChange({ target: { name: "errorMessage", value: "Birth date is required" } });
            return;
        }
        if (!username.trim()) {
            onInputChange({ target: { name: "errorMessage", value: "Username is required" } });
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            onInputChange({ target: { name: "errorMessage", value: "Valid email is required" } });
            return;
        }
        if (!phone.trim()) {
            onInputChange({ target: { name: "errorMessage", value: "Phone number is required" } });
            return;
        }
        if (!password.trim()) {
            onInputChange({ target: { name: "errorMessage", value: "Password is required" } });
            return;
        }
        if (!password_confirm.trim()) {
            onInputChange({ target: { name: "errorMessage", value: "Confirm password is required" } });
            return;
        }
        if (!gender.trim()) {
            onInputChange({ target: { name: "errorMessage", value: "Gender is required" } });
            return;
        }

        if (password !== password_confirm) {
            onInputChange({ target: { name: "errorMessage", value: "Passwords do not match" } });
            return;
        }

        // Dispatch registration action
        dispatch(registerUser({
            first_name,
            last_name,
            birth_date,
            username,
            email,
            phone,
            password,
            gender
        }));
    };

    return (
        <>
            <h1>Registro</h1>

            {errorMessage && <p>{errorMessage}</p>}

            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    placeholder="Nombre"
                    name="first_name"
                    value={first_name}
                    autoComplete="given-name"
                    onChange={onInputChange}
                />
                <br />
                <br />

                <input
                    type="text"
                    placeholder="Apellidos"
                    name="last_name"
                    value={last_name}
                    autoComplete="family-name"
                    onChange={onInputChange}
                />
                <br />
                <br />

                <input
                    type="date"
                    placeholder="Fecha de nacimiento"
                    name="birth_date"
                    value={birth_date}
                    autoComplete="bday"
                    onChange={onInputChange}
                />
                <br />
                <br />

                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    name="username"
                    value={username}
                    autoComplete="username"
                    onChange={onInputChange}
                />
                <br />
                <br />

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
                    type="tel"
                    placeholder="Telefono"
                    name="phone"
                    value={phone}
                    autoComplete="tel"
                    onChange={onInputChange}
                />
                <br />
                <br />

                <select
                    name="gender"
                    value={gender}
                    autoComplete="sex"
                    onChange={onInputChange}
                >
                    <option value="">Selecciona un genero</option>
                    <option value="M">Hombre</option>
                    <option value="F">Mujer</option>
                    <option value="O">Otro</option>
                </select>
                <br />
                <br />

                <input
                    type="password"
                    placeholder="Contraseña"
                    name="password"
                    value={password}
                    autoComplete="new-password"
                    onChange={onInputChange}
                />
                <br />
                <br />

                <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    name="password_confirm"
                    value={password_confirm}
                    autoComplete="new-password"
                    onChange={onInputChange}
                />
                <br />
                <br />

                <button type="submit">Enviar</button>
            </form>
        </>
    );
};
