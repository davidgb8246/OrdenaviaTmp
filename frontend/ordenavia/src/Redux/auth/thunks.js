import { api, setAxiosAccessToken } from '../../utils/axios';
import { resetLoggedInUser, setLoggedInUser } from './userSlice';


export const registerUser = (userData) => {
    return async (dispatch) => {
        try {
            const response = await api.post('/auth/register/', userData);
            // Handle successful response
            console.log(response);
        } catch (error) {
            // Check if the error is a response error (from the server)
            const { status, errors } = JSON.parse(error.response.request.response);
            console.log("Registration error:", status);
            console.log(errors);
        }
    };
};


export const loginUser = (userData) => {
    return async (dispatch) => {
        try {
            const response = await api.post('/auth/login/', userData);
            const { data } = response.data;

            const { access_token, user } = data;
            dispatch(setLoggedInUser({ user, access_token }));

            return true;
        } catch (error) {
            console.log(error);
            const { status, errors } = JSON.parse(error.response.request.response);
            console.log("Login status:", status);
            console.log("Login errors:", errors);

            return false;
        }
    };
}


export const logoutUser = () => {
    return async (dispatch) => {
        try {
            const response = await api.post('/auth/logout/');
            console.log(response);
            const { status } = response.data;

            if (status !== "AUTH_LOGOUT_SUCCESS") {
                console.log("Logout error:", status);
                return false;
            }

            console.log("Logout success:", status);
            return true;

        } catch (error) {
            console.log("Logout error:", error);
            return false;
            
        } finally {
            dispatch(resetLoggedInUser());
            setAxiosAccessToken(undefined);
        }
    };
}