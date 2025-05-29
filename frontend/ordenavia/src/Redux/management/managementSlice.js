import { createSlice } from "@reduxjs/toolkit";
import { ENVS } from "../../utils/envs";

const initialState = {
    restaurantsList: [],
    restaurant: null,
}

export const managementSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setState: (state, { payload: newState }) => {
            Object.assign(state, newState);
        },

        setRestaurantsList: (state, { payload: restaurantsList }) => {
            const restaurants = restaurantsList.map((restaurant) => {
                return {
                    ...restaurant,
                    image: restaurant.image ? `${ENVS.BACKEND_URL}${restaurant.image}` : null,
                }
            });

            state.restaurantsList = restaurants;
        },

        setRestaurant: (state, { payload: restaurant }) => {
            restaurant.image = restaurant.image ? `${ENVS.BACKEND_URL}${restaurant.image}` : null;
            state.restaurant = restaurant;
        },
    }
})

export const { setState, setRestaurantsList, setRestaurant } = managementSlice.actions;
