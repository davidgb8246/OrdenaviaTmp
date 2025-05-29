import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user_logged: undefined,
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setState: (state, { payload: newState }) => {
            Object.assign(state, newState);
        },

        setLoggedInUser: (state, { payload: data }) => {
            const { user, access_token } = data;

            state.user_logged = {
                data: user,
                access_token: access_token,
            };
        },

        setAccessToken: (state, { payload: access_token }) => {
            if (state.user_logged) {
                state.user_logged.access_token = access_token;
            }
        },

        setUserData: (state, { payload: user }) => {
            if (state.user_logged) {
                state.user_logged.data = user;
            }
        },

        resetLoggedInUser: (state, action) => {
            state.user_logged = undefined;
        },
    }
})

export const { setState, setLoggedInUser, setAccessToken, setUserData, resetLoggedInUser } = userSlice.actions;
