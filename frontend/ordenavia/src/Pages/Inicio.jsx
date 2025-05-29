import { useSelector } from "react-redux";



export const Inicio = () => {
    const userState = useSelector((state) => state.user);
    const user = userState.user_logged;
    const userData = user ? user.data : undefined;
    const userAccessToken = user ? user.access_token : undefined;

    return (
        <>
            <h1>Inicio</h1>

            <h2>Usuario</h2>
            <pre>
                {JSON.stringify(userData, null, 2)}
            </pre>
            <h2>Token</h2>
            <pre>
                {JSON.stringify(userAccessToken, null, 2)}
            </pre>
        </>
    )
}